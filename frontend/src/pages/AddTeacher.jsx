import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AddTeacher = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    department: '',
    qualification: '',
    specialization: '',
    password: '',
    phone: '',
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
      const { data } = await api.post('/teachers', formData);
      setSuccess(`Teacher created! Email: ${data.credentials.email}, Password: ${data.credentials.password}`);
      setFormData({
        fullName: '',
        employeeId: '',
        department: '',
        qualification: '',
        specialization: '',
        password: '',
        phone: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add teacher');
    }
  };

  return (
    <div className="container">
      <h1>Add New Teacher</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>Full Name *</label>
          <input name="fullName" value={formData.fullName} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Employee ID *</label>
          <input name="employeeId" value={formData.employeeId} onChange={handleChange} required placeholder="e.g., T001" />
        </div>
        <div className="form-group">
          <label>Department</label>
          <input name="department" value={formData.department} onChange={handleChange} placeholder="e.g., Mathematics" />
        </div>
        <div className="form-group">
          <label>Qualification</label>
          <input name="qualification" value={formData.qualification} onChange={handleChange} placeholder="e.g., M.Sc, B.Ed" />
        </div>
        <div className="form-group">
          <label>Specialization</label>
          <input name="specialization" value={formData.specialization} onChange={handleChange} placeholder="e.g., Algebra" />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input name="phone" type="tel" value={formData.phone} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Password (auto: teacher123)</label>
          <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Leave empty for default" />
        </div>
        <div className="form-actions full-width">
          <button type="submit" className="btn btn-primary">Create Teacher</button>
          <button type="button" onClick={() => navigate('/teachers')} className="btn btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default AddTeacher;