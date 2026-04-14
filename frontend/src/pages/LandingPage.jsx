import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Check, Package, Thermometer, Truck, Star, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import '../styles/LandingPage.css';

const ProductCard = ({ product, index }) => {
  const [selectedWeight, setSelectedWeight] = useState('12oz');
  const [subscribeAndSave, setSubscribeAndSave] = useState(false);
  const [showCookingTemp, setShowCookingTemp] = useState(false);

  const weights = ['6oz', '8oz', '12oz', '16oz', '18oz', '20oz', '24oz', '30oz'];
  
  const calculatePrice = (basePrice, weight) => {
    if (basePrice === 'Contact') return 'Contact';
    const base = parseFloat(basePrice.replace('$', ''));
    const weightOz = parseFloat(weight.replace('oz', ''));
    const pricePerOz = base / 12; // Base price is for 12oz
    const newPrice = (pricePerOz * weightOz).toFixed(2);
    return `$${newPrice}`;
  };

  const calculateSavingsPrice = (price) => {
    if (price === 'Contact') return 'Contact';
    const base = parseFloat(price.replace('$', ''));
    return `$${(base * 0.9).toFixed(2)}`;
  };

  const currentPrice = calculatePrice(product.price, selectedWeight);
  const finalPrice = subscribeAndSave ? calculateSavingsPrice(currentPrice) : currentPrice;

  const handleAddToCart = () => {
    const cartMessage = subscribeAndSave 
      ? `${product.name} (${selectedWeight}) added with Subscribe & Save!`
      : `${product.name} (${selectedWeight}) added to cart`;
    toast.success(cartMessage, {
      description: subscribeAndSave ? 'You\'ll save 10% on every delivery' : 'Continue shopping or checkout',
      duration: 3000,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="product-card">
        <div className="product-image">
          {product.badge && <div className="product-badge">{product.badge}</div>}
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-info">
          <div className="product-grade">{product.grade}</div>
          <h3 className="product-name">{product.name}</h3>
          <p className="product-description">{product.description}</p>
          
          {/* Cooking Temperature Info */}
          {product.cookingTemp && (
            <div className="cooking-temp-section">
              <button 
                className="cooking-temp-toggle"
                onClick={() => setShowCookingTemp(!showCookingTemp)}
              >
                <Thermometer size={16} />
                <span>Cooking Guide</span>
                <Info size={14} />
              </button>
              {showCookingTemp && (
                <div className="cooking-temp-info">
                  <div className="temp-item">
                    <span className="temp-label">Rare:</span>
                    <span className="temp-value">120-125°F</span>
                  </div>
                  <div className="temp-item">
                    <span className="temp-label">Medium-Rare:</span>
                    <span className="temp-value">130-135°F</span>
                  </div>
                  <div className="temp-item">
                    <span className="temp-label">Medium:</span>
                    <span className="temp-value">135-145°F</span>
                  </div>
                  <div className="temp-item recommended">
                    <Check size={14} />
                    <span>Recommended: {product.cookingTemp}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Weight Selector */}
          {product.price !== 'Contact' && (
            <div className="weight-selector">
              <label className="weight-label">Select Size:</label>
              <Select value={selectedWeight} onValueChange={setSelectedWeight}>
                <SelectTrigger className="weight-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {weights.map((weight) => (
                    <SelectItem key={weight} value={weight}>
                      {weight}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Subscribe & Save */}
          {product.price !== 'Contact' && (
            <div className="subscribe-save">
              <div className="subscribe-checkbox">
                <Checkbox 
                  id={`subscribe-${index}`}
                  checked={subscribeAndSave}
                  onCheckedChange={setSubscribeAndSave}
                />
                <label htmlFor={`subscribe-${index}`} className="subscribe-label">
                  Subscribe & Save 10%
                </label>
              </div>
              {subscribeAndSave && (
                <div className="savings-message">
                  You save: {currentPrice !== 'Contact' && `$${(parseFloat(currentPrice.replace('$', '')) * 0.1).toFixed(2)}`}
                </div>
              )}
            </div>
          )}

          <div className="product-footer">
            <div className="price-section">
              {product.originalPrice && !subscribeAndSave && (
                <span className="price-original">{calculatePrice(product.originalPrice, selectedWeight)}</span>
              )}
              <div className="price-main">
                <span className={`product-price ${product.originalPrice ? 'price-sale' : ''} ${subscribeAndSave ? 'subscribe-price' : ''}`}>
                  {finalPrice}
                </span>
              </div>
              {subscribeAndSave && currentPrice !== 'Contact' && (
                <div className="subscription-info">
                  <span className="original-price-small">{currentPrice}</span>
                  <span className="savings-badge">Save 10%</span>
                </div>
              )}
            </div>
            <Button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
            >
              {product.price === 'Contact' ? 'Contact Us' : 'Shop Now'}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const LandingPage = () => {
  const featuredCuts = [
    {
      name: "Filet Mignon",
      grade: "USDA Prime",
      description: "Center-cut tenderness, minimal fat",
      price: "$45.00",
      image: "https://images.unsplash.com/photo-1666013942642-b7b54ecafd7d",
      cookingTemp: "Medium-Rare (130-135°F)"
    },
    {
      name: "Ribeye",
      grade: "USDA Prime",
      description: "Rich marbling, bold beef flavor",
      price: "$38.00",
      image: "https://images.unsplash.com/photo-1602470521006-59ab77068b0d",
      cookingTemp: "Medium-Rare (130-135°F)"
    },
    {
      name: "Porterhouse",
      grade: "USDA Prime",
      description: "Strip and tenderloin in one cut",
      price: "$52.00",
      image: "https://images.unsplash.com/photo-1614277786110-1a64e457c4c3",
      cookingTemp: "Medium-Rare (130-135°F)"
    },
    {
      name: "T-Bone",
      grade: "USDA Prime",
      description: "Classic steakhouse favorite",
      price: "$42.00",
      image: "https://images.unsplash.com/photo-1606374894242-19110fdbd56c",
      cookingTemp: "Medium-Rare (130-135°F)"
    },
    {
      name: "Tomahawk Steak",
      grade: "USDA Prime",
      description: "Impressive bone-in ribeye",
      price: "$95.00",
      image: "https://images.unsplash.com/photo-1632154023554-c2975e9be348",
      cookingTemp: "Medium-Rare (130-135°F)"
    },
    {
      name: "Beef Short Ribs",
      grade: "USDA Prime",
      description: "Perfect for braising or smoking",
      price: "$28.00",
      image: "https://images.unsplash.com/photo-1558030077-82dd9347c407",
      cookingTemp: "Low & Slow (275°F, 3-4hrs)"
    },
    {
      name: "Picanha",
      grade: "Whole, Fat Cap On",
      description: "Brazilian favorite, full cap",
      price: "$48.00",
      originalPrice: "$55.00",
      image: "https://images.unsplash.com/photo-1579636859172-67ced5686109",
      badge: "Sale",
      cookingTemp: "Medium-Rare (130-135°F)"
    },
    {
      name: "Cupim",
      grade: "Heritage Cut",
      description: "Brazilian hump cut, rare delicacy",
      price: "$58.00",
      image: "https://images.unsplash.com/photo-1547050605-2f268cd5daf0",
      cookingTemp: "Low & Slow (250°F, 4-5hrs)"
    },
    {
      name: "Wagyu Ribeye",
      grade: "American Wagyu",
      description: "Exceptional marbling and flavor",
      price: "$72.00",
      originalPrice: "$85.00",
      image: "https://images.unsplash.com/photo-1690983321750-ad6f6d59a84b",
      badge: "Sale",
      cookingTemp: "Medium-Rare (130-135°F)"
    },
    {
      name: "Wagyu NY Strip",
      grade: "American Wagyu",
      description: "Perfect balance of tenderness",
      price: "$65.00",
      originalPrice: "$75.00",
      image: "https://images.unsplash.com/photo-1600180786732-6189f0ad253d",
      badge: "Sale",
      cookingTemp: "Medium-Rare (130-135°F)"
    },
    {
      name: "Dry-Aged Steak",
      grade: "Upon Consultation",
      description: "Custom aging, premium selection",
      price: "Contact",
      image: "https://images.unsplash.com/photo-1690983323238-0b91789e1b5a",
      cookingTemp: null
    },
    {
      name: "Flank Steak",
      grade: "USDA Choice",
      description: "Lean, flavorful, great for fajitas",
      price: "$22.00",
      image: "https://images.unsplash.com/photo-1579636858731-24857b3f4305",
      cookingTemp: "Medium (135-145°F)"
    },
    {
      name: "Picanha American Wagyu",
      grade: "American Wagyu",
      description: "Brazilian cut meets Japanese quality",
      price: "$68.00",
      image: "https://images.unsplash.com/photo-1579636859172-67ced5686109",
      cookingTemp: "Medium-Rare (130-135°F)"
    },
    {
      name: "Flank Steak American Wagyu",
      grade: "American Wagyu",
      description: "Enhanced marbling, incredible flavor",
      price: "$35.00",
      image: "https://images.unsplash.com/photo-1614277786110-1a64e457c4c3",
      cookingTemp: "Medium (135-145°F)"
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
      features: ["Better pricing", "Early access to new products"],
      highlight: false
    },
    {
      name: "Prime",
      price: "$12.99",
      period: "/month",
      features: ["Lower pricing", "Priority availability", "Member exclusives"],
      highlight: false
    },
    {
      name: "Premium",
      price: "$19.99",
      period: "/month",
      features: ["Free delivery", "Best pricing", "Priority fulfillment", "Exclusive offers"],
      highlight: true,
      bestValue: true
    }
  ];

  const testimonials = [
    {
      text: "Best quality I've found online. Consistent and reliable every single time.",
      author: "Michael R."
    },
    {
      text: "Simple ordering, premium cuts. Exactly what I needed for my family dinners.",
      author: "Sarah K."
    },
    {
      text: "The dry-aged ribeye is exceptional. Worth every penny and then some.",
      author: "James L."
    }
  ];

  return (
    <div className="butcher-page">
      {/* PROMO BANNER */}
      <div className="promo-banner">
        15% off orders $299+ | 10% off orders $199+ | 5% off orders $99+ with code <span className="code">PREMIUM</span>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <motion.div
            className="hero-logo"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <img 
              src="https://customer-assets.emergentagent.com/job_wagyu-vault/artifacts/ebh2rfed_IMG_2421.PNG" 
              alt="Mastermeatbox Logo"
              className="logo-image"
            />
          </motion.div>
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
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

      {/* FEATURED CUTS */}
      <section className="featured-cuts">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Top Cuts</h2>
            <p className="section-subtitle">A curated selection of premium beef — from classic steaks to rare Brazilian cuts.</p>
          </div>

          <div className="products-grid">
            {featuredCuts.map((product, index) => (
              <ProductCard key={index} product={product} index={index} />
            ))}
          </div>

          <div className="section-cta">
            <Button className="text-btn" onClick={() => window.location.href = 'https://mastermeatbox.com'}>
              View all cuts <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      </section>

      {/* WHY MASTERMEATBOX */}
      <section className="why-section">
        <div className="container">
          <h2 className="section-title">Quality you can trust</h2>
          <p className="why-body">
            We focus on sourcing and delivering premium cuts without overcomplicating the process. 
            No unnecessary options — just high-quality meat done right.
          </p>
          <div className="highlights-grid">
            <div className="highlight-item">
              <Check className="highlight-icon" size={24} />
              <span>Prime & Wagyu quality</span>
            </div>
            <div className="highlight-item">
              <Check className="highlight-icon" size={24} />
              <span>Carefully selected cuts</span>
            </div>
            <div className="highlight-item">
              <Check className="highlight-icon" size={24} />
              <span>Consistent sourcing</span>
            </div>
            <div className="highlight-item">
              <Check className="highlight-icon" size={24} />
              <span>Reliable delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* MEMBERSHIP */}
      <section className="membership-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Membership that works for you</h2>
          </div>
          
          <div className="membership-grid">
            {membershipPlans.map((plan, index) => (
              <Card key={index} className={`membership-card ${plan.highlight ? 'highlight' : ''}`}>
                {plan.bestValue && <div className="best-value-badge">Best Value</div>}
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

      {/* DELIVERY */}
      <section className="delivery-section">
        <div className="container">
          <h2 className="section-title">Delivered fresh</h2>
          
          <div className="delivery-steps">
            <div className="delivery-step">
              <Package className="step-icon" />
              <span className="step-label">Order</span>
            </div>
            <ChevronRight className="step-arrow" size={24} />
            <div className="delivery-step">
              <Thermometer className="step-icon" />
              <span className="step-label">Packed</span>
            </div>
            <ChevronRight className="step-arrow" size={24} />
            <div className="delivery-step">
              <Thermometer className="step-icon" />
              <span className="step-label">Cold-chain</span>
            </div>
            <ChevronRight className="step-arrow" size={24} />
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

      {/* TESTIMONIALS */}
      <section className="testimonials-section">
        <div className="container">
          <h2 className="section-title">Customers trust the quality</h2>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="testimonial-card">
                <div className="stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill="#8B0000" stroke="#8B0000" />
                  ))}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <p className="testimonial-author">— {testimonial.author}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* SHIPPING */}
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

      {/* FINAL CTA */}
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
            <img 
              src="https://customer-assets.emergentagent.com/job_wagyu-vault/artifacts/ebh2rfed_IMG_2421.PNG" 
              alt="Mastermeatbox Logo"
              className="footer-logo"
            />
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
