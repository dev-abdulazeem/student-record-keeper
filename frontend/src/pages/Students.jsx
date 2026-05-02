import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/students');
      setStudents(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/students/${id}`);
      setStudents(students.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      !search ||
      s.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber?.toLowerCase().includes(search.toLowerCase());
    const matchesClass = !filterClass || s.class === filterClass;
    return matchesSearch && matchesClass;
  });

  const uniqueClasses = [...new Set(students.map((s) => s.class))].sort();

  if (loading) return <div className="loading">Loading students...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Students</h1>
        {user?.role === 'admin' && (
          <Link to="/students/add" className="btn btn-primary">+ Add Student</Link>
        )}
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by name or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} className="filter-select">
          <option value="">All Classes</option>
          {uniqueClasses.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll #</th>
              <th>Name</th>
              <th>Email</th>
              <th>Class</th>
              <th>Section</th>
              <th>GPA</th>
              <th>Attendance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student._id}>
                <td><strong>{student.rollNumber}</strong></td>
                <td>{student.user?.fullName}</td>
                <td><code>{student.user?.email}</code></td>
                <td>{student.class}</td>
                <td>{student.section}</td>
                <td>{student.gpa || '0.00'}</td>
                <td>{student.attendancePercentage || '0'}%</td>
                <td>
                  <span className={`badge badge-${student.status}`}>{student.status}</span>
                </td>
                <td>
                  <Link to={`/students/${student._id}`} className="btn btn-sm btn-view">View</Link>
                  {user?.role === 'admin' && (
                    <button onClick={() => handleDelete(student._id)} className="btn btn-sm btn-danger">Delete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Students;