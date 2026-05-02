const express = require('express');
const router = express.Router();
const {
  getAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAsRead,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getAnnouncements)
  .post(authorize('admin'), createAnnouncement);

router
  .route('/:id')
  .get(getAnnouncement)
  .put(authorize('admin'), updateAnnouncement)
  .delete(authorize('admin'), deleteAnnouncement);

router.put('/:id/read', markAsRead);

module.exports = router;