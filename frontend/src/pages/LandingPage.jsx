import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import Cart from '../components/Cart';
import PremiumBBQBuilder from '../components/PremiumBBQBuilder';
import PackagesSection from '../components/PackagesSection';
import BoxesSection from '../components/BoxesSection';
import DryAgingSelector from '../components/DryAgingSelector';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [activeFilter, setActiveFilter] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [dryAgingModalOpen, setDryAgingModalOpen] = useState(false);
  const [selectedProductForAging, setSelectedProductForAging] = useState(null);
  const { getItemCount, setIsOpen, addToCart } = useCart();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Badge color mapping
  const getBadgeStyle = (badgeColor) => {
    const colors = {
      gold: { background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: '#000' },
      platinum: { background: 'linear-gradient(135deg, #E5E4E2, #C0C0C0)', color: '#000' },
      red: { background: 'linear-gradient(135deg, #DC143C, #8B0000)', color: '#fff' },
      green: { background: 'linear-gradient(135deg, #32CD32, #228B22)', color: '#fff' },
      blue: { background: 'linear-gradient(135deg, #4169E1, #000080)', color: '#fff' },
      purple: { background: 'linear-gradient(135deg, #9370DB, #4B0082)', color: '#fff' },
      bronze: { background: 'linear-gradient(135deg, #CD7F32, #8B4513)', color: '#fff' }
    };
    return colors[badgeColor] || colors.gold;
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('scroll', handleScroll);
    
    // Auto-refresh products every 10 seconds to sync with CMS
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 10000);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(refreshInterval);
    };
  }, []);

  const handleScroll = () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progressBar = document.getElementById('scrollProgress');
    if (progressBar) {
      progressBar.style.width = (scrolled / total * 100) + '%';
    }
    setShowBackToTop(scrolled > 400);
  };

  const fetchData = async () => {
    try {
      const [productsRes, membershipsRes, settingsRes] = await Promise.all([
        axios.get(`${backendUrl}/api/products`),
        axios.get(`${backendUrl}/api/memberships`),
        axios.get(`${backendUrl}/api/site-settings`)
      ]);
      setProducts(productsRes.data);
      setMemberships(membershipsRes.data);
      setSiteSettings(settingsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const renderIcon = (iconData) => {
    if (!iconData) return null;
    // If iconData is a string, check if it's a URL or emoji
    if (typeof iconData === 'string') {
      if (iconData.startsWith('http://') || iconData.startsWith('https://') || iconData.startsWith('/')) {
        return <img src={iconData} alt="icon" className="icon-image" style={{width: '1.2rem', height: '1.2rem', display: 'inline-block'}} />;
      }
      return <span>{iconData}</span>;
    }
    // If iconData is an object with icon and possibly iconUrl
    if (iconData.iconUrl && iconData.iconUrl.trim()) {
      return <img src={iconData.iconUrl} alt={iconData.text || 'icon'} className="icon-image" style={{width: '1.2rem', height: '1.2rem', display: 'inline-block'}} />;
    }
    return <span>{iconData.icon || ''}</span>;
  };

  const handleAddToCart = (product) => {
    addToCart(product, '12oz', false);
    toast.success(`${product.name} added to cart!`);
  };

  const handleOpenCart = () => {
    setIsOpen(true);
  };

  const openQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewQty(1);
    document.body.style.overflow = 'hidden';
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
    document.body.style.overflow = '';
  };

  const handleQuickViewAddToCart = () => {
    if (!quickViewProduct) return;
    for (let i = 0; i < quickViewQty; i++) {
      addToCart(quickViewProduct, '12oz', false);
    }
    toast.success(`${quickViewProduct.name} added to cart!`);
    closeQuickView();
    setIsOpen(true);
  };

  const filterProducts = (filter) => {
    setActiveFilter(filter);
  };

  const getFilteredProducts = () => {
    if (activeFilter === 'all') return products;
    if (activeFilter === 'certified_angus') return products.filter(p => p.category === 'certified_angus');
    if (activeFilter === 'usda_prime') return products.filter(p => p.category === 'usda_prime');
    if (activeFilter === 'grass_fed') return products.filter(p => p.category === 'grass_fed');
    if (activeFilter === 'american_wagyu') return products.filter(p => p.category === 'american_wagyu');
    if (activeFilter === 'a5_wagyu') return products.filter(p => p.category === 'a5_wagyu');
    if (activeFilter === 'sale') return products.filter(p => p.category === 'sale');
    return products;
  };

  const handleDryAgingSelect = (product) => {
    setSelectedProductForAging(product);
    setDryAgingModalOpen(true);
  };

  const handleDryAgingConfirm = (tier) => {
    if (!selectedProductForAging) return;
    
    const basePrice = parseFloat(selectedProductForAging.price.replace('$', ''));
    const finalPrice = tier.upcharge ? basePrice + tier.upcharge : basePrice;
    
    const productWithAging = {
      ...selectedProductForAging,
      price: finalPrice,
      dryAgingTier: tier.name,
      dryAgingDays: tier.days,
      product_name: `${selectedProductForAging.name}${tier.days > 0 ? ` (${tier.name})` : ''}`
    };
    
    addToCart(productWithAging, 1);
    toast.success(`Added ${productWithAging.product_name} to cart!`);
    setDryAgingModalOpen(false);
    setSelectedProductForAging(null);
  };

  };

  const filteredProducts = getFilteredProducts();

  const testimonials = [
    { text: "Best quality I've found online. Consistent and reliable every single time.", author: "Michael R.", stars: 5 },
    { text: "Simple ordering, premium cuts. Exactly what I needed for my family dinners.", author: "Sarah K.", stars: 5 },
    { text: "The dry-aged ribeye is exceptional. Worth every penny and then some.", author: "James L.", stars: 5 }
  ];

  return (
    <>
      {/* Scroll Progress */}
      <div className="scroll-progress" id="scrollProgress"></div>

      {/* Promo Banner */}
      <div className="promo-banner">
        <span className="promo-banner-track">
          15% off orders $299+ | 10% off orders $199+ | 5% off orders $99+ with code <span className="promo-code">PREMIUM</span>
        </span>
      </div>

      {/* Header */}
      <header className="main-header">
        <div className="container">
          <div className="header-wrapper">
            <a href="/" className="header-logo-link">
              <div className="brand-logo header-brand">
                <div className="brand-logo-top">
                  <span className="brand-mmb">MMH</span>
                  <span className="brand-bar"></span>
                  <span className="brand-kanji">傑</span>
                </div>
                <div className="brand-sub">MASTERS MEAT HAUS®</div>
              </div>
            </a>
            <nav className="main-nav">
              <a href="#products">Shop</a>
              <a href="#membership">Membership</a>
              <a href="#delivery">Delivery</a>
              <a href="#testimonials">Reviews</a>
              <button className="cart-btn" onClick={handleOpenCart}>
                <ShoppingCart size={18} />
                Cart <span className="cart-count">{getItemCount()}</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Trust Bar */}
      <div className="trust-bar">
        <div className="container">
          <div className="trust-items">
            {siteSettings?.trust_items?.map((item, index) => (
              <div key={index} className="trust-item">
                <span className="trust-icon">{renderIcon(item)}</span> {item.text}
              </div>
            )) || (
              <>
                <div className="trust-item"><span className="trust-icon">🔒</span> Secure Stripe Checkout</div>
                <div className="trust-item"><span className="trust-icon">🧊</span> Temperature-Controlled Shipping</div>
                <div className="trust-item"><span className="trust-icon">⭐</span> USDA Prime &amp; Wagyu Quality</div>
                <div className="trust-item"><span className="trust-icon">🚚</span> Free Shipping Over $150</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <div className="brand-logo hero-brand">
            <div className="brand-logo-top">
              <span className="brand-mmb">MMH</span>
              <span className="brand-bar"></span>
              <span className="brand-kanji">傑</span>
            </div>
            <div className="brand-sub">MASTERS MEAT HAUS®</div>
          </div>
          <h1 className="hero-title">Premium cuts. <span>No shortcuts.</span></h1>
          <p className="hero-subtitle">
            Hand-selected USDA Prime and Wagyu steaks delivered to your door — vacuum-sealed, temperature-controlled, and always exceptional.
          </p>
          <div className="hero-ctas">
            <a href="#products" className="primary-btn">Shop Now</a>
            <a href="#membership" className="secondary-btn">View Plans</a>
          </div>
          <p className="hero-note">Free shipping over $150 · Secure checkout via Stripe</p>
        </div>
      </section>

      {/* Products Section */}
      <section className="featured-cuts" id="products">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Premium Selection</span>
            <h2 className="section-title">Our Top <span>Cuts</span></h2>
            <p className="section-subtitle">A curated selection of premium beef — from classic steakhouse favorites to rare specialties.</p>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            <span className="filter-label">Filter:</span>
            <button 
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Cuts
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'certified_angus' ? 'active' : ''}`}
              onClick={() => setActiveFilter('certified_angus')}
            >
              Certified Angus
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'usda_prime' ? 'active' : ''}`}
              onClick={() => setActiveFilter('usda_prime')}
            >
              USDA Prime
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'grass_fed' ? 'active' : ''}`}
              onClick={() => setActiveFilter('grass_fed')}
            >
              Grass Fed
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'american_wagyu' ? 'active' : ''}`}
              onClick={() => setActiveFilter('american_wagyu')}
            >
              American Wagyu
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'a5_wagyu' ? 'active' : ''}`}
              onClick={() => setActiveFilter('a5_wagyu')}
            >
              A5 Wagyu
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'sale' ? 'active' : ''}`}
              onClick={() => setActiveFilter('sale')}
            >
              Sale
            </button>
            <span className="product-count">{filteredProducts.length} items</span>
          </div>

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div key={product._id} className="product-card">
                  <div className="product-image">
                    {product.badge && (
                      <div 
                        className="product-badge" 
                        style={getBadgeStyle(product.badgeColor)}
                      >
                        {product.badge}
                      </div>
                    )}
                    <img src={product.image} alt={product.name} loading="lazy" />
                  </div>
                  <div className="product-info">
                    <div className="product-grade">{product.grade}</div>
                    <h3 className="product-name" onClick={() => openQuickView(product)}>{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-price-row">
                      {product.originalPrice && (
                        <span className="product-original-price">{product.originalPrice}</span>
                      )}
                      <span className="product-price">{product.price}</span>
                    </div>
                  </div>
                  <div className="product-btns">
                    <button className="order-btn" onClick={() => handleAddToCart(product)}>
                      Order
                    </button>
                    <button className="dry-aging-btn" onClick={() => handleDryAgingSelect(product)}>
                      + Dry-Aged
                    </button>
                    <button className="info-btn" onClick={() => openQuickView(product)}>
                      Info
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="section-cta">
            <button className="text-btn" onClick={() => navigate('/shop-boxes')}>
              View all cuts →
            </button>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="why-section">
        <div className="container">
          <span className="eyebrow" style={{color: 'var(--gold)'}}>Why Choose Us</span>
          <h2 className="section-title">Quality you can <span style={{color: 'var(--gold)', fontStyle: 'italic'}}>trust</span></h2>
          <p className="why-body">
            We focus on sourcing and delivering premium cuts without overcomplicating the process. No unnecessary options — just high-quality meat done right.
          </p>
          <div className="highlights-grid">
            <div className="highlight-item"><span className="check-icon">✓</span><span>USDA Prime &amp; Wagyu quality</span></div>
            <div className="highlight-item"><span className="check-icon">✓</span><span>Carefully hand-selected cuts</span></div>
            <div className="highlight-item"><span className="check-icon">✓</span><span>Consistent, reliable sourcing</span></div>
            <div className="highlight-item"><span className="check-icon">✓</span><span>Temperature-controlled delivery</span></div>
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section className="membership-section" id="membership">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Membership Plans</span>
            <h2 className="section-title">Membership that <span>works for you</span></h2>
            <p className="section-subtitle">Save more, order more. Choose the plan that fits your lifestyle.</p>
          </div>

          <div style={{display: 'flex', justifyContent: 'center', marginBottom: '2.5rem'}}>
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
                Yearly <span className="save-badge">Save 30%</span>
              </button>
            </div>
          </div>

          <div className="membership-grid">
            {memberships.map((plan, index) => {
              const monthlyPrice = plan.monthly_price || 0;
              const yearlyPrice = plan.yearly_price || 0;
              const displayPrice = billingPeriod === 'monthly' 
                ? `$${monthlyPrice.toFixed(2)}` 
                : `$${yearlyPrice.toFixed(0)}`;
              const displayPeriod = billingPeriod === 'monthly' ? '/mo' : '/yr';
              const savings = billingPeriod === 'yearly' && monthlyPrice > 0
                ? `Save $${((monthlyPrice * 12 - yearlyPrice) / 12).toFixed(2)}/mo`
                : null;

              return (
                <div 
                  key={plan._id || index} 
                  className={`membership-card ${plan.highlight ? 'highlight' : ''}`}
                >
                  {plan.best_value && <div className="best-value-badge">Best Value</div>}
                  <div className="membership-header">
                    <div className="membership-name">{plan.tier_name}</div>
                    <div className="membership-price">
                      <span className="m-price">{displayPrice}</span>
                      <span className="m-period">{displayPeriod}</span>
                    </div>
                    {savings && <div className="yearly-savings">{savings}</div>}
                  </div>
                  <div className="membership-features">
                    {plan.features?.map((feature, i) => (
                      <div key={i} className="feature-item">
                        <span className="check">✓</span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    className={`membership-btn ${plan.highlight ? 'highlight' : ''}`}
                    onClick={() => navigate(`/membership/${plan.tier_name.toLowerCase().replace(/\s+/g, '-')}`)}
                  >
                    {plan.monthly_price === 0 ? 'Get Started' : 'Choose Plan'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Delivery Section - MODERN DESIGN */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black" id="delivery">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-white mb-4">
              Delivered <span style={{color: '#C8A96A', fontStyle: 'italic'}}>Fresh</span>
            </h2>
            <p className="text-xl text-gray-400">
              Temperature-controlled from our facility to your door
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {/* Step 1 */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300">
              <div className="text-6xl mb-4">📦</div>
              <div className="text-xl font-bold text-white mb-2">Order</div>
              <div className="text-sm text-gray-400">Carefully reviewed & packed</div>
            </div>

            {/* Step 2 */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300">
              <div className="text-6xl mb-4">🧊</div>
              <div className="text-xl font-bold text-white mb-2">Packed</div>
              <div className="text-sm text-gray-400">Premium insulated packaging</div>
            </div>

            {/* Step 3 */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300">
              <div className="text-6xl mb-4">🌡️</div>
              <div className="text-xl font-bold text-white mb-2">Cold Chain</div>
              <div className="text-sm text-gray-400">Temperature monitored</div>
            </div>

            {/* Step 4 */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-300">
              <div className="text-6xl mb-4">🚚</div>
              <div className="text-xl font-bold text-white mb-2">Delivered</div>
              <div className="text-sm text-gray-400">Arrives fresh & safe</div>
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={() => navigate('/delivery')} 
              className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              How Delivery Works →
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section" id="testimonials">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Reviews</span>
            <h2 className="section-title">Customers <span>trust the quality</span></h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="stars">{'★'.repeat(testimonial.stars)}</div>
                <p className="testimonial-text">{testimonial.text}</p>
                <p className="testimonial-author">— {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium BBQ Builder */}
      <section style={{
        background: '#0e0e0e',
        padding: '5rem 0',
        borderTop: '1px solid #222'
      }}>
        <div className="container">
          <PremiumBBQBuilder />
          <div style={{ 
            textAlign: 'center', 
            marginTop: '3rem',
            padding: '2rem',
            background: 'rgba(200, 169, 106, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(200, 169, 106, 0.2)'
          }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#C8A96A',
              marginBottom: '1rem'
            }}>
              The Art of Dry Aging
            </h3>
            <p style={{ 
              fontSize: '1rem', 
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.7'
            }}>
              ✔ Dry-Aged Beef Up to 45 Days<br />
              ✔ Premium Chicken & Artisan Sausage<br />
              ✔ Delivered Ready for Grill<br />
              ✔ Trusted by BBQ Hosts & Private Chefs
            </p>
          </div>
        </div>


      {/* Half/Quarter Cow Packages */}


      {/* Steak Boxes */}
      <BoxesSection />

      <PackagesSection />

      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <div className="container">
          <h2 className="final-title">Better cuts start here</h2>
          <button className="final-btn" onClick={() => document.getElementById('products').scrollIntoView({behavior: 'smooth'})}>
            Shop MasterMeatBox
          </button>
          <p className="final-subtext">Premium cuts. Simple process. Secure checkout.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-col">
              <div className="brand-logo footer-brand-logo">
                <div className="brand-logo-top">
                  <span className="brand-mmb">MMH</span>
                  <span className="brand-bar"></span>
                  <span className="brand-kanji">傑</span>
                </div>
                <div className="brand-sub">MASTERS MEAT HAUS®</div>
              </div>
              <p className="footer-tagline">Premium cuts. No shortcuts.</p>
            </div>
            <div className="footer-col">
              <h4>Shop</h4>
              <a href="/shop-boxes">Shop Boxes</a>
              <a href="/build-your-box">Build Your Box</a>
              <a href="/membership/select">Membership Plans</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="/about">About Us</a>
              <a href="/faq">FAQ</a>
              <a href="/contact">Contact</a>
              <a href="/admin">Admin</a>
            </div>
            <div className="footer-col">
              <h4>Legal</h4>
              <a href="/shipping-policy">Shipping Policy</a>
              <a href="/refund-policy">Refund Policy</a>
              <a href="/privacy-policy">Privacy Policy</a>
              <a href="/terms-of-service">Terms of Service</a>
              <a href="/membership-terms">Membership Terms</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Masters Meat Haus®. All rights reserved.</p>
            <div className="footer-contact">
              <a href="mailto:hello@mastersmeathaus.com">hello@mastersmeathaus.com</a>
              <span>|</span>
              <a href="tel:8178072489">817-807-2489</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="qv-overlay" onClick={(e) => e.target.className === 'qv-overlay' && closeQuickView()}>
          <div className="qv-modal">
            <button className="qv-close" onClick={closeQuickView}>
              <X size={18} />
            </button>
            <img className="qv-image" src={quickViewProduct.image} alt={quickViewProduct.name} />
            <div className="qv-info">
              <div className="qv-grade">{quickViewProduct.grade}</div>
              <h2 className="qv-name">{quickViewProduct.name}</h2>
              <p className="qv-desc">{quickViewProduct.description}</p>
              <div className="qv-price-row">
                <span className="qv-price">{quickViewProduct.price}</span>
                {quickViewProduct.originalPrice && (
                  <span className="qv-orig-price">{quickViewProduct.originalPrice}</span>
                )}
              </div>
              <div className="qv-qty-row">
                <span className="qv-qty-label">Qty</span>
                <div className="qv-qty-ctrl">
                  <button className="qv-qty-btn" onClick={() => setQuickViewQty(Math.max(1, quickViewQty - 1))}>−</button>
                  <span className="qv-qty-val">{quickViewQty}</span>
                  <button className="qv-qty-btn" onClick={() => setQuickViewQty(quickViewQty + 1)}>+</button>
                </div>
              </div>
              <button className="qv-add-btn" onClick={handleQuickViewAddToCart}>
                Add to Cart
              </button>
              <p className="qv-ship">Ships direct · Packed fresh</p>
            </div>
          </div>
        </div>
      )}

      {/* Back to Top */}
      {showBackToTop && (
        <button 
          className="back-to-top visible" 
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          aria-label="Back to top"
        >
          ↑
        </button>
      )}

      <Cart />

      {/* Dry Aging Selector Modal */}
      {selectedProductForAging && (
        <DryAgingSelector
          product={selectedProductForAging}
          isOpen={dryAgingModalOpen}
          onClose={() => {
            setDryAgingModalOpen(false);
            setSelectedProductForAging(null);
          }}
          onSelect={handleDryAgingConfirm}
        />
      )}
    </>
  );
};

export default LandingPage;
