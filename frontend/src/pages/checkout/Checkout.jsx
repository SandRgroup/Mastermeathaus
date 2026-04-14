import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import axios from 'axios';
import { toast } from 'sonner';
import '../../styles/Checkout.css';

const Checkout = () => {
  const { cart, getTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/checkout/session`, {
        cart_items: cart,
        origin_url: window.location.origin
      });
      
      // Redirect to Stripe
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Checkout failed. Please try again.');
      console.error('Checkout error:', error);
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <h1>Your cart is empty</h1>
          <Button onClick={() => window.location.href = '/'}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Checkout</h1>
        
        <div className="checkout-grid">
          <div className="order-summary">
            <h2>Order Summary</h2>
            {cart.map((item, index) => (
              <Card key={index} className="checkout-item">
                <img src={item.image} alt={item.product_name} />
                <div className="item-details">
                  <h3>{item.product_name}</h3>
                  <p>{item.weight} × {item.quantity}</p>
                  {item.subscribe && <span className="subscribe-badge">Subscribe & Save 10%</span>}
                </div>
                <div className="item-price">
                  ${(item.price * item.quantity * (item.subscribe ? 0.9 : 1)).toFixed(2)}
                </div>
              </Card>
            ))}
            
            <div className="order-total">
              <span>Total:</span>
              <span className="total-amount">${getTotal().toFixed(2)}</span>
            </div>
          </div>
          
          <div className="payment-section">
            <h2>Payment</h2>
            <Card className="payment-card">
              <p>You will be redirected to Stripe to complete your payment securely.</p>
              <Button 
                className="pay-btn" 
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Pay $${getTotal().toFixed(2)}`}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
