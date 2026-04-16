import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { ArrowLeft, Mail, Phone, Clock } from 'lucide-react';
import '../../styles/Policies.css';

const ContactPage = () => {
  const navigate = useNavigate();

  return (
    <div className="policy-page">
      <div className="policy-container">
        <Button onClick={() => navigate('/')} className="back-btn" variant="ghost">
          <ArrowLeft size={18} />
          Back to Home
        </Button>

        <h1>Contact Us</h1>
        <p className="policy-intro">We're here to help.</p>

        <div className="contact-cards">
          <Card className="contact-card">
            <Mail size={32} />
            <h3>Email</h3>
            <a href="mailto:hello@mastersmeathaus.com">hello@mastersmeathaus.com</a>
          </Card>

          <Card className="contact-card">
            <Phone size={32} />
            <h3>Phone</h3>
            <a href="tel:8178072489">817-807-2489</a>
          </Card>

          <Card className="contact-card">
            <Clock size={32} />
            <h3>Support Hours</h3>
            <p>Monday – Friday</p>
            <p>9 AM – 5 PM (CST)</p>
          </Card>
        </div>

        <section>
          <h2>For Faster Support</h2>
          <p>When contacting us, please include:</p>
          <ul>
            <li>Order number</li>
            <li>Photos (if applicable)</li>
            <li>Clear explanation of your issue</li>
          </ul>
          <p className="response-time">We typically respond within <strong>24–48 hours</strong>.</p>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;
