import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import Cart from '../components/Cart';
import AIBBQPlanner from '../components/AIBBQPlanner';
import PackagesSection from '../components/PackagesSection';
import BoxesSection from '../components/BoxesSection';
import DryAgingSelector from '../components/DryAgingSelector';
import useSiteImage from '../hooks/useSiteImage';

// New Cinematic Sections
import HeroSection from '../components/sections/HeroSection';
import BrandStorySection from '../components/sections/BrandStorySection';
import FeaturesSection from '../components/sections/FeaturesSection';
import SocialProofSection from '../components/sections/SocialProofSection';
import CountdownSection from '../components/sections/CountdownSection';
import FinalCTASection from '../components/sections/FinalCTASection';
import FooterSection from '../components/sections/FooterSection';

import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { imageUrl: headerLogo } = useSiteImage('site_logo', '/assets/mmh-logo.png');
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
  const [showAllProducts, setShowAllProducts] = useState(false);
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

  const filteredProducts = getFilteredProducts();
  const displayedProducts = showAllProducts ? filteredProducts : filteredProducts.slice(0, 12);

  return (
    <>
      {/* Scroll Progress */}
      <div className="scroll-progress" id="scrollProgress"></div>

      {/* Header */}
      <header className="main-header fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6">
          <div className="header-wrapper flex items-center justify-between py-4">
            <a href="/" className="header-logo-link">
              <img 
                src={headerLogo}
                alt="Masters Meat Haus" 
                className="h-10 opacity-90 hover:opacity-100 transition-opacity"
              />
            </a>
            <nav className="main-nav flex items-center gap-8">
              <a href="#products" className="text-gray-300 hover:text-[#C8A96A] transition-colors text-sm uppercase tracking-wider">Shop</a>
              <a href="#membership" className="text-gray-300 hover:text-[#C8A96A] transition-colors text-sm uppercase tracking-wider">Membership</a>
              <a href="#features" className="text-gray-300 hover:text-[#C8A96A] transition-colors text-sm uppercase tracking-wider">Features</a>
              <a href="#reviews" className="text-gray-300 hover:text-[#C8A96A] transition-colors text-sm uppercase tracking-wider">Reviews</a>
              <button 
                className="flex items-center gap-2 px-6 py-2 bg-red-900 text-white rounded-sm hover:bg-red-800 transition-colors" 
                onClick={handleOpenCart}
              >
                <ShoppingCart size={18} />
                <span>Cart</span>
                {getItemCount() > 0 && (
                  <span className="px-2 py-0.5 bg-[#C8A96A] text-black text-xs font-bold rounded-full">
                    {getItemCount()}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />

      {/* Brand Story Section */}
      <BrandStorySection />

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
            <>
              <div className="products-grid">
                {displayedProducts.map((product) => (
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
                    <img 
                      src={product.image || 'https://via.placeholder.com/400x300/1a1a1a/C8A96A?text=Masters+Meat+Haus'} 
                      alt={product.name} 
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300/1a1a1a/C8A96A?text=Masters+Meat+Haus';
                      }}
                    />
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
            
            {!showAllProducts && filteredProducts.length > 12 && (
              <div className="section-cta">
                <button className="text-btn" onClick={() => setShowAllProducts(true)}>
                  View all cuts ({filteredProducts.length - 12} more) →
                </button>
              </div>
            )}
            </>
          )}

        </div>
      </section>

      {/* Features Section (replaces Why Section) */}
      <div id="features">
        <FeaturesSection />
      </div>

      {/* Social Proof / Testimonials */}
      <div id="reviews">
        <SocialProofSection />
      </div>

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

      {/* Countdown Section */}
      <CountdownSection />

      {/* Premium BBQ Builder / Boxes / Packages */}
      <section style={{
        background: '#0e0e0e',
        padding: '5rem 0',
        borderTop: '1px solid #222'
      }}>
        <div className="container">
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

        {/* Boxes & Packages */}
        <BoxesSection />
        <PackagesSection />
      </section>

      {/* AI BBQ Calculator */}
      <AIBBQPlanner />

      {/* Final CTA */}
      <FinalCTASection />

      {/* Footer */}
      <FooterSection />

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
