import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, Award, Shield, Heart, Truck } from 'lucide-react';
import '../styles/About.css';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <div className="about-container">
        <Button onClick={() => navigate('/')} className="back-btn" variant="ghost">
          <ArrowLeft size={18} />
          Back to Home
        </Button>

        <div className="about-hero">
          <h1>Our Story</h1>
          <p className="hero-tagline">Premium meat delivered with precision and care</p>
        </div>

        <section className="about-section">
          <h2>Who We Are</h2>
          <p>MasterMeatBox is your trusted source for premium meats delivered directly to your door. We partner with the finest ranches and producers across the United States to bring you restaurant-quality cuts without leaving home.</p>
        </section>

        <section className="values-section">
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <Card className="value-card">
              <Award size={40} />
              <h3>Premium Quality</h3>
              <p>We source only USDA Prime and top-tier cuts. Every steak is hand-selected by our master butchers for exceptional marbling, tenderness, and flavor.</p>
            </Card>
            <Card className="value-card">
              <Shield size={40} />
              <h3>Trusted Sourcing</h3>
              <p>Direct partnerships with family-owned ranches. We know where every cut comes from and hold our suppliers to the highest standards of animal welfare and sustainability.</p>
            </Card>
            <Card className="value-card">
              <Heart size={40} />
              <h3>Passion for Excellence</h3>
              <p>Meat is more than food to us—it's craftsmanship. Our team is passionate about delivering the perfect steak experience every single time.</p>
            </Card>
            <Card className="value-card">
              <Truck size={40} />
              <h3>Reliable Delivery</h3>
              <p>Temperature-controlled packaging, fast shipping, and white-glove service. Your order arrives fresh, frozen, and ready to cook.</p>
            </Card>
          </div>
        </section>

        <section className="sourcing-section">
          <h2>Our Sourcing Promise</h2>
          <div className="sourcing-content">
            <div className="sourcing-point">
              <h4>1. Family-Owned Ranches</h4>
              <p>We work exclusively with small, family-owned ranches across the Midwest and Pacific Northwest. These partnerships ensure humane treatment, sustainable practices, and superior quality.</p>
            </div>
            <div className="sourcing-point">
              <h4>2. USDA Prime & Choice</h4>
              <p>Only the top 2-3% of beef earns the USDA Prime grade. Every cut we sell meets or exceeds this standard for marbling, tenderness, and flavor.</p>
            </div>
            <div className="sourcing-point">
              <h4>3. Dry-Aged Perfection</h4>
              <p>Select cuts are dry-aged for 21-45 days to intensify flavor and tenderness. This traditional aging process is rare in modern retail—we bring it to your table.</p>
            </div>
            <div className="sourcing-point">
              <h4>4. Master Butchers</h4>
              <p>Our team includes certified master butchers with decades of experience. They hand-select, trim, and package every order with precision.</p>
            </div>
          </div>
        </section>

        <section className="quality-section">
          <h2>Quality Guarantee</h2>
          <p>If any product doesn't meet your expectations, contact us within 24 hours of delivery with photos. We'll replace it or issue a full refund—no questions asked.</p>
          <p>Your satisfaction is our reputation.</p>
        </section>

        <div className="contact-cta">
          <h3>Questions about our sourcing?</h3>
          <Button onClick={() => navigate('/contact')} className="contact-btn">
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;