import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const FeeDetail = () => {
  const { id } = useParams();
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFee();
  }, [id]);

  const fetchFee = async () => {
    try {
      const { data } = await api.get(`/fees`);
      const foundFee = data.data.find((f) => f._id === id);
      if (foundFee) {
        setFee(foundFee);
      } else {
        setError('Fee record not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch fee');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this fee record?')) return;
    try {
      await api.delete(`/fees/${id}`);
      navigate('/fees');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!fee) return <div className="error">Fee not found</div>;

  return (
    <div className="container">
      <button onClick={() => navigate('/fees')} className="btn btn-secondary btn-back">
        ← Back to Fees
      </button>

      <div className="student-profile">
        <h1>💰 Fee Record</h1>
        <div className="profile-grid">
          <div className="profile-card">
            <h3>📋 Fee Info</h3>
            <p><strong>Type:</strong> <span className={`badge badge-${fee.feeType}`}>{fee.feeType}</span></p>
            <p><strong>Amount:</strong> ${fee.amount.toLocaleString()}</p>
            <p><strong>Paid:</strong> ${fee.paidAmount.toLocaleString()}</p>
            <p><strong>Balance:</strong> <span className={fee.balance > 0 ? 'text-danger' : 'text-success'}>${fee.balance.toLocaleString()}</span></p>
            <p><strong>Status:</strong> <span className={`badge badge-${fee.status}`}>{fee.status}</span></p>
          </div>
          <div className="profile-card">
            <h3>👨‍🎓 Student</h3>
            <p><strong>Name:</strong> {fee.student?.user?.fullName}</p>
            <p><strong>Roll Number:</strong> {fee.student?.rollNumber}</p>
            <p><strong>Class:</strong> {fee.student?.class} - {fee.student?.section}</p>
            <p><strong>Email:</strong> <code>{fee.student?.user?.email}</code></p>
          </div>
          <div className="profile-card">
            <h3>📅 Details</h3>
            <p><strong>Academic Year:</strong> {fee.academicYear}</p>
            <p><strong>Term:</strong> {fee.term}</p>
            <p><strong>Due Date:</strong> {new Date(fee.dueDate).toLocaleDateString()}</p>
            <p><strong>Created:</strong> {new Date(fee.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="records-section">
        <h2>💳 Payment History</h2>
        {fee.payments?.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Receipt #</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {fee.payments.map((payment, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>${payment.amount.toLocaleString()}</td>
                  <td>{payment.method}</td>
                  <td><code>{payment.receiptNumber}</code></td>
                  <td>{new Date(payment.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-state">No payments recorded yet.</p>
        )}
      </div>

      {/* Actions */}
      {user?.role === 'admin' && (
        <div className="quick-actions">
          <h3>Actions</h3>
          <div className="action-buttons">
            {fee.status !== 'paid' && (
              <Link to={`/fees/${fee._id}/pay`} className="btn btn-primary">💳 Record Payment</Link>
            )}
            <button onClick={handleDelete} className="btn btn-danger">🗑️ Delete Record</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeDetail;