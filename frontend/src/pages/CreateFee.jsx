import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateFee = () => {
  const [formData, setFormData] = useState({
    student: '',
    amount: '',
    feeType: 'tuition',
    dueDate: '',
    academicYear: '2025-2026',
    term: 'first',
  });
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/students');
      setStudents(data.data || []);
    } catch (err) {
      console.error('Failed to fetch students');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/fees', {
        ...formData,
        amount: Number(formData.amount),
      });
      navigate('/fees');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create fee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1>➕ Create Fee Record</h1>
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>Student *</label>
          <select name="student" value={formData.student} onChange={handleChange} required>
            <option value="">Select Student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.user?.fullName} ({s.rollNumber}) - {s.class}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Amount ($) *</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="1"
            placeholder="e.g., 500"
          />
        </div>

        <div className="form-group">
          <label>Fee Type</label>
          <select name="feeType" value={formData.feeType} onChange={handleChange}>
            <option value="tuition">Tuition</option>
            <option value="exam">Exam</option>
            <option value="library">Library</option>
            <option value="transport">Transport</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label>Due Date *</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Academic Year</label>
          <input
            type="text"
            name="academicYear"
            value={formData.academicYear}
            onChange={handleChange}
            placeholder="e.g., 2025-2026"
          />
        </div>

        <div className="form-group">
          <label>Term</label>
          <select name="term" value={formData.term} onChange={handleChange}>
            <option value="first">First Term</option>
            <option value="second">Second Term</option>
            <option value="third">Third Term</option>
          </select>
        </div>

        <div className="form-actions full-width">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Fee'}
          </button>
          <button type="button" onClick={() => navigate('/fees')} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFee;