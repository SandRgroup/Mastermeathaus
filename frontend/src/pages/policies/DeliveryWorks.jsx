import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { ArrowLeft, Package, Thermometer, Truck, MapPin, Snowflake, AlertCircle } from 'lucide-react';
import '../../styles/Policies.css';

const DeliveryWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="policy-page">
      <div className="policy-container">
        <Button onClick={() => navigate('/')} className="back-btn" variant="ghost">
          <ArrowLeft size={18} />
          Back to Home
        </Button>

        <h1>How Our Delivery Works</h1>
        <p className="policy-intro">At MasterMeatBox, we make sure every order is handled with care from the moment it leaves our facility to the moment it arrives at your door.</p>

        <div className="delivery-steps">
          <Card className="delivery-step">
            <div className="step-icon">
              <Package size={40} />
            </div>
            <h2>📦 Step 1: Order Processing</h2>
            <p>Once your order is placed, it is carefully reviewed, packed, and prepared within <strong>1–3 business days</strong>. Each box is assembled with attention to quality and food safety.</p>
          </Card>

          <Card className="delivery-step">
            <div className="step-icon">
              <Thermometer size={40} />
            </div>
            <h2>❄️ Step 2: Temperature-Controlled Packing</h2>
            <p>All products are packed using insulated materials and cooling elements designed to maintain safe temperatures during transit.</p>
            <p>Your order may arrive:</p>
            <ul>
              <li>Fully frozen</li>
              <li>Partially thawed but still cold</li>
              <li>Refrigerated (fresh condition)</li>
            </ul>
            <p className="note">This is completely normal and safe.</p>
          </Card>

          <Card className="delivery-step">
            <div className="step-icon">
              <Truck size={40} />
            </div>
            <h2>🚚 Step 3: Shipping & Transit</h2>
            <p>Orders are shipped using trusted delivery carriers with fast, trackable shipping.</p>
            <p>Typical delivery time is <strong>2–5 business days</strong>, depending on your location.</p>
            <p>In most cases, your order arrives within <strong>48 hours</strong> once shipped.</p>
          </Card>

          <Card className="delivery-step">
            <div className="step-icon">
              <MapPin size={40} />
            </div>
            <h2>📍 Step 4: Delivery to Your Door</h2>
            <p>Your package will be delivered directly to your address. We recommend retrieving your package as soon as possible after delivery.</p>
          </Card>

          <Card className="delivery-step">
            <div className="step-icon">
              <Snowflake size={40} />
            </div>
            <h2>🧊 Step 5: Storage Instructions</h2>
            <p>Upon arrival:</p>
            <ul>
              <li>Refrigerate or freeze immediately</li>
              <li>Do not leave package outside for extended periods</li>
              <li>Follow standard food safety handling practices</li>
            </ul>
          </Card>
        </div>

        <section className="important-notes">
          <h2><AlertCircle size={24} /> Important Notes</h2>
          <ul>
            <li>Delivery times may vary due to weather, carrier delays, or high order volume</li>
            <li>We are not responsible for delays once the package is with the carrier</li>
            <li>Customers must provide accurate shipping information at checkout</li>
            <li>Perishable goods should be handled promptly upon delivery</li>
          </ul>
        </section>

        <section className="contact-section">
          <h2>📞 Need Help?</h2>
          <p>If you experience any issue with your delivery, contact our support team within 24 hours of receiving your order.</p>
          <p>📧 Email: <a href="mailto:hello@mastermeatbox.com">hello@mastermeatbox.com</a></p>
          <p>📱 Phone: <a href="tel:8178072489">817-807-2489</a></p>
          <p>🕒 Support Hours: Monday – Friday, 9 AM – 5 PM (CST)</p>
          <p className="contact-note">We are here to ensure every order meets our quality standards.</p>
        </section>
      </div>
    </div>
  );
};

export default DeliveryWorks;
