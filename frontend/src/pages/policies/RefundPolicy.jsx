import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import '../../styles/Policies.css';

const RefundPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="policy-page">
      <div className="policy-container">
        <Button onClick={() => navigate('/')} className="back-btn" variant="ghost">
          <ArrowLeft size={18} />
          Back to Home
        </Button>

        <h1>Refund & Return Policy</h1>
        <p className="policy-intro">Due to the perishable nature of our products, all sales are final.</p>

        <section>
          <h2>🚫 No Returns</h2>
          <p>We do not accept returns on food products.</p>
        </section>

        <section>
          <h2>❗ Damaged Orders</h2>
          <p>If your order arrives damaged, incorrect, or unsafe, contact us within 24 hours of delivery with:</p>
          <ul>
            <li>Photos of the product</li>
            <li>Photos of packaging</li>
            <li>Order number</li>
          </ul>
          <p>If approved, we may offer:</p>
          <ul>
            <li>Replacement</li>
            <li>Store credit</li>
            <li>Partial or full refund (case-by-case basis)</li>
          </ul>
        </section>

        <section>
          <h2>🚚 Non-Refundable Cases</h2>
          <p>We do not offer refunds for:</p>
          <ul>
            <li>Incorrect shipping address</li>
            <li>Carrier delays</li>
            <li>Packages left unattended after delivery</li>
            <li>Personal taste preferences</li>
          </ul>
        </section>

        <section>
          <h2>📦 Order Changes</h2>
          <p>Orders cannot be modified or canceled once processed or shipped.</p>
        </section>

        <section className="contact-section">
          <h3>Contact Information</h3>
          <p>📧 Email: <a href="mailto:hello@mastersmeathaus.com">hello@mastersmeathaus.com</a></p>
          <p>📱 Phone: <a href="tel:8178072489">817-807-2489</a></p>
          <p>🕒 Support Hours: Monday – Friday, 9 AM – 5 PM (CST)</p>
          <p className="contact-note">For order support, please include your order number and photos if applicable.</p>
        </section>
      </div>
    </div>
  );
};

export default RefundPolicy;
