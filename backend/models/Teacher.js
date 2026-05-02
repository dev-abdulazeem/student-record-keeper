const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      default: '',
    },
    qualification: {
      type: String,
      default: '',
    },
    specialization: {
      type: String,
      default: '',
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    assignedClasses: [
      {
        class: String,
        section: String,
        subject: String,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'on_leave', 'resigned'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);