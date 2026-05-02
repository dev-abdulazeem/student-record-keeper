const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
    },
    class: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      default: 'A',
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    guardianName: {
      type: String,
      default: '',
    },
    guardianPhone: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'graduated', 'dropped'],
      default: 'active',
    },
    subjects: [
      {
        name: String,
        code: String,
        creditHours: { type: Number, default: 3 },
      },
    ],
    grades: [
      {
        subject: String,
        examType: {
          type: String,
          enum: ['quiz', 'midterm', 'final', 'assignment'],
        },
        marksObtained: Number,
        totalMarks: { type: Number, default: 100 },
        gradePoint: Number,
        recordedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        recordedAt: { type: Date, default: Date.now },
      },
    ],
    attendance: [
      {
        date: Date,
        status: {
          type: String,
          enum: ['present', 'absent', 'late', 'excused'],
        },
        subject: { type: String, default: 'daily' },
        markedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
  },
  { timestamps: true }
);

studentSchema.virtual('gpa').get(function () {
  if (!this.grades || this.grades.length === 0) return 0;
  const totalPoints = this.grades.reduce((sum, g) => sum + (g.gradePoint || 0), 0);
  return parseFloat((totalPoints / this.grades.length).toFixed(2));
});

studentSchema.virtual('attendancePercentage').get(function () {
  if (!this.attendance || this.attendance.length === 0) return 0;
  const present = this.attendance.filter((a) => a.status === 'present').length;
  return parseFloat(((present / this.attendance.length) * 100).toFixed(1));
});

studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Student', studentSchema);