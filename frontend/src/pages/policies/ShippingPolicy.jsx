import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import '../../styles/Policies.css';

const ShippingPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="policy-page">
      <div className="policy-container">
        <Button onClick={() => navigate('/')} className="back-btn" variant="ghost">
          <ArrowLeft size={18} />
          Back to Home
        </Button>

        <h1>Shipping Policy</h1>
        <p className="policy-intro">MasterMeatBox provides fast, temperature-controlled delivery of premium meat products across the United States.</p>

        <section>
          <h2>📦 Processing Time</h2>
          <p>Orders are processed within 1–3 business days (excluding weekends and holidays).</p>
        </section>

        <section>
          <h2>🚚 Shipping Method</h2>
          <p>All orders are shipped using trusted carriers in insulated, temperature-controlled packaging designed to maintain safe food temperatures during transit.</p>
        </section>

        <section>
          <h2>⏱ Delivery Time</h2>
          <p>Estimated delivery time is 2–5 business days, depending on location. Most orders arrive within 48 hours after shipment.</p>
        </section>

        <section>
          <h2>❄️ Temperature-Controlled Delivery</h2>
          <p>Products are shipped frozen or chilled. Orders may arrive in the following safe conditions:</p>
          <ul>
            <li>Fully frozen</li>
            <li>Partially thawed but still cold</li>
            <li>Refrigerated (fresh condition)</li>
          </ul>
          <p>This is normal and safe.</p>
          <p>Customers should refrigerate or freeze items immediately upon delivery.</p>
        </section>

        <section>
          <h2>📍 Customer Responsibility</h2>
          <p>Customers are responsible for:</p>
          <ul>
            <li>Providing a correct shipping address</li>
            <li>Retrieving packages promptly upon delivery</li>
            <li>Proper storage after delivery</li>
          </ul>
        </section>

        <section>
          <h2>⚠️ Delivery Issues</h2>
          <p>If your order arrives damaged or unsafe, contact us within 24 hours with photos.</p>
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

export default ShippingPolicy;
