const Teacher = require('../models/Teacher');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const generateTeacherEmail = (employeeId) => {
  return `teacher${employeeId}@school.edu`.toLowerCase();
};

const getTeachers = async (req, res) => {
  try {
    const { department, status, search } = req.query;
    let query = {};

    if (department) query.department = department;
    if (status) query.status = status;

    const teachers = await Teacher.find(query)
      .populate('user', 'fullName email phone isActive')
      .sort({ createdAt: -1 });

    let filteredTeachers = teachers;
    if (search) {
      filteredTeachers = teachers.filter(t => 
        t.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        t.employeeId?.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({ success: true, count: filteredTeachers.length, data: filteredTeachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id).populate(
      'user',
      'fullName email phone avatar isActive'
    );

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTeacher = async (req, res) => {
  try {
    const { fullName, employeeId, department, qualification, specialization, password, phone } = req.body;

    const empExists = await Teacher.findOne({ employeeId });
    if (empExists) {
      return res.status(400).json({ success: false, message: 'Employee ID already exists' });
    }

    const email = generateTeacherEmail(employeeId);
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash password manually
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password || 'teacher123', 12);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      role: 'teacher',
      phone,
      createdBy: req.user._id,
    });

    const teacher = await Teacher.create({
      user: user._id,
      employeeId,
      department,
      qualification,
      specialization,
    });

    const populatedTeacher = await Teacher.findById(teacher._id).populate('user', 'fullName email');

    res.status(201).json({
      success: true,
      data: populatedTeacher,
      credentials: {
        email,
        password: password || 'teacher123',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    let teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    teacher = await Teacher.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { returnDocument: 'after', runValidators: true }
    ).populate('user', 'fullName email');

    res.json({ success: true, data: teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    await User.findByIdAndDelete(teacher.user);
    await teacher.deleteOne();

    res.json({ success: true, message: 'Teacher removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};