import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    showDropdown,
    toggleDropdown,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    if (notification.type === 'announcement' && notification.relatedId) {
      navigate(`/announcements/${notification.relatedId}`);
    }
    toggleDropdown();
  };

  return (
    <div className="notification-bell-container">
      <button className="notification-bell" onClick={toggleDropdown}>
        🔔
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            {notifications.length > 0 && (
              <button onClick={markAllAsRead} className="btn-mark-all">
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="notification-empty">No new notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${notification.type}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-dot"></div>
                  <div className="notification-content">
                    <p className="notification-title">{notification.title}</p>
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="notification-footer">
            <button onClick={() => { navigate('/announcements'); toggleDropdown(); }}>
              View All Announcements
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;