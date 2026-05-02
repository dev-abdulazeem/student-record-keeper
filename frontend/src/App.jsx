import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import SetupAdmin from './pages/SetupAdmin';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetail from './pages/StudentDetail';
import AddStudent from './pages/AddStudent';
import Teachers from './pages/Teachers';
import AddTeacher from './pages/AddTeacher';
import Users from './pages/Users';
import Fees from './pages/Fees';
import CreateFee from './pages/CreateFee';
import FeeDetail from './pages/FeeDetail';
import RecordPayment from './pages/RecordPayment';
import Announcements from './pages/Announcements';
import CreateAnnouncement from './pages/CreateAnnouncement';
import AnnouncementDetail from './pages/AnnouncementDetail';
import './index.css';

function PrivateRoute({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <Routes>
      <Route path="/setup-admin" element={<SetupAdmin />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      
      {/* Students */}
      <Route
        path="/students"
        element={
          <PrivateRoute roles={['admin', 'teacher']}>
            <Students />
          </PrivateRoute>
        }
      />
      <Route
        path="/students/add"
        element={
          <PrivateRoute roles={['admin']}>
            <AddStudent />
          </PrivateRoute>
        }
      />
      <Route
        path="/students/:id"
        element={
          <PrivateRoute>
            <StudentDetail />
          </PrivateRoute>
        }
      />
      
      {/* Teachers */}
      <Route
        path="/teachers"
        element={
          <PrivateRoute roles={['admin']}>
            <Teachers />
          </PrivateRoute>
        }
      />
      <Route
        path="/teachers/add"
        element={
          <PrivateRoute roles={['admin']}>
            <AddTeacher />
          </PrivateRoute>
        }
      />
      
      {/* Fees */}
      <Route
        path="/fees"
        element={
          <PrivateRoute roles={['admin', 'teacher']}>
            <Fees />
          </PrivateRoute>
        }
      />
      <Route
        path="/fees/create"
        element={
          <PrivateRoute roles={['admin']}>
            <CreateFee />
          </PrivateRoute>
        }
      />
      <Route
        path="/fees/:id"
        element={
          <PrivateRoute roles={['admin', 'teacher']}>
            <FeeDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/fees/:id/pay"
        element={
          <PrivateRoute roles={['admin']}>
            <RecordPayment />
          </PrivateRoute>
        }
      />
      
      {/* Announcements */}
      <Route
        path="/announcements"
        element={
          <PrivateRoute>
            <Announcements />
          </PrivateRoute>
        }
      />
      <Route
        path="/announcements/create"
        element={
          <PrivateRoute roles={['admin']}>
            <CreateAnnouncement />
          </PrivateRoute>
        }
      />
      <Route
        path="/announcements/:id"
        element={
          <PrivateRoute>
            <AnnouncementDetail />
          </PrivateRoute>
        }
      />
      
      {/* Users */}
      <Route
        path="/users"
        element={
          <PrivateRoute roles={['admin']}>
            <Users />
          </PrivateRoute>
        }
      />
      
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <div className="app">
            <Navbar />
            <main>
              <AppRoutes />
            </main>
          </div>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;