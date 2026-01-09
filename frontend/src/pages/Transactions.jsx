import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TEST_MERCHANT } from '../services/api';
import axios from 'axios';

function Transactions() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const email = localStorage.getItem('merchantEmail');
    if (!email) {
      navigate('/login');
      return;
    }

    fetchPayments();
  }, [navigate]);
  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPayments();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all payments
      // Note: Since we don't have a list endpoint yet, this will fail gracefully
      // In a real implementation, you'd have GET /api/v1/payments endpoint
      const response = await axios.get('http://localhost:8000/api/v1/payments', {
        headers: {
          'X-Api-Key': TEST_MERCHANT.apiKey,
          'X-Api-Secret': TEST_MERCHANT.apiSecret
        }
      });
      
      setPayments(response.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError('Unable to fetch payments. Make sure you have created some payments first.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('merchantEmail');
    navigate('/login');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatAmount = (amount) => {
    if (!amount) return '₹0.00';
    return `₹${(amount / 100).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return '#28a745';
      case 'failed':
        return '#dc3545';
      case 'processing':
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '30px'
      }}>
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link 
              to="/dashboard" 
              style={{
                textDecoration: 'none',
                color: '#007bff',
                fontSize: '18px'
              }}
            >
              ← Back
            </Link>
            <h1 style={{ margin: 0 }}>Transactions</h1>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
          <button 
            onClick={fetchPayments}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              Loading transactions...
            </div>
          ) : error ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#666'
            }}>
              <p>{error}</p>
              <p style={{ marginTop: '20px' }}>
                Create some payments via the API first, then refresh this page.
              </p>
            </div>
          ) : payments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              No transactions yet. Create your first payment via the API!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table 
                data-test-id="transactions-table"
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px'
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Payment ID</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Order ID</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Method</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr 
                      key={payment.id}
                      data-test-id={`transaction-row-${payment.id}`}
                      style={{ borderBottom: '1px solid #dee2e6' }}
                    >
                      <td 
                        data-test-id="payment-id"
                        style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}
                      >
                        {payment.id}
                      </td>
                      <td 
                        data-test-id="order-id"
                        style={{ padding: '12px', fontFamily: 'monospace', fontSize: '12px' }}
                      >
                        {payment.order_id}
                      </td>
                      <td 
                        data-test-id="amount"
                        style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}
                      >
                        {formatAmount(payment.amount)}
                      </td>
                      <td 
                        data-test-id="method"
                        style={{ padding: '12px', textTransform: 'uppercase' }}
                      >
                        {payment.method}
                      </td>
                      <td data-test-id="status" style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: getStatusColor(payment.status) + '20',
                          color: getStatusColor(payment.status)
                        }}>
                          {payment.status}
                        </span>
                      </td>
                      <td 
                        data-test-id="created-at"
                        style={{ padding: '12px', fontSize: '12px', color: '#666' }}
                      >
                        {formatDate(payment.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Transactions;