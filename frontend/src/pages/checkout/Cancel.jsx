import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { XCircle } from 'lucide-react';
import '../../styles/Checkout.css';

const Cancel = () => {
  const navigate = useNavigate();

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="status-message">
          <XCircle size={64} color="#ef4444" />
          <h1>Payment Cancelled</h1>
          <p>Your order was not completed. Your cart has been saved.</p>
          <div className="button-group">
            <Button onClick={() => navigate('/checkout')}>Return to Checkout</Button>
            <Button variant="outline" onClick={() => navigate('/')}>Continue Shopping</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cancel;
