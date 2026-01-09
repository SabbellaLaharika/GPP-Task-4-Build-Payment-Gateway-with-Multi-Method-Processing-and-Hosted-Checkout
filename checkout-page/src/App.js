import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:8000';
const TEST_MERCHANT = {
  apiKey: 'key_test_abc123',
  apiSecret: 'secret_test_xyz789'
};

function App() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // UPI fields
  const [vpa, setVpa] = useState('');
  
  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [holderName, setHolderName] = useState('');
  
  // Payment state
  const [paymentId, setPaymentId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Get order_id from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderIdFromUrl = params.get('order_id');
    if (orderIdFromUrl) {
      setOrderId(orderIdFromUrl);
      fetchOrder(orderIdFromUrl);
    }
  }, []);

  const fetchOrder = async (orderId) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${API_BASE_URL}/api/v1/orders/${orderId}`, {
        headers: {
          'X-Api-Key': TEST_MERCHANT.apiKey,
          'X-Api-Secret': TEST_MERCHANT.apiSecret
        }
      });
      
      setOrder(response.data);
    } catch (err) {
      setError('Order not found. Please check the order ID.');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setProcessingPayment(true);

    try {
      const paymentData = {
        orderId: orderId,
        method: paymentMethod
      };

      if (paymentMethod === 'upi') {
        paymentData.vpa = vpa;
      } else if (paymentMethod === 'card') {
        paymentData.cardNumber = cardNumber;
        paymentData.expiryMonth = expiryMonth;
        paymentData.expiryYear = expiryYear;
        paymentData.cvv = cvv;
        paymentData.holderName = holderName;
      }

      const response = await axios.post(`${API_BASE_URL}/api/v1/payments`, paymentData, {
        headers: {
          'X-Api-Key': TEST_MERCHANT.apiKey,
          'X-Api-Secret': TEST_MERCHANT.apiSecret,
          'Content-Type': 'application/json'
        }
      });

      setPaymentId(response.data.id);
      setPaymentStatus(response.data.status);

      // Poll for payment status
      pollPaymentStatus(response.data.id);

    } catch (err) {
      setError(err.response?.data?.description || 'Payment failed. Please try again.');
      setProcessingPayment(false);
      console.error('Error processing payment:', err);
    }
  };

  const pollPaymentStatus = async (paymentId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/payments/${paymentId}`, {
          headers: {
            'X-Api-Key': TEST_MERCHANT.apiKey,
            'X-Api-Secret': TEST_MERCHANT.apiSecret
          }
        });

        setPaymentStatus(response.data.status);

        if (response.data.status === 'success' || response.data.status === 'failed') {
          clearInterval(pollInterval);
          setProcessingPayment(false);
        }
      } catch (err) {
        console.error('Error polling payment status:', err);
        clearInterval(pollInterval);
        setProcessingPayment(false);
      }
    }, 2000); // Poll every 2 seconds

    // Stop polling after 30 seconds
    setTimeout(() => {
      clearInterval(pollInterval);
      setProcessingPayment(false);
    }, 30000);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container">
        <div className="error-container">
          <h2>Order Not Found</h2>
          <p>Please provide a valid order_id in the URL.</p>
          <p>Example: http://localhost:3001?order_id=order_XXX</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="container">
        <div data-test-id="success-state" className="success-container">
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <p data-test-id="payment-id">Payment ID: {paymentId}</p>
          <p data-test-id="success-message">Your payment has been processed successfully.</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="container">
        <div data-test-id="error-state" className="error-container">
          <div className="error-icon">✗</div>
          <h2>Payment Failed</h2>
          <p data-test-id="payment-id">Payment ID: {paymentId}</p>
          <p data-test-id="error-message">Payment could not be processed. Please try again.</p>
          <button 
            data-test-id="retry-button"
            onClick={() => {
              setPaymentStatus('');
              setPaymentId('');
            }}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (processingPayment) {
    return (
      <div className="container">
        <div data-test-id="processing-state" className="processing-container">
          <div className="spinner"></div>
          <h2>Processing payment...</h2>
          <p data-test-id="processing-message">Please wait while we process your payment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" data-test-id="checkout-container">
      <div className="checkout-card">
        <h1>Complete Your Payment</h1>

        {/* Order Summary */}
        <div data-test-id="order-summary" className="order-summary">
          <h2>Order Summary</h2>
          <div className="order-details">
            <div className="order-row">
              <span>Order ID:</span>
              <span data-test-id="order-id">{order.id}</span>
            </div>
            <div className="order-row">
              <span>Amount:</span>
              <span data-test-id="order-amount" className="amount">₹{(order.amount / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {/* Payment Method Selection */}
        {!paymentMethod && (
          <div data-test-id="payment-methods" className="payment-methods">
            <h2>Select Payment Method</h2>
            <div className="method-buttons">
              <button
                data-test-id="method-upi"
                onClick={() => setPaymentMethod('upi')}
                className="method-button"
              >
                <span className="method-icon">📱</span>
                <span>UPI</span>
              </button>
              <button
                data-test-id="method-card"
                onClick={() => setPaymentMethod('card')}
                className="method-button"
              >
                <span className="method-icon">💳</span>
                <span>Card</span>
              </button>
            </div>
          </div>
        )}

        {/* UPI Payment Form */}
        {paymentMethod === 'upi' && (
          <form data-test-id="upi-form" onSubmit={handlePayment} className="payment-form">
            <h2>UPI Payment</h2>
            <div className="form-group">
              <label>UPI ID</label>
              <input
                data-test-id="vpa-input"
                type="text"
                placeholder="username@upi"
                value={vpa}
                onChange={(e) => setVpa(e.target.value)}
                required
              />
            </div>
            <button data-test-id="pay-button" type="submit" className="pay-button">
              Pay ₹{(order.amount / 100).toFixed(2)}
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('')}
              className="back-button"
            >
              Change Method
            </button>
          </form>
        )}

        {/* Card Payment Form */}
        {paymentMethod === 'card' && (
          <form data-test-id="card-form" onSubmit={handlePayment} className="payment-form">
            <h2>Card Payment</h2>
            <div className="form-group">
              <label>Card Number</label>
              <input
                data-test-id="card-number-input"
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength="19"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Month</label>
                <input
                  data-test-id="expiry-input"
                  type="text"
                  placeholder="MM"
                  value={expiryMonth}
                  onChange={(e) => setExpiryMonth(e.target.value)}
                  maxLength="2"
                  required
                />
              </div>
              <div className="form-group">
                <label>Expiry Year</label>
                <input
                  type="text"
                  placeholder="YY"
                  value={expiryYear}
                  onChange={(e) => setExpiryYear(e.target.value)}
                  maxLength="2"
                  required
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  data-test-id="cvv-input"
                  type="text"
                  placeholder="123"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  maxLength="4"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Cardholder Name</label>
              <input
                data-test-id="cardholder-name-input"
                type="text"
                placeholder="Name on Card"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                required
              />
            </div>
            <button data-test-id="pay-button" type="submit" className="pay-button">
              Pay ₹{(order.amount / 100).toFixed(2)}
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('')}
              className="back-button"
            >
              Change Method
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default App;