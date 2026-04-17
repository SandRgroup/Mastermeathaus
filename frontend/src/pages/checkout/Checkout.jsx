import React, { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import axios from 'axios';
import { toast } from 'sonner';
import { Tag, X, AlertCircle } from 'lucide-react';
import '../../styles/Checkout.css';

const Checkout = () => {
  const { cart, getTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [validatingDiscount, setValidatingDiscount] = useState(false);
  const [zipCode, setZipCode] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(null);
  const [deliveryExplanation, setDeliveryExplanation] = useState('');
  const [membershipTier, setMembershipTier] = useState(0); // Default: Free tier
  const [calculatingDelivery, setCalculatingDelivery] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const hasSubscribeAndSave = cart.some(item => item.subscribe);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error('Please enter a discount code');
      return;
    }

    if (hasSubscribeAndSave) {
      toast.error('Cannot apply discount codes with Subscribe & Save items. Discount codes and Subscribe & Save are mutually exclusive.');
      return;
    }

    setValidatingDiscount(true);
    try {
      const response = await axios.post(`${backendUrl}/api/validate-discount`, {
        code: discountCode.toUpperCase(),
        cart_total: getTotal()
      });
      
      setAppliedDiscount(response.data);
      toast.success(`Discount code applied! You save $${response.data.discount_amount.toFixed(2)}`);
    } catch (error) {
      console.error('Discount validation error:', error);
      toast.error(error.response?.data?.detail || 'Invalid discount code');
      setAppliedDiscount(null);
    } finally {
      setValidatingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setDiscountCode('');
    setAppliedDiscount(null);
    toast.info('Discount code removed');
  };

  const handleCalculateDelivery = async () => {
    if (!zipCode || zipCode.length < 5) {
      toast.error('Please enter a valid ZIP code');
      return;
    }

    setCalculatingDelivery(true);
    try {
      const response = await axios.post(`${backendUrl}/api/calculate-delivery`, {
        zip_code: zipCode,
        order_total: getTotal(),
        membership_tier: membershipTier
      });
      
      setDeliveryFee(response.data.delivery_fee);
      setDeliveryExplanation(response.data.explanation);
      
      if (response.data.is_free) {
        toast.success('🎉 Free delivery!');
      } else {
        toast.info(`Delivery fee: $${response.data.delivery_fee.toFixed(2)}`);
      }
    } catch (error) {
      console.error('Delivery calculation error:', error);
      toast.error(error.response?.data?.detail || 'Could not calculate delivery fee');
      setDeliveryFee(24.99); // Default fee
      setDeliveryExplanation('Standard delivery fee');
    } finally {
      setCalculatingDelivery(false);
    }
  };

  const handleCheckout = async () => {
    if (!zipCode || zipCode.length < 5) {
      toast.error('Please enter your ZIP code for delivery');
      return;
    }

    if (deliveryFee === null) {
      toast.error('Please calculate delivery fee first');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/checkout/session`, {
        cart_items: cart,
        origin_url: window.location.origin,
        discount_code: appliedDiscount ? appliedDiscount.code : null,
        zip_code: zipCode,
        membership_tier: membershipTier,
        delivery_fee: deliveryFee
      });
      
      if (response.data.discount_applied) {
        toast.success(`Discount applied! Saved $${response.data.discount_amount}`);
      }
      
      // Redirect to Stripe
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Checkout failed. Please try again.');
      console.error('Checkout error:', error);
      setLoading(false);
    }
  };

  const getSubtotal = () => getTotal();
  const getDiscountAmount = () => appliedDiscount ? appliedDiscount.discount_amount : 0;
  const getDeliveryFee = () => deliveryFee !== null ? deliveryFee : 0;
  const getFinalTotal = () => getSubtotal() - getDiscountAmount() + getDeliveryFee();

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
            
            <div className="order-summary-footer">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${getSubtotal().toFixed(2)}</span>
              </div>
              {appliedDiscount && (
                <div className="summary-row discount-row">
                  <span className="discount-label">
                    <Tag size={16} />
                    Discount ({appliedDiscount.code})
                  </span>
                  <span className="discount-value">-${getDiscountAmount().toFixed(2)}</span>
                </div>
              )}
              {deliveryFee !== null && (
                <div className="summary-row delivery-row">
                  <span>Delivery Fee:</span>
                  <span className={deliveryFee === 0 ? 'free-delivery' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
              )}
              {deliveryExplanation && (
                <div className="delivery-explanation">
                  <small>{deliveryExplanation}</small>
                </div>
              )}
              <div className="summary-row total-row">
                <span>Total:</span>
                <span className="total-amount">${getFinalTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="payment-section">
            <h2>Delivery & Payment</h2>
            
            {/* ZIP Code & Delivery Section */}
            <Card className="delivery-card">
              <h3>Delivery Information</h3>
              
              <div className="form-group">
                <label>ZIP Code *</label>
                <div className="zip-input-group">
                  <Input
                    placeholder="Enter ZIP code (e.g., 75238)"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    maxLength={5}
                    disabled={calculatingDelivery}
                  />
                  <Button 
                    onClick={handleCalculateDelivery}
                    disabled={!zipCode || zipCode.length < 5 || calculatingDelivery}
                  >
                    {calculatingDelivery ? 'Calculating...' : 'Calculate Fee'}
                  </Button>
                </div>
                <small className="help-text">Enter your Dallas-area ZIP code to calculate delivery fee</small>
              </div>

              <div className="form-group">
                <label>Membership Tier</label>
                <select 
                  className="membership-select"
                  value={membershipTier} 
                  onChange={(e) => {
                    setMembershipTier(parseInt(e.target.value));
                    setDeliveryFee(null); // Reset delivery fee when tier changes
                  }}
                >
                  <option value={0}>The Stockyard Block (Free)</option>
                  <option value={1}>The Rancher's Select ($14.99/mo)</option>
                  <option value={2}>The Steakhouse Syndicate ($29.99/mo)</option>
                  <option value={3}>The Haus Prime ($49.99/mo)</option>
                </select>
                <small className="help-text">Select your membership tier to see delivery benefits</small>
              </div>
            </Card>
            
            {/* Discount Code Section */}
            <Card className="discount-code-card">
              <h3>Have a discount code?</h3>
              
              {hasSubscribeAndSave && (
                <div className="discount-warning">
                  <AlertCircle size={18} />
                  <p>Discount codes cannot be combined with Subscribe & Save items</p>
                </div>
              )}
              
              {!appliedDiscount ? (
                <div className="discount-input-group">
                  <Input
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    disabled={hasSubscribeAndSave || validatingDiscount}
                    onKeyPress={(e) => e.key === 'Enter' && handleApplyDiscount()}
                  />
                  <Button 
                    onClick={handleApplyDiscount}
                    disabled={hasSubscribeAndSave || validatingDiscount || !discountCode.trim()}
                  >
                    {validatingDiscount ? 'Validating...' : 'Apply'}
                  </Button>
                </div>
              ) : (
                <div className="applied-discount">
                  <div className="discount-info">
                    <Tag size={18} />
                    <div>
                      <span className="discount-code-text">{appliedDiscount.code}</span>
                      <p className="discount-savings">
                        {appliedDiscount.type === 'percentage' 
                          ? `${appliedDiscount.value}% OFF` 
                          : `$${appliedDiscount.value} OFF`
                        }
                        {appliedDiscount.description && ` - ${appliedDiscount.description}`}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleRemoveDiscount}>
                    <X size={18} />
                  </Button>
                </div>
              )}
            </Card>

            <Card className="payment-card">
              <p>You will be redirected to Stripe to complete your payment securely.</p>
              <Button 
                className="pay-btn" 
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Pay $${getFinalTotal().toFixed(2)}`}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
