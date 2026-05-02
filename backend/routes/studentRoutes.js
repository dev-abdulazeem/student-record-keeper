const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudent,
  getStudentByUserId,
  createStudent,
  updateStudent,
  deleteStudent,
  addGrade,
  markAttendance,
  getStats,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats/overview', authorize('admin', 'teacher'), getStats);
router.get('/by-user/:userId', getStudentByUserId); // NEW: Get student by user ID
router
  .route('/')
  .get(authorize('admin', 'teacher'), getStudents)
  .post(authorize('admin'), createStudent);

router
  .route('/:id')
  .get(getStudent)
  .put(authorize('admin', 'teacher'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

router.post('/:id/grades', authorize('admin', 'teacher'), addGrade);
router.post('/:id/attendance', authorize('admin', 'teacher'), markAttendance);

module.exports = router;