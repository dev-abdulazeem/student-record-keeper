import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const RecordPayment = () => {
  const { id } = useParams();
  const [fee, setFee] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    method: 'cash',
    receiptNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFee();
  }, [id]);

  const fetchFee = async () => {
    try {
      const { data } = await api.get('/fees');
      const foundFee = data.data.find((f) => f._id === id);
      if (foundFee) {
        setFee(foundFee);
        setFormData((prev) => ({
          ...prev,
          amount: foundFee.balance > 0 ? foundFee.balance : '',
        }));
      }
    } catch (err) {
      console.error('Failed to fetch fee');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post(`/fees/${id}/pay`, {
        amount: Number(formData.amount),
        method: formData.method,
        receiptNumber: formData.receiptNumber || `RCP-${Date.now()}`,
      });
      navigate(`/fees/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  if (!fee) return <div className="loading">Loading...</div>;

  return (
    <div className="container">
      <h1>💳 Record Payment</h1>
      <div className="payment-info">
        <p><strong>Student:</strong> {fee.student?.user?.fullName}</p>
        <p><strong>Total Amount:</strong> ${fee.amount.toLocaleString()}</p>
        <p><strong>Already Paid:</strong> ${fee.paidAmount.toLocaleString()}</p>
        <p><strong>Remaining Balance:</strong> <span className="text-danger">${fee.balance.toLocaleString()}</span></p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="form-group">
          <label>Payment Amount ($) *</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="1"
            max={fee.balance}
          />
        </div>

        <div className="form-group">
          <label>Payment Method</label>
          <select name="method" value={formData.method} onChange={handleChange}>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="mobile_money">Mobile Money</option>
            <option value="card">Card</option>
          </select>
        </div>

        <div className="form-group">
          <label>Receipt Number</label>
          <input
            type="text"
            name="receiptNumber"
            value={formData.receiptNumber}
            onChange={handleChange}
            placeholder={`RCP-${Date.now()}`}
          />
        </div>

        <div className="form-actions full-width">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Processing...' : 'Record Payment'}
          </button>
          <button type="button" onClick={() => navigate(`/fees/${id}`)} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecordPayment;