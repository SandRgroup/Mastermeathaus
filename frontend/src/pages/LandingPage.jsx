import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Check, Package, Thermometer, Truck, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const handleAddToCart = (productName) => {
    toast.success(`${productName} added to cart`, {
      description: 'Continue shopping or checkout',
      duration: 3000,
    });
  };

  const featuredCuts = [
    {
      name: "A5 Wagyu Ribeye",
      description: "Premium Japanese marbling",
      price: "$XX.XX",
      image: "https://images.unsplash.com/photo-1602470521006-59ab77068b0d"
    },
    {
      name: "American Wagyu NY Strip",
      description: "Rich flavor, tender texture",
      price: "$XX.XX",
      image: "https://images.unsplash.com/photo-1690983321750-ad6f6d59a84b"
    },
    {
      name: "Dry-Aged Ribeye",
      description: "45-day aged perfection",
      price: "$XX.XX",
      image: "https://images.unsplash.com/photo-1690983323238-0b91789e1b5a"
    },
    {
      name: "Tomahawk Steak",
      description: "Impressive presentation cut",
      price: "$XX.XX",
      image: "https://images.unsplash.com/photo-1632154023554-c2975e9be348"
    },
    {
      name: "Filet Mignon",
      description: "Ultimate tenderness",
      price: "$XX.XX",
      image: "https://images.unsplash.com/photo-1666013942642-b7b54ecafd7d"
    },
    {
      name: "Wagyu Picanha",
      description: "Brazilian cut, Japanese quality",
      price: "$XX.XX",
      image: "https://images.unsplash.com/photo-1547050605-2f268cd5daf0"
    }
  ];

  const membershipPlans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      features: ["Access to all cuts", "Standard pricing"],
      highlight: false
    },
    {
      name: "Select",
      price: "$4.99",
      period: "/month",
      features: ["Better pricing", "Early access"],
      highlight: false
    },
    {
      name: "Prime",
      price: "$12.99",
      period: "/month",
      features: ["Lower pricing", "Priority availability"],
      highlight: false
    },
    {
      name: "Premium",
      price: "$19.99",
      period: "/month",
      features: ["Free delivery", "Best pricing", "Priority fulfillment"],
      highlight: true
    }
  ];

  const testimonials = [
    {
      text: "Best quality I've found online. Consistent and reliable.",
      author: "Michael R."
    },
    {
      text: "Simple ordering, premium cuts. Exactly what I needed.",
      author: "Sarah K."
    },
    {
      text: "The dry-aged ribeye is exceptional. Worth every penny.",
      author: "James L."
    }
  ];

  return (
    <div className="butcher-page">
      {/* SECTION 1: HERO */}
      <section className="hero">
        <div className="hero-content">
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Premium cuts. No shortcuts.
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            A modern online butcher shop delivering top-quality prime and Wagyu cuts — fresh, simple, and reliable.
          </motion.p>
          <motion.div
            className="hero-ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button className="primary-btn" onClick={() => window.location.href = 'https://mastermeatbox.com'}>
              Shop Cuts
            </Button>
            <Button className="secondary-btn" onClick={() => window.location.href = 'https://mastermeatbox.com'}>
              View Membership
            </Button>
          </motion.div>
          <p className="hero-note">Limited delivery areas · contact for availability</p>
        </div>
      </section>

      {/* SECTION 2: FEATURED CUTS */}
      <section className="featured-cuts">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our top cuts</h2>
            <p className="section-subtitle">A small selection, chosen for quality — not quantity.</p>
          </div>

          <div className="products-grid">
            {featuredCuts.map((product, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="product-card">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-footer">
                      <span className="product-price">{product.price}</span>
                      <Button 
                        className="add-to-cart-btn"
                        onClick={() => handleAddToCart(product.name)}
                      >
                        Add to cart
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="section-cta">
            <Button className="text-btn" onClick={() => window.location.href = 'https://mastermeatbox.com'}>
              View all cuts <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 3: WHY MASTERMEATBOX */}
      <section className="why-section">
        <div className="container">
          <h2 className="section-title">Quality you can trust</h2>
          <p className="why-body">
            We focus on sourcing and delivering premium cuts without overcomplicating the process. 
            No unnecessary options — just high-quality meat done right.
          </p>
          <div className="highlights-grid">
            <div className="highlight-item">
              <Check className="highlight-icon" />
              <span>Prime & Wagyu quality</span>
            </div>
            <div className="highlight-item">
              <Check className="highlight-icon" />
              <span>Carefully selected cuts</span>
            </div>
            <div className="highlight-item">
              <Check className="highlight-icon" />
              <span>Consistent sourcing</span>
            </div>
            <div className="highlight-item">
              <Check className="highlight-icon" />
              <span>Reliable delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: MEMBERSHIP */}
      <section className="membership-section">
        <div className="container">
          <h2 className="section-title">Membership that works for you</h2>
          
          <div className="membership-grid">
            {membershipPlans.map((plan, index) => (
              <Card key={index} className={`membership-card ${plan.highlight ? 'highlight' : ''}`}>
                <div className="membership-header">
                  <h3 className="membership-name">{plan.name}</h3>
                  <div className="membership-price">
                    <span className="price">{plan.price}</span>
                    <span className="period">{plan.period}</span>
                  </div>
                </div>
                <div className="membership-features">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="feature-item">
                      <Check size={16} />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Button 
                  className={plan.highlight ? "membership-btn highlight" : "membership-btn"}
                  onClick={() => window.location.href = 'https://mastermeatbox.com'}
                >
                  Choose plan
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: DELIVERY */}
      <section className="delivery-section">
        <div className="container">
          <h2 className="section-title">Delivered fresh</h2>
          
          <div className="delivery-steps">
            <div className="delivery-step">
              <Package className="step-icon" />
              <span className="step-label">Order</span>
            </div>
            <ChevronRight className="step-arrow" />
            <div className="delivery-step">
              <Thermometer className="step-icon" />
              <span className="step-label">Packed</span>
            </div>
            <ChevronRight className="step-arrow" />
            <div className="delivery-step">
              <Thermometer className="step-icon" />
              <span className="step-label">Cold-chain</span>
            </div>
            <ChevronRight className="step-arrow" />
            <div className="delivery-step">
              <Truck className="step-icon" />
              <span className="step-label">Delivered</span>
            </div>
          </div>

          <p className="delivery-text">
            We handle every order with temperature-controlled logistics to keep your cuts fresh.
          </p>

          <Button className="text-btn" onClick={() => window.location.href = 'https://mastermeatbox.com'}>
            Learn more <ChevronRight size={20} />
          </Button>
        </div>
      </section>

      {/* SECTION 6: TESTIMONIALS */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">Customers trust the quality</h2>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="#C8A96A" stroke="#C8A96A" />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <p className="testimonial-author">— {testimonial.author}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: SHIPPING */}
      <section className="shipping-section">
        <div className="container">
          <h2 className="section-title">Where we deliver</h2>
          <p className="shipping-text">
            We currently serve select areas.<br/>
            If you're outside, contact us to check availability.
          </p>
          <Button className="secondary-btn" onClick={() => window.location.href = 'mailto:hello@mastermeatbox.com'}>
            Email us
          </Button>
        </div>
      </section>

      {/* SECTION 8: FINAL CTA */}
      <section className="final-cta">
        <div className="container">
          <h2 className="final-title">Better cuts start here</h2>
          <Button className="final-btn" onClick={() => window.location.href = 'https://mastermeatbox.com'}>
            Shop Mastermeatbox
          </Button>
          <p className="final-subtext">Premium cuts. Simple process.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-brand">
            <h3>Mastermeatbox</h3>
            <p>Top-quality cuts, delivered right.</p>
          </div>
          <div className="footer-links">
            <a href="https://mastermeatbox.com">Privacy</a>
            <a href="https://mastermeatbox.com">Delivery</a>
            <a href="https://mastermeatbox.com">Membership</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
