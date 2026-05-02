import { useState, useEffect } from 'react';
import api from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/auth/users');
      setUsers(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await api.put(`/auth/users/${id}/toggle`);
      fetchUsers();
    } catch (err) {
      alert('Failed to toggle status');
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="container">
      <h1>Manage Users</h1>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.fullName}</td>
                <td><code>{user.email}</code></td>
                <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                <td>
                  <span className={`badge badge-${user.isActive ? 'active' : 'dropped'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => toggleStatus(user._id)}
                    className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-primary'}`}
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;