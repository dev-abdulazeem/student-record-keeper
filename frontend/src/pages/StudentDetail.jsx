import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const StudentDetail = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const fetchStudent = async () => {
    try {
      const { data } = await api.get(`/students/${id}`);
      setStudent(data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch student');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrade = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.post(`/students/${id}/grades`, {
        subject: formData.get('subject'),
        examType: formData.get('examType'),
        marksObtained: Number(formData.get('marksObtained')),
        totalMarks: Number(formData.get('totalMarks')) || 100,
      });
      fetchStudent();
      e.target.reset();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add grade');
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await api.post(`/students/${id}/attendance`, {
        date: formData.get('date'),
        status: formData.get('status'),
      });
      fetchStudent();
      e.target.reset();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark attendance');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!student) return <div className="error">Student not found</div>;

  const isAdminOrTeacher = user?.role === 'admin' || user?.role === 'teacher';

  return (
    <div className="container">
      <button onClick={() => navigate('/students')} className="btn btn-secondary btn-back">
        ← Back to Students
      </button>

      <div className="student-profile">
        <h1>{student.user?.fullName}</h1>
        <div className="profile-grid">
          <div className="profile-card">
            <h3>📋 Basic Info</h3>
            <p><strong>Roll Number:</strong> {student.rollNumber}</p>
            <p><strong>Class:</strong> {student.class} - Section {student.section}</p>
            <p><strong>Email:</strong> <code>{student.user?.email}</code></p>
            <p><strong>Status:</strong> <span className={`badge badge-${student.status}`}>{student.status}</span></p>
            <p><strong>Enrollment:</strong> {new Date(student.enrollmentDate).toLocaleDateString()}</p>
          </div>
          <div className="profile-card">
            <h3>👨‍👩‍👧 Guardian Info</h3>
            <p><strong>Name:</strong> {student.guardianName || 'N/A'}</p>
            <p><strong>Phone:</strong> {student.guardianPhone || 'N/A'}</p>
            <p><strong>Address:</strong> {student.address || 'N/A'}</p>
          </div>
          <div className="profile-card">
            <h3>📈 Statistics</h3>
            <p><strong>GPA:</strong> <span className="stat-highlight">{student.gpa || 0}</span></p>
            <p><strong>Attendance:</strong> <span className="stat-highlight">{student.attendancePercentage || 0}%</span></p>
            <p><strong>Total Grades:</strong> {student.grades?.length || 0}</p>
            <p><strong>Total Attendance:</strong> {student.attendance?.length || 0}</p>
          </div>
        </div>
      </div>

      {isAdminOrTeacher && (
        <div className="actions-section">
          <div className="action-card">
            <h3>➕ Add Grade</h3>
            <form onSubmit={handleAddGrade}>
              <div className="form-row">
                <input name="subject" placeholder="Subject" required />
                <select name="examType" required>
                  <option value="quiz">Quiz</option>
                  <option value="midterm">Midterm</option>
                  <option value="final">Final</option>
                  <option value="assignment">Assignment</option>
                </select>
                <input name="marksObtained" type="number" placeholder="Marks Obtained" required />
                <input name="totalMarks" type="number" placeholder="Total Marks (100)" />
                <button type="submit" className="btn btn-primary">Add</button>
              </div>
            </form>
          </div>

          <div className="action-card">
            <h3>📅 Mark Attendance</h3>
            <form onSubmit={handleMarkAttendance}>
              <div className="form-row">
                <input name="date" type="date" required />
                <select name="status" required>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
                <button type="submit" className="btn btn-primary">Mark</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="records-section">
        <h2>📝 Grades History</h2>
        {student.grades?.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Exam</th>
                <th>Marks</th>
                <th>Grade Point</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {student.grades.map((grade, idx) => (
                <tr key={idx}>
                  <td>{grade.subject}</td>
                  <td>{grade.examType}</td>
                  <td>{grade.marksObtained}/{grade.totalMarks}</td>
                  <td>{grade.gradePoint}</td>
                  <td>{new Date(grade.recordedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-state">No grades recorded yet.</p>
        )}

        <h2>📋 Attendance History</h2>
        {student.attendance?.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Subject</th>
              </tr>
            </thead>
            <tbody>
              {student.attendance.map((record, idx) => (
                <tr key={idx}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${record.status}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>{record.subject}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-state">No attendance records yet.</p>
        )}
      </div>
    </div>
  );
};

export default StudentDetail;