import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Check, Package, Thermometer, Truck, Star, Info, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import Cart from '../components/Cart';
import '../styles/LandingPage.css';

const ProductCard = ({ product, index }) => {
  const { addToCart } = useCart();
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
    addToCart(product, selectedWeight, subscribeAndSave);
    const cartMessage = subscribeAndSave 
      ? `${product.name} (${selectedWeight}) added with Subscribe & Save!`
      : `${product.name} (${selectedWeight}) added to cart`;
    toast.success(cartMessage, {
      description: subscribeAndSave ? 'You\'ll save 10% on every delivery' : 'View cart to checkout',
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
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const { getItemCount, setIsOpen } = useCart();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, membershipsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/products`),
        axios.get(`${backendUrl}/api/memberships`)
      ]);
      setProducts(productsRes.data);
      setMemberships(membershipsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const featuredCuts = products;
  const membershipPlans = memberships;

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
      {/* HEADER NAV */}
      <header className="main-header">
        <div className="container">
          <div className="header-wrapper">
            <img 
              src="https://customer-assets.emergentagent.com/job_wagyu-vault/artifacts/ebh2rfed_IMG_2421.PNG" 
              alt="Mastermeatbox Logo"
              className="header-logo"
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer', height: '50px' }}
            />
            
            <nav className="main-nav">
              <a href="/shop-boxes">Shop Boxes</a>
              <a href="/build-your-box">Build Your Box</a>
              <a href="/membership/premium">Subscriptions</a>
              <a href="/about">About</a>
              <a href="/faq">FAQ</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Cart Icon */}
      <button className="cart-icon-btn" onClick={() => setIsOpen(true)}>
        <ShoppingCart size={24} />
        {getItemCount() > 0 && <span className="cart-badge">{getItemCount()}</span>}
      </button>
      
      <Cart />

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
              src="https://customer-assets.emergentagent.com/job_wagyu-vault/artifacts/aknfflws_IMG_2421.PNG" 
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
          
          {/* Billing Period Toggle */}
          <div className="billing-toggle">
            <button 
              className={`billing-option ${billingPeriod === 'monthly' ? 'active' : ''}`}
              onClick={() => setBillingPeriod('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`billing-option ${billingPeriod === 'yearly' ? 'active' : ''}`}
              onClick={() => setBillingPeriod('yearly')}
            >
              Yearly
              <span className="savings-badge-toggle">Save 30%</span>
            </button>
          </div>
          
          <div className="membership-grid">
            {membershipPlans.map((plan, index) => {
              const monthlyPrice = parseFloat(plan.price.replace('$', '').replace('/mo', ''));
              const yearlyPrice = monthlyPrice * 12 * 0.7; // 30% discount
              const displayPrice = billingPeriod === 'monthly' 
                ? `$${monthlyPrice.toFixed(0)}` 
                : `$${yearlyPrice.toFixed(0)}`;
              const displayPeriod = billingPeriod === 'monthly' ? '/mo' : '/yr';
              const monthlySavings = billingPeriod === 'yearly' 
                ? `Save $${((monthlyPrice * 12 - yearlyPrice) / 12).toFixed(0)}/mo`
                : null;
              
              // Map plan names to route slugs
              const planSlug = plan.name.toLowerCase().replace(' ', '-');
              const planRoutes = {
                'pit-pass': 'free',
                'prime-select': 'select',
                'master-cut': 'prime',
                'black-label': 'premium'
              };

              return (
                <Card key={index} className={`membership-card ${plan.highlight ? 'highlight' : ''}`}>
                  {plan.bestValue && <div className="best-value-badge">Best Value</div>}
                  <div className="membership-header">
                    <h3 className="membership-name">{plan.name}</h3>
                    <div className="membership-price">
                      <span className="price">{displayPrice}</span>
                      <span className="period">{displayPeriod}</span>
                    </div>
                    {monthlySavings && (
                      <div className="yearly-savings-badge">{monthlySavings}</div>
                    )}
                  </div>
                  <div className="membership-features">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="feature-item">
                        <Check size={16} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="membership-actions">
                    <Button 
                      className={plan.highlight ? "membership-btn highlight" : "membership-btn"}
                      onClick={() => navigate(`/membership/${planRoutes[planSlug]}`)}
                    >
                      Choose plan
                    </Button>
                    <Button 
                      variant="ghost"
                      className="learn-more-btn"
                      onClick={() => navigate(`/membership/${planRoutes[planSlug]}`)}
                    >
                      Learn more <ChevronRight size={16} />
                    </Button>
                  </div>
                </Card>
              );
            })}
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

      {/* HOW DELIVERY WORKS */}
      <section className="delivery-works-section">
        <div className="container">
          <h2 className="section-title">How Our Delivery Works</h2>
          <p className="section-subtitle">At MasterMeatBox, we make sure every order is handled with care from the moment it leaves our facility to the moment it arrives at your door.</p>
          
          <div className="delivery-steps-grid">
            <div className="delivery-step-card">
              <div className="step-number">1</div>
              <h3>📦 Order Processing</h3>
              <p>Orders processed within 1–3 business days. Each box assembled with attention to quality and food safety.</p>
            </div>
            
            <div className="delivery-step-card">
              <div className="step-number">2</div>
              <h3>❄️ Temperature Control</h3>
              <p>Packed using insulated materials and cooling elements to maintain safe temperatures during transit.</p>
            </div>
            
            <div className="delivery-step-card">
              <div className="step-number">3</div>
              <h3>🚚 Fast Shipping</h3>
              <p>Shipped via trusted carriers. Most orders arrive within 48 hours. Delivery: 2–5 business days.</p>
            </div>
            
            <div className="delivery-step-card">
              <div className="step-number">4</div>
              <h3>📍 Door Delivery</h3>
              <p>Delivered directly to your address. Retrieve promptly and refrigerate or freeze immediately.</p>
            </div>
          </div>
          
          <div className="delivery-note">
            <p><strong>Important:</strong> Orders may arrive fully frozen, partially thawed but cold, or refrigerated. This is normal and safe.</p>
            <p className="contact-info">Questions? Email <a href="mailto:hello@mastermeatbox.com">hello@mastermeatbox.com</a> or call <a href="tel:8178072489">817-807-2489</a></p>
          </div>
          
          <Button className="text-btn" onClick={() => window.location.href = '/delivery'}>
            Learn more about delivery <ChevronRight size={20} />
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
          <div className="footer-content">
            <div className="footer-brand">
              <img 
                src="https://customer-assets.emergentagent.com/job_wagyu-vault/artifacts/ebh2rfed_IMG_2421.PNG" 
                alt="Mastermeatbox Logo"
                className="footer-logo"
              />
              <p>Premium meat delivered directly to your door.</p>
            </div>
            
            <div className="footer-column">
              <h4>Contact</h4>
              <p><a href="mailto:hello@mastermeatbox.com">hello@mastermeatbox.com</a></p>
              <p><a href="tel:8178072489">817-807-2489</a></p>
              <p className="footer-hours">Mon-Fri, 9 AM – 5 PM CST</p>
            </div>
            
            <div className="footer-column">
              <h4>Policies</h4>
              <a href="/shipping-policy">Shipping Policy</a>
              <a href="/refund-policy">Refund Policy</a>
              <a href="/terms-of-service">Terms of Service</a>
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/membership-terms">Membership Terms</a>
            </div>
            
            <div className="footer-column">
              <h4>Company</h4>
              <a href="/delivery">How Delivery Works</a>
              <a href="/contact">Contact Us</a>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>MasterMeatBox © {new Date().getFullYear()} All rights reserved</p>
            <p className="footer-tagline">High-quality meat delivery service based in the United States</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
