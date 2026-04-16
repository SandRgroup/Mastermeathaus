import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { ArrowLeft, Check, Shield, Truck, Award, Users } from 'lucide-react';
import '../../styles/MembershipDetail.css';

const MembershipDetail = () => {
  const navigate = useNavigate();
  const { plan } = useParams();

  const membershipData = {
    free: {
      name: 'Pit Pass',
      tagline: 'Start Your Journey',
      monthlyPrice: 0,
      yearlyPrice: 0,
      description: 'Perfect for those just discovering premium meats. Get access to our full selection at standard pricing.',
      features: [
        'Access to all cuts',
        'Standard pricing',
        'Email support',
        'Monthly newsletter',
        'Cooking guides'
      ],
      benefits: [
        'Browse full product catalog',
        'No commitment required',
        'Standard delivery rates',
        'Access to recipes and tips'
      ],
      bestFor: [
        'First-time buyers',
        'Occasional purchasers',
        'Those wanting to try before committing'
      ],
      icon: Users
    },
    select: {
      name: 'Prime Select',
      tagline: 'Better Pricing, Better Value',
      monthlyPrice: 5,
      yearlyPrice: 42,
      description: 'Step up your game with better pricing on every order. Perfect for regular meat lovers.',
      features: [
        'Better pricing',
        'Early access to new products',
        'Priority email support',
        'Exclusive recipes',
        'Member-only deals'
      ],
      benefits: [
        'Save on every order',
        'Be first to try new cuts',
        'Faster customer support',
        'Access to exclusive content'
      ],
      bestFor: [
        'Regular home cooks',
        'BBQ enthusiasts',
        'Those who order monthly'
      ],
      icon: Award
    },
    prime: {
      name: 'Master Cut',
      tagline: 'Premium Access, Premium Savings',
      monthlyPrice: 13,
      yearlyPrice: 109,
      description: 'Lower pricing and priority treatment. For serious meat enthusiasts who demand the best.',
      features: [
        'Lower pricing',
        'Priority availability',
        'Priority phone support',
        'Exclusive product access',
        'Advanced cooking techniques',
        'Member appreciation events'
      ],
      benefits: [
        'Maximum savings on all orders',
        'Never miss limited cuts',
        'Phone and email support',
        'VIP treatment'
      ],
      bestFor: [
        'Serious home chefs',
        'Regular grill masters',
        'Those who order bi-weekly'
      ],
      icon: Shield
    },
    premium: {
      name: 'Black Label',
      tagline: 'The Ultimate Experience',
      monthlyPrice: 20,
      yearlyPrice: 168,
      highlight: true,
      description: 'The pinnacle of membership. Free delivery, best pricing, and concierge-level service.',
      features: [
        'Free delivery',
        'Best pricing',
        'Concierge service',
        'Exclusive ultra-premium cuts',
        'Private masterclasses',
        'Personal butcher consultation',
        'VIP event invitations'
      ],
      benefits: [
        'Zero delivery fees',
        'Absolute lowest prices',
        '24/7 concierge support',
        'Access to reserve inventory',
        'Personalized recommendations'
      ],
      bestFor: [
        'Professional chefs',
        'Dedicated meat connoisseurs',
        'Weekly shoppers',
        'Those seeking white-glove service'
      ],
      icon: Truck
    }
  };

  const currentPlan = membershipData[plan] || membershipData.free;
  const IconComponent = currentPlan.icon;

  return (
    <div className="membership-detail-page">
      <div className="membership-detail-container">
        <Button onClick={() => navigate('/')} className="back-btn" variant="ghost">
          <ArrowLeft size={18} />
          Back to Home
        </Button>

        <div className="detail-hero">
          <div className="detail-icon">
            <IconComponent size={48} />
          </div>
          <h1>{currentPlan.name}</h1>
          <p className="detail-tagline">{currentPlan.tagline}</p>
          <p className="detail-description">{currentPlan.description}</p>
        </div>

        <div className="pricing-cards">
          <Card className="pricing-card">
            <div className="pricing-label">Monthly</div>
            <div className="pricing-amount">
              <span className="currency">$</span>
              <span className="price">{currentPlan.monthlyPrice}</span>
              <span className="period">/mo</span>
            </div>
            <div className="pricing-note">Billed monthly</div>
            <Button className="select-plan-btn" onClick={() => window.location.href = 'https://mastersmeathaus.com'}>
              Choose Monthly
            </Button>
          </Card>

          {currentPlan.monthlyPrice > 0 && (
            <Card className={`pricing-card ${currentPlan.highlight ? 'recommended' : ''}`}>
              {currentPlan.highlight && <div className="recommended-badge">Recommended</div>}
              <div className="pricing-label">Yearly <span className="savings-tag">Save 30%</span></div>
              <div className="pricing-amount">
                <span className="currency">$</span>
                <span className="price">{currentPlan.yearlyPrice}</span>
                <span className="period">/yr</span>
              </div>
              <div className="pricing-note">
                ${((currentPlan.monthlyPrice * 12 - currentPlan.yearlyPrice) / 12).toFixed(0)}/mo savings
              </div>
              <Button className="select-plan-btn highlight" onClick={() => window.location.href = 'https://mastersmeathaus.com'}>
                Choose Yearly
              </Button>
            </Card>
          )}
        </div>

        <section className="features-section">
          <h2>What's Included</h2>
          <div className="features-grid">
            {currentPlan.features.map((feature, index) => (
              <div key={index} className="feature-item-detail">
                <Check size={20} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="benefits-section">
          <h2>Member Benefits</h2>
          <div className="benefits-grid">
            {currentPlan.benefits.map((benefit, index) => (
              <Card key={index} className="benefit-card">
                <p>{benefit}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="best-for-section">
          <h2>Best For</h2>
          <div className="best-for-list">
            {currentPlan.bestFor.map((item, index) => (
              <div key={index} className="best-for-item">
                <div className="bullet" />
                <p>{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <Card className="cta-card">
            <h3>Ready to join {currentPlan.name}?</h3>
            <p>Start saving on premium meats today</p>
            <div className="cta-buttons">
              <Button className="cta-primary" onClick={() => window.location.href = 'https://mastersmeathaus.com'}>
                Get Started
              </Button>
              <Button className="cta-secondary" variant="outline" onClick={() => navigate('/contact')}>
                Contact Us
              </Button>
            </div>
          </Card>
        </section>

        <section className="faq-section">
          <h2>Common Questions</h2>
          <div className="faq-grid">
            <Card className="faq-card">
              <h4>Can I cancel anytime?</h4>
              <p>Yes, you can cancel your membership at any time. Cancellation takes effect at the end of your current billing period.</p>
            </Card>
            <Card className="faq-card">
              <h4>What if I don't use it?</h4>
              <p>Membership fees are non-refundable, but your benefits remain active until the end of your billing period even after cancellation.</p>
            </Card>
            <Card className="faq-card">
              <h4>Can I switch plans?</h4>
              <p>Yes, you can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.</p>
            </Card>
            <Card className="faq-card">
              <h4>How does billing work?</h4>
              <p>Monthly plans bill every month. Yearly plans bill once per year with a 30% discount compared to monthly pricing.</p>
            </Card>
          </div>
        </section>

        <div className="policy-links">
          <a href="/membership-terms">View Membership Terms</a>
          <a href="/refund-policy">Refund Policy</a>
          <a href="/contact">Contact Support</a>
        </div>
      </div>
    </div>
  );
};

export default MembershipDetail;
