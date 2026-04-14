import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../../components/ui/button';
import { CheckCircle } from 'lucide-react';
import axios from 'axios';
import '../../styles/Checkout.css';

const Success = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      pollPaymentStatus(sessionId);
    }
  }, [searchParams]);

  const pollPaymentStatus = async (sessionId, attempts = 0) => {
    const maxAttempts = 5;
    
    if (attempts >= maxAttempts) {
      setStatus('timeout');
      return;
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/checkout/status/${sessionId}`);
      
      if (data.payment_status === 'paid') {
        setStatus('success');
        clearCart();
        return;
      } else if (data.status === 'expired') {
        setStatus('expired');
        return;
      }

      setTimeout(() => pollPaymentStatus(sessionId, attempts + 1), 2000);
    } catch (error) {
      console.error('Status check failed:', error);
      setStatus('error');
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {status === 'checking' && (
          <div className="status-message">
            <div className="spinner"></div>
            <h2>Verifying your payment...</h2>
          </div>
        )}
        
        {status === 'success' && (
          <div className="status-message success">
            <CheckCircle size={64} color="#22c55e" />
            <h1>Payment Successful!</h1>
            <p>Thank you for your order. You will receive a confirmation email shortly.</p>
            <Button onClick={() => navigate('/')}>Continue Shopping</Button>
          </div>
        )}
        
        {(status === 'error' || status === 'timeout' || status === 'expired') && (
          <div className="status-message error">
            <h1>Payment Verification Issue</h1>
            <p>Please check your email for confirmation or contact support.</p>
            <Button onClick={() => navigate('/')}>Return to Home</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Success;
