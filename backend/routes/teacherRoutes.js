const express = require('express');
const router = express.Router();
const {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.route('/').get(getTeachers).post(createTeacher);
router.route('/:id').get(getTeacher).put(updateTeacher).delete(deleteTeacher);

module.exports = router;