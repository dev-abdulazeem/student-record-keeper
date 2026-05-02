import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const { data } = await api.get('/teachers');
      setTeachers(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/teachers/${id}`);
      setTeachers(teachers.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="loading">Loading teachers...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Teachers</h1>
        <Link to="/teachers/add" className="btn btn-primary">+ Add Teacher</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr key={teacher._id}>
                <td><strong>{teacher.employeeId}</strong></td>
                <td>{teacher.user?.fullName}</td>
                <td><code>{teacher.user?.email}</code></td>
                <td>{teacher.department || 'N/A'}</td>
                <td>
                  <span className={`badge badge-${teacher.status}`}>{teacher.status}</span>
                </td>
                <td>
                  <button onClick={() => handleDelete(teacher._id)} className="btn btn-sm btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Teachers;