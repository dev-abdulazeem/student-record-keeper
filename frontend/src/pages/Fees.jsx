import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  const { user } = useAuth();

  const [summary, setSummary] = useState({
    totalDue: 0,
    totalPaid: 0,
    totalBalance: 0,
    count: 0,
  });

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const { data } = await api.get('/fees');
      setFees(data.data || []);
      calculateSummary(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch fees');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (feeData) => {
    const totalDue = feeData.reduce((sum, f) => sum + f.amount, 0);
    const totalPaid = feeData.reduce((sum, f) => sum + f.paidAmount, 0);
    setSummary({
      totalDue,
      totalPaid,
      totalBalance: totalDue - totalPaid,
      count: feeData.length,
    });
  };

  const filteredFees = fees.filter((fee) => {
    const matchesStatus = !filterStatus || fee.status === filterStatus;
    const matchesType = !filterType || fee.feeType === filterType;
    const matchesSearch =
      !searchStudent ||
      fee.student?.user?.fullName?.toLowerCase().includes(searchStudent.toLowerCase()) ||
      fee.student?.rollNumber?.toLowerCase().includes(searchStudent.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  if (loading) return <div className="loading">Loading fees...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>💰 Fee Management</h1>
        {user?.role === 'admin' && (
          <Link to="/fees/create" className="btn btn-primary">+ Create Fee</Link>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">💵</div>
          <div>
            <h3>Total Due</h3>
            <p className="stat-value">${summary.totalDue.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-icon">✅</div>
          <div>
            <h3>Total Paid</h3>
            <p className="stat-value">${summary.totalPaid.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card stat-danger">
          <div className="stat-icon">⚠️</div>
          <div>
            <h3>Balance</h3>
            <p className="stat-value">${summary.totalBalance.toLocaleString()}</p>
          </div>
        </div>
        <div className="stat-card stat-secondary">
          <div className="stat-icon">📋</div>
          <div>
            <h3>Records</h3>
            <p className="stat-value">{summary.count}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search student..."
          value={searchStudent}
          onChange={(e) => setSearchStudent(e.target.value)}
          className="search-input"
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="partial">Partial</option>
          <option value="unpaid">Unpaid</option>
          <option value="overdue">Overdue</option>
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
          <option value="">All Types</option>
          <option value="tuition">Tuition</option>
          <option value="exam">Exam</option>
          <option value="library">Library</option>
          <option value="transport">Transport</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Fees Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Roll #</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFees.map((fee) => (
              <tr key={fee._id}>
                <td>{fee.student?.user?.fullName || 'N/A'}</td>
                <td>{fee.student?.rollNumber || 'N/A'}</td>
                <td>
                  <span className={`badge badge-${fee.feeType}`}>{fee.feeType}</span>
                </td>
                <td>${fee.amount.toLocaleString()}</td>
                <td>${fee.paidAmount.toLocaleString()}</td>
                <td className={fee.balance > 0 ? 'text-danger' : ''}>
                  ${fee.balance.toLocaleString()}
                </td>
                <td>
                  <span className={`badge badge-${fee.status}`}>{fee.status}</span>
                </td>
                <td>{new Date(fee.dueDate).toLocaleDateString()}</td>
                <td>
                  <Link to={`/fees/${fee._id}`} className="btn btn-sm btn-view">View</Link>
                  {user?.role === 'admin' && fee.status !== 'paid' && (
                    <Link to={`/fees/${fee._id}/pay`} className="btn btn-sm btn-primary">Pay</Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredFees.length === 0 && (
        <p className="empty-state">No fee records found.</p>
      )}
    </div>
  );
};

export default Fees;