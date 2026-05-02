const express = require('express');
const router = express.Router();
const {
  checkAdminExists,
  setupAdmin,
  login,
  getMe,
  getUsers,
  toggleUserStatus,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.get('/check-admin', checkAdminExists);
router.post('/setup-admin', setupAdmin);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin'), getUsers);
router.put('/users/:id/toggle', protect, authorize('admin'), toggleUserStatus);

module.exports = router;