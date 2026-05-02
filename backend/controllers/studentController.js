const Student = require('../models/Student');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Generate student email: student{rollNumber}@school.edu
const generateStudentEmail = (rollNumber) => {
  return `student${rollNumber}@school.edu`.toLowerCase();
};

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Teacher)
const getStudents = async (req, res) => {
  try {
    const { class: className, section, status, search } = req.query;
    let query = {};

    if (className) query.class = className;
    if (section) query.section = section;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(query)
      .populate('user', 'fullName email phone isActive')
      .sort({ createdAt: -1 });

    let filteredStudents = students;
    if (search) {
      filteredStudents = students.filter(s => 
        s.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNumber?.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({ success: true, count: filteredStudents.length, data: filteredStudents });
  } catch (error) {
    console.error('GetStudents error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single student by student ID
// @route   GET /api/students/:id
// @access  Private
const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      'user',
      'fullName email phone avatar isActive'
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (req.user.role === 'student' && student.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this student' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student by user ID (for logged-in student to view their own profile)
// @route   GET /api/students/by-user/:userId
// @access  Private
const getStudentByUserId = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.params.userId }).populate(
      'user',
      'fullName email phone avatar isActive'
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }

    // Students can only view their own record
    if (req.user.role === 'student' && student.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create student (Admin only)
// @route   POST /api/students
// @access  Private (Admin)
const createStudent = async (req, res) => {
  try {
    const { fullName, rollNumber, class: className, section, password, guardianName, guardianPhone, address } = req.body;

    const rollExists = await Student.findOne({ rollNumber });
    if (rollExists) {
      return res.status(400).json({ success: false, message: 'Roll number already exists' });
    }

    const email = generateStudentEmail(rollNumber);
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already registered for this roll number' });
    }

    // Hash password manually
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password || 'student123', 12);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: 'student',
      createdBy: req.user._id,
    });

    const student = await Student.create({
      user: user._id,
      rollNumber,
      class: className,
      section: section || 'A',
      guardianName,
      guardianPhone,
      address,
    });

    const populatedStudent = await Student.findById(student._id).populate('user', 'fullName email');

    res.status(201).json({
      success: true,
      data: populatedStudent,
      credentials: {
        email,
        password: password || 'student123',
      },
    });
  } catch (error) {
    console.error('CreateStudent error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin, Teacher)
const updateStudent = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    student = await Student.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { returnDocument: 'after', runValidators: true }
    ).populate('user', 'fullName email');

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin only)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await User.findByIdAndDelete(student.user);
    await student.deleteOne();

    res.json({ success: true, message: 'Student removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add grade
// @route   POST /api/students/:id/grades
// @access  Private (Admin, Teacher)
const addGrade = async (req, res) => {
  try {
    const { subject, examType, marksObtained, totalMarks } = req.body;

    if (!subject || !examType || marksObtained === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide subject, examType, and marksObtained',
      });
    }

    const total = totalMarks || 100;
    const percentage = (marksObtained / total) * 100;
    let gradePoint = 0;

    if (percentage >= 90) gradePoint = 4.0;
    else if (percentage >= 80) gradePoint = 3.5;
    else if (percentage >= 70) gradePoint = 3.0;
    else if (percentage >= 60) gradePoint = 2.5;
    else if (percentage >= 50) gradePoint = 2.0;
    else if (percentage >= 40) gradePoint = 1.0;

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          grades: {
            subject,
            examType,
            marksObtained,
            totalMarks: total,
            gradePoint,
            recordedBy: req.user._id,
          },
        },
      },
      { returnDocument: 'after' }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark attendance
// @route   POST /api/students/:id/attendance
// @access  Private (Admin, Teacher)
const markAttendance = async (req, res) => {
  try {
    const { date, status, subject } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Please provide status' });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          attendance: {
            date: date ? new Date(date) : new Date(),
            status,
            subject: subject || 'daily',
            markedBy: req.user._id,
          },
        },
      },
      { returnDocument: 'after' }
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/students/stats/overview
// @access  Private (Admin, Teacher)
const getStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments({ status: 'active' });
    const totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
    const graduatedCount = await Student.countDocuments({ status: 'graduated' });
    const droppedCount = await Student.countDocuments({ status: 'dropped' });

    const classDistribution = await Student.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$class', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const recentStudents = await Student.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(5);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAttendance = await Student.aggregate([
      { $unwind: '$attendance' },
      {
        $match: {
          'attendance.date': { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: '$attendance.status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalTeachers,
        graduatedCount,
        droppedCount,
        classDistribution,
        recentStudents,
        todayAttendance,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStudents,
  getStudent,
  getStudentByUserId,
  createStudent,
  updateStudent,
  deleteStudent,
  addGrade,
  markAttendance,
  getStats,
};