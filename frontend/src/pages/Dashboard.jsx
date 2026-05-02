import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myStudentId, setMyStudentId] = useState(null);

  useEffect(() => {
    if (user?.role === 'student') {
      fetchMyStudentId();
    } else if (user?.role !== 'student') {
      fetchStats();
    }
  }, [user]);

  const fetchMyStudentId = async () => {
    try {
      const { data } = await api.get(`/students/by-user/${user._id}`);
      setMyStudentId(data.data._id);
    } catch (err) {
      console.error('Failed to fetch student record:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/students/stats/overview');
      setStats(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = () => {
    if (myStudentId) {
      navigate(`/students/${myStudentId}`);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, <strong>{user?.fullName}</strong>! 👋</p>
      </div>

      {user?.role === 'student' ? (
        <div className="student-welcome">
          <h2>🎓 Student Portal</h2>
          <p>View your grades, attendance, and academic records.</p>
          {myStudentId ? (
            <button onClick={handleViewProfile} className="btn btn-primary">
              View My Profile
            </button>
          ) : (
            <p className="error-text">Student record not found. Contact admin.</p>
          )}
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card stat-primary">
              <div className="stat-icon">👨‍🎓</div>
              <div>
                <h3>Total Students</h3>
                <p className="stat-value">{stats?.totalStudents || 0}</p>
              </div>
            </div>
            <div className="stat-card stat-secondary">
              <div className="stat-icon">👨‍🏫</div>
              <div>
                <h3>Total Teachers</h3>
                <p className="stat-value">{stats?.totalTeachers || 0}</p>
              </div>
            </div>
            <div className="stat-card stat-success">
              <div className="stat-icon">🎓</div>
              <div>
                <h3>Graduated</h3>
                <p className="stat-value">{stats?.graduatedCount || 0}</p>
              </div>
            </div>
            <div className="stat-card stat-danger">
              <div className="stat-icon">⚠️</div>
              <div>
                <h3>Dropped</h3>
                <p className="stat-value">{stats?.droppedCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>📊 Class Distribution</h3>
              {stats?.classDistribution?.length > 0 ? (
                <ul className="class-list">
                  {stats.classDistribution.map((cls) => (
                    <li key={cls._id}>
                      <span>{cls._id}</span>
                      <span className="count">{cls.count} students</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">No data available</p>
              )}
            </div>

            <div className="dashboard-card">
              <h3>🆕 Recent Students</h3>
              {stats?.recentStudents?.length > 0 ? (
                <ul className="recent-list">
                  {stats.recentStudents.map((s) => (
                    <li key={s._id}>
                      <span>{s.user?.fullName}</span>
                      <span className="class-tag">{s.class}-{s.section}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-state">No recent students</p>
              )}
            </div>

            <div className="dashboard-card">
              <h3>📅 Today's Attendance</h3>
              {stats?.todayAttendance?.length > 0 ? (
                <div className="attendance-chart">
                  {stats.todayAttendance.map((item) => (
                    <div key={item._id} className={`attendance-bar ${item._id}`}>
                      <span className="label">{item._id}</span>
                      <div className="bar" style={{ width: `${Math.min(item.count * 10, 200)}px` }}>
                        {item.count}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-state">No attendance marked today</p>
              )}
            </div>
          </div>

          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <Link to="/students" className="btn btn-secondary">View All Students</Link>
              <Link to="/students/add" className="btn btn-primary">+ Add Student</Link>
              <Link to="/teachers" className="btn btn-secondary">View Teachers</Link>
              <Link to="/teachers/add" className="btn btn-primary">+ Add Teacher</Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;