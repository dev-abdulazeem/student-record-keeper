import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/dashboard" onClick={closeMenu}>
          📚 Student Record Keeper
        </Link>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <NotificationBell />
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <span className="user-info">
          👤 {user?.fullName} ({user?.role})
        </span>
        
        <Link to="/dashboard" className="nav-link" onClick={closeMenu}>
          📊 Dashboard
        </Link>
        <Link to="/announcements" className="nav-link" onClick={closeMenu}>
          📢 Announcements
        </Link>
        
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <>
            <Link to="/students" className="nav-link" onClick={closeMenu}>
              👨‍🎓 Students
            </Link>
            <Link to="/fees" className="nav-link" onClick={closeMenu}>
              💰 Fees
            </Link>
          </>
        )}
        
        {user?.role === 'admin' && (
          <>
            <Link to="/teachers" className="nav-link" onClick={closeMenu}>
              👨‍🏫 Teachers
            </Link>
            <Link to="/users" className="nav-link" onClick={closeMenu}>
              👥 Users
            </Link>
            <Link to="/students/add" className="nav-link" onClick={closeMenu}>
              ➕ Add Student
            </Link>
            <Link to="/teachers/add" className="nav-link" onClick={closeMenu}>
              ➕ Add Teacher
            </Link>
          </>
        )}
        
        <button onClick={handleLogout} className="btn-logout">
          🚪 Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;