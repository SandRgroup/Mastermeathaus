import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import '../../styles/Policies.css';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="policy-page">
      <div className="policy-container">
        <Button onClick={() => navigate('/')} className="back-btn" variant="ghost">
          <ArrowLeft size={18} />
          Back to Home
        </Button>

        <h1>Terms of Service</h1>
        <p className="policy-intro">By using MasterMeatBox, you agree to the following terms.</p>

        <section>
          <h2>🛒 Use of Website</h2>
          <p>You agree to use this website only for lawful purposes.</p>
        </section>

        <section>
          <h2>📦 Products</h2>
          <p>We sell perishable food products including beef, chicken, and pork.</p>
        </section>

        <section>
          <h2>💳 Orders & Payment</h2>
          <p>All orders must be paid in full at checkout. We reserve the right to cancel or refuse any order.</p>
        </section>

        <section>
          <h2>🚚 Shipping</h2>
          <p>By purchasing, you acknowledge the risks associated with shipping perishable goods.</p>
        </section>

        <section>
          <h2>❄️ Food Safety</h2>
          <p>Customers are responsible for proper handling and storage after delivery.</p>
        </section>

        <section>
          <h2>⚖️ Limitation of Liability</h2>
          <p>We are not responsible for delays, misuse, or indirect damages.</p>
        </section>

        <section>
          <h2>🔄 Updates</h2>
          <p>We may update these terms at any time.</p>
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

export default TermsOfService;
