import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import '../../styles/Policies.css';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="policy-page">
      <div className="policy-container">
        <Button onClick={() => navigate('/')} className="back-btn" variant="ghost">
          <ArrowLeft size={18} />
          Back to Home
        </Button>

        <h1>Privacy Policy</h1>
        <p className="policy-intro">MasterMeatBox respects your privacy and protects your personal information.</p>

        <section>
          <h2>📊 Information We Collect</h2>
          <p>We collect:</p>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Shipping address</li>
            <li>Payment details (processed securely via Stripe)</li>
          </ul>
        </section>

        <section>
          <h2>🎯 How We Use Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Process orders</li>
            <li>Provide customer support</li>
            <li>Send order updates</li>
            <li>Send promotions (optional opt-out available)</li>
          </ul>
        </section>

        <section>
          <h2>💳 Payment Security</h2>
          <p>All payments are processed securely via Stripe. We do not store full credit card information.</p>
        </section>

        <section>
          <h2>🤝 Data Sharing</h2>
          <p>We do not sell personal data. Information is only shared with:</p>
          <ul>
            <li>Payment processors</li>
            <li>Shipping carriers</li>
          </ul>
        </section>

        <section>
          <h2>🍪 Cookies</h2>
          <p>We may use cookies to improve website performance and user experience.</p>
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

export default PrivacyPolicy;
