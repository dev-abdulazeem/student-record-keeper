import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AddStudent = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    rollNumber: '',
    class: '',
    section: 'A',
    password: '',
    guardianName: '',
    guardianPhone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const { data } = await api.post('/students', formData);
      setSuccess(`Student created! Email: ${data.credentials.email}, Password: ${data.credentials.password}`);
      setFormData({
        fullName: '',
        rollNumber: '',
        class: '',
        section: 'A',
        password: '',
        guardianName: '',
        guardianPhone: '',
        address: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student');
    }
  };

  return (
    <div className="container">
      <h1>Add New Student</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>Full Name *</label>
          <input name="fullName" value={formData.fullName} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Roll Number *</label>
          <input name="rollNumber" value={formData.rollNumber} onChange={handleChange} required placeholder="e.g., 001" />
        </div>
        <div className="form-group">
          <label>Class *</label>
          <input name="class" value={formData.class} onChange={handleChange} required placeholder="e.g., Grade 10" />
        </div>
        <div className="form-group">
          <label>Section</label>
          <select name="section" value={formData.section} onChange={handleChange}>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>
        <div className="form-group">
          <label>Password (auto: student123)</label>
          <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Leave empty for default" />
        </div>
        <div className="form-group">
          <label>Guardian Name</label>
          <input name="guardianName" value={formData.guardianName} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Guardian Phone</label>
          <input name="guardianPhone" type="tel" value={formData.guardianPhone} onChange={handleChange} />
        </div>
        <div className="form-group full-width">
          <label>Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange} rows="3" />
        </div>
        <div className="form-actions full-width">
          <button type="submit" className="btn btn-primary">Create Student</button>
          <button type="button" onClick={() => navigate('/students')} className="btn btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddStudent;