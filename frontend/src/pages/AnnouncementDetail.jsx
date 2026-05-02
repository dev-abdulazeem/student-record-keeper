import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const AnnouncementDetail = () => {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnnouncement();
  }, [id]);

  const fetchAnnouncement = async () => {
    try {
      const { data } = await api.get(`/announcements/${id}`);
      setAnnouncement(data.data);
    } catch (err) {
      alert('Failed to fetch announcement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!announcement) return <div className="error">Announcement not found</div>;

  return (
    <div className="container">
      <button onClick={() => navigate('/announcements')} className="btn btn-secondary btn-back">
        ← Back
      </button>

      <div className="announcement-detail">
        {announcement.isPinned && <span className="pin-badge">📌 Pinned</span>}
        
        <div className="announcement-header">
          <span className={`badge badge-${announcement.category}`}>{announcement.category}</span>
          <span className="target-badge">For: {announcement.targetAudience}</span>
        </div>

        <h1>{announcement.title}</h1>
        
        <div className="announcement-meta">
          <span>Posted by: {announcement.postedBy?.fullName} ({announcement.postedBy?.role})</span>
          <span>{new Date(announcement.createdAt).toLocaleString()}</span>
        </div>

        <div className="announcement-body">
          <p>{announcement.content}</p>
        </div>

        {announcement.expiresAt && (
          <p className="expires-at">Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );
};

export default AnnouncementDetail;