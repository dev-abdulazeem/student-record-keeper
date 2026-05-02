import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CreateAnnouncement = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general',
    targetAudience: 'all',
    targetClass: '',
    isPinned: false,
    expiresAt: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/announcements', formData);
      navigate('/announcements');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create announcement');
    }
  };

  return (
    <div className="container">
      <h1>📢 Post New Announcement</h1>
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group full-width">
          <label>Title *</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Midterm Exam Schedule"
          />
        </div>

        <div className="form-group full-width">
          <label>Content *</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows="6"
            placeholder="Write your announcement here..."
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="general">General</option>
            <option value="academic">Academic</option>
            <option value="sports">Sports</option>
            <option value="exam">Exam</option>
            <option value="event">Event</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="form-group">
          <label>Target Audience</label>
          <select name="targetAudience" value={formData.targetAudience} onChange={handleChange}>
            <option value="all">Everyone</option>
            <option value="students">Students Only</option>
            <option value="teachers">Teachers Only</option>
            <option value="specific_class">Specific Class</option>
          </select>
        </div>

        {formData.targetAudience === 'specific_class' && (
          <div className="form-group">
            <label>Target Class</label>
            <input
              name="targetClass"
              value={formData.targetClass}
              onChange={handleChange}
              placeholder="e.g., Grade 10"
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Expires At (optional)</label>
          <input
            type="date"
            name="expiresAt"
            value={formData.expiresAt}
            onChange={handleChange}
          />
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isPinned"
              checked={formData.isPinned}
              onChange={handleChange}
            />
            Pin to top
          </label>
        </div>

        <div className="form-actions full-width">
          <button type="submit" className="btn btn-primary">Post Announcement</button>
          <button type="button" onClick={() => navigate('/announcements')} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAnnouncement;