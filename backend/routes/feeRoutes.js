const express = require('express');
const router = express.Router();
const {
  getFees,
  createFee,
  recordPayment,
  getStudentFees,
  deleteFee,
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(authorize('admin', 'teacher'), getFees)
  .post(authorize('admin'), createFee);

router.get('/student/:studentId', authorize('admin', 'teacher'), getStudentFees);
router.post('/:id/pay', authorize('admin'), recordPayment);
router.delete('/:id', authorize('admin'), deleteFee);

module.exports = router;