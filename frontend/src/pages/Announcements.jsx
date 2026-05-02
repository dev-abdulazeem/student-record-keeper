import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get('/announcements');
      setAnnouncements(data.data || []);
    } catch (err) {
      console.error('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/announcements/${id}/read`);
      setAnnouncements((prev) =>
        prev.map((a) => (a._id === id ? { ...a, isRead: true } : a))
      );
    } catch (err) {
      console.error('Failed to mark as read');
    }
  };

  const filteredAnnouncements = filterCategory
    ? announcements.filter((a) => a.category === filterCategory)
    : announcements;

  const getCategoryIcon = (category) => {
    const icons = {
      general: '📢',
      academic: '📚',
      sports: '⚽',
      exam: '📝',
      event: '🎉',
      urgent: '🚨',
    };
    return icons[category] || '📌';
  };

  if (loading) return <div className="loading">Loading announcements...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>📢 Announcements</h1>
        {user?.role === 'admin' && (
          <Link to="/announcements/create" className="btn btn-primary">+ Post Announcement</Link>
        )}
      </div>

      <div className="filters">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          <option value="general">General</option>
          <option value="academic">Academic</option>
          <option value="sports">Sports</option>
          <option value="exam">Exam</option>
          <option value="event">Event</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div className="announcements-list">
        {filteredAnnouncements.map((announcement) => (
          <div
            key={announcement._id}
            className={`announcement-card ${announcement.isRead ? 'read' : 'unread'} ${
              announcement.isPinned ? 'pinned' : ''
            }`}
          >
            {announcement.isPinned && <span className="pin-badge">📌 Pinned</span>}
            
            <div className="announcement-header">
              <span className="category-icon">{getCategoryIcon(announcement.category)}</span>
              <span className={`badge badge-${announcement.category}`}>{announcement.category}</span>
              <span className="target-badge">For: {announcement.targetAudience}</span>
            </div>

            <h3>{announcement.title}</h3>
            <p className="announcement-content">{announcement.content}</p>

            <div className="announcement-meta">
              <span>Posted by: {announcement.postedBy?.fullName}</span>
              <span>{new Date(announcement.createdAt).toLocaleString()}</span>
            </div>

            {!announcement.isRead && (
              <button
                onClick={() => markAsRead(announcement._id)}
                className="btn btn-sm btn-primary"
              >
                Mark as Read
              </button>
            )}

            {user?.role === 'admin' && (
              <div className="admin-actions">
                <Link to={`/announcements/edit/${announcement._id}`} className="btn btn-sm btn-secondary">
                  Edit
                </Link>
                <button
                  onClick={async () => {
                    if (window.confirm('Delete this announcement?')) {
                      await api.delete(`/announcements/${announcement._id}`);
                      fetchAnnouncements();
                    }
                  }}
                  className="btn btn-sm btn-danger"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <p className="empty-state">No announcements found.</p>
      )}
    </div>
  );
};

export default Announcements;