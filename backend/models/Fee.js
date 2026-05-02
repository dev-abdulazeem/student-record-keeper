const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    feeType: {
      type: String,
      enum: ['tuition', 'exam', 'library', 'transport', 'other'],
      default: 'tuition',
    },
    amount: {
      type: Number,
      required: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['paid', 'partial', 'unpaid', 'overdue'],
      default: 'unpaid',
    },
    payments: [
      {
        amount: Number,
        date: { type: Date, default: Date.now },
        method: {
          type: String,
          enum: ['cash', 'bank_transfer', 'mobile_money', 'card'],
          default: 'cash',
        },
        receiptNumber: String,
      },
    ],
    academicYear: {
      type: String,
      default: '2025-2026',
    },
    term: {
      type: String,
      enum: ['first', 'second', 'third'],
      default: 'first',
    },
  },
  { timestamps: true }
);

// Virtual for remaining balance
feeSchema.virtual('balance').get(function () {
  return this.amount - this.paidAmount;
});

feeSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Fee', feeSchema);