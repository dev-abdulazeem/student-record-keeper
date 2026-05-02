const Fee = require('../models/Fee');
const Student = require('../models/Student');

const getFees = async (req, res) => {
  try {
    const { student, status, feeType } = req.query;
    let query = {};

    if (student) query.student = student;
    if (status) query.status = status;
    if (feeType) query.feeType = feeType;

    const fees = await Fee.find(query)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'fullName email' },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: fees.length, data: fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createFee = async (req, res) => {
  try {
    const { student, amount, feeType, dueDate, academicYear, term } = req.body;

    const fee = await Fee.create({
      student,
      amount,
      feeType: feeType || 'tuition',
      dueDate: dueDate || new Date(),
      academicYear: academicYear || '2025-2026',
      term: term || 'first',
    });

    const populatedFee = await Fee.findById(fee._id).populate({
      path: 'student',
      populate: { path: 'user', select: 'fullName email' },
    });

    res.status(201).json({ success: true, data: populatedFee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const recordPayment = async (req, res) => {
  try {
    const { amount, method, receiptNumber } = req.body;
    const feeId = req.params.id;

    const fee = await Fee.findById(feeId);
    if (!fee) {
      return res.status(404).json({ success: false, message: 'Fee record not found' });
    }

    const newPaidAmount = fee.paidAmount + Number(amount);
    let status = 'partial';
    if (newPaidAmount >= fee.amount) status = 'paid';
    else if (newPaidAmount === 0) status = 'unpaid';

    const updatedFee = await Fee.findByIdAndUpdate(
      feeId,
      {
        paidAmount: newPaidAmount,
        status,
        $push: {
          payments: {
            amount: Number(amount),
            method: method || 'cash',
            receiptNumber: receiptNumber || `RCP-${Date.now()}`,
          },
        },
      },
      { returnDocument: 'after' }
    ).populate({
      path: 'student',
      populate: { path: 'user', select: 'fullName email' },
    });

    res.json({ success: true, data: updatedFee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStudentFees = async (req, res) => {
  try {
    const fees = await Fee.find({ student: req.params.studentId })
      .sort({ createdAt: -1 });

    const totalDue = fees.reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0);
    const totalBalance = totalDue - totalPaid;

    res.json({
      success: true,
      data: fees,
      summary: { totalDue, totalPaid, totalBalance },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteFee = async (req, res) => {
  try {
    await Fee.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Fee record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFees,
  createFee,
  recordPayment,
  getStudentFees,
  deleteFee,
};