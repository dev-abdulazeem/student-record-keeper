const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Student = require('../models/Student');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
const getAnnouncements = async (req, res) => {
  try {
    const { category, targetAudience } = req.query;
    let query = {};

    // Filter by category
    if (category) query.category = category;

    // Filter by target audience
    if (targetAudience) {
      query.targetAudience = targetAudience;
    } else {
      // Show announcements meant for user or 'all'
      query.$or = [
        { targetAudience: 'all' },
        { targetAudience: req.user.role + 's' }, // 'students', 'teachers'
      ];
    }

    // Don't show expired announcements
    query.$or = query.$or || [];
    query.$or.push(
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    );

    const announcements = await Announcement.find(query)
      .populate('postedBy', 'fullName role')
      .sort({ isPinned: -1, createdAt: -1 });

    // Add read status for current user
    const announcementsWithReadStatus = announcements.map((ann) => {
      const isRead = ann.readBy.some(
        (r) => r.user.toString() === req.user._id.toString()
      );
      return {
        ...ann.toObject(),
        isRead,
      };
    });

    res.json({ success: true, count: announcementsWithReadStatus.length, data: announcementsWithReadStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single announcement
// @route   GET /api/announcements/:id
// @access  Private
const getAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate(
      'postedBy',
      'fullName role'
    );

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    // Mark as read when viewed
    const alreadyRead = announcement.readBy.some(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      announcement.readBy.push({ user: req.user._id });
      await announcement.save();
    }

    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create announcement (Admin only)
// @route   POST /api/announcements
// @access  Private (Admin)
const createAnnouncement = async (req, res) => {
  try {
    const { title, content, category, targetAudience, targetClass, isPinned, expiresAt } = req.body;

    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'general',
      postedBy: req.user._id,
      targetAudience: targetAudience || 'all',
      targetClass,
      isPinned: isPinned || false,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });

    // Create notifications for target users
    await createNotificationsForAnnouncement(announcement);

    const populatedAnnouncement = await Announcement.findById(announcement._id).populate(
      'postedBy',
      'fullName role'
    );

    res.status(201).json({ success: true, data: populatedAnnouncement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: Create notifications for target users
const createNotificationsForAnnouncement = async (announcement) => {
  try {
    let targetUsers = [];

    if (announcement.targetAudience === 'all') {
      targetUsers = await User.find({ isActive: true }).select('_id');
    } else if (announcement.targetAudience === 'students') {
      targetUsers = await User.find({ role: 'student', isActive: true }).select('_id');
    } else if (announcement.targetAudience === 'teachers') {
      targetUsers = await User.find({ role: 'teacher', isActive: true }).select('_id');
    } else if (announcement.targetAudience === 'specific_class' && announcement.targetClass) {
      const students = await Student.find({ class: announcement.targetClass }).populate('user');
      targetUsers = students.map((s) => ({ _id: s.user._id }));
    }

    // Create notifications in bulk
    const notifications = targetUsers.map((user) => ({
      user: user._id,
      type: 'announcement',
      title: `New Announcement: ${announcement.title}`,
      message: announcement.content.substring(0, 100) + '...',
      relatedId: announcement._id,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (error) {
    console.error('Error creating notifications:', error);
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin)
const updateAnnouncement = async (req, res) => {
  try {
    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true }
    ).populate('postedBy', 'fullName role');

    res.json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin)
const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    // Delete related notifications
    await Notification.deleteMany({ relatedId: announcement._id, type: 'announcement' });

    await announcement.deleteOne();
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark announcement as read
// @route   PUT /api/announcements/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    const alreadyRead = announcement.readBy.some(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      announcement.readBy.push({ user: req.user._id });
      await announcement.save();
    }

    // Also mark notification as read
    await Notification.findOneAndUpdate(
      { user: req.user._id, relatedId: req.params.id, type: 'announcement' },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAsRead,
};