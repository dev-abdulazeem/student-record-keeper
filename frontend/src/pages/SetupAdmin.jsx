import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const SetupAdmin = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [adminExists, setAdminExists] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const { data } = await api.get('/auth/check-admin');
      if (data.adminExists) {
        navigate('/login');
      } else {
        setAdminExists(false);
      }
    } catch (err) {
      setAdminExists(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/auth/setup-admin', formData);
      alert('Admin account created successfully! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  if (adminExists === null) return <div className="loading">Checking...</div>;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>🎓 Setup Admin Account</h2>
        <p className="setup-info">This is a one-time setup. Create your admin account to get started.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength="6"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full">Create Admin Account</button>
        </form>
      </div>
    </div>
  );
};

export default SetupAdmin;