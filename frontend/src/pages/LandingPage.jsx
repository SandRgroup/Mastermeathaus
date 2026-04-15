import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import Cart from '../components/Cart';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getItemCount, setIsOpen, addToCart } = useCart();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/products`);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, '12oz', false);
    toast.success(`${product.name} added to cart!`, {
      description: 'View cart to checkout',
      duration: 3000,
    });
  };

  const handleOpenCart = () => {
    setIsOpen(true);
  };

  return (
    <>
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
                  <span className="brand-mmb">MMB</span>
                  <span className="brand-bar"></span>
                  <span className="brand-kanji">傑</span>
                </div>
                <div className="brand-sub">MASTERMEATBOX®</div>
              </div>
            </a>
            <nav className="main-nav">
              <a href="/shop-boxes">Shop Boxes</a>
              <a href="/build-your-box">Build Your Box</a>
              <a href="/membership/select">Membership</a>
              <a href="/about">About</a>
              <a href="/faq">FAQ</a>
              <button className="cart-btn" onClick={handleOpenCart}>
                <ShoppingCart size={18} />
                Cart <span className="cart-count">{getItemCount()}</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="brand-logo hero-brand">
            <div className="brand-logo-top">
              <span className="brand-mmb">MMB</span>
              <span className="brand-bar"></span>
              <span className="brand-kanji">傑</span>
            </div>
            <div className="brand-sub">MASTERMEATBOX®</div>
          </div>
          <h1 className="hero-title">Premium cuts. <span>No shortcuts.</span></h1>
          <p className="hero-subtitle">
            A modern online butcher shop delivering top-quality prime and Wagyu cuts — fresh, simple, and reliable.
          </p>
          <a href="#products" className="primary-btn">Shop Cuts</a>
          <button 
            className="secondary-btn" 
            onClick={() => navigate('/membership/select')}
            style={{ marginLeft: '1rem' }}
          >
            View Membership
          </button>
        </div>
      </section>

      {/* Products Section */}
      <section className="featured-cuts" id="products">
        <div className="container">
          <h2 className="section-title">
            Our Top <span>Cuts</span>
          </h2>
          
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="products-grid">
              {products.slice(0, 12).map((product, index) => (
                <div key={product._id || index} className="product-card">
                  <div className="product-image">
                    {product.badge && <div className="product-badge">{product.badge}</div>}
                    <img src={product.image} alt={product.name} loading="lazy" />
                  </div>
                  <div className="product-info">
                    <div className="product-grade">{product.grade}</div>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-price-row">
                      {product.originalPrice && (
                        <span className="product-original-price">{product.originalPrice}</span>
                      )}
                      <span className="product-price">{product.price}</span>
                    </div>
                  </div>
                  <div className="product-btns">
                    <button 
                      className="order-btn" 
                      onClick={() => handleAddToCart(product)}
                    >
                      Add to Cart
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

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-col">
              <div className="brand-logo footer-brand-logo">
                <div className="brand-logo-top">
                  <span className="brand-mmb">MMB</span>
                  <span className="brand-bar"></span>
                  <span className="brand-kanji">傑</span>
                </div>
                <div className="brand-sub">MASTERMEATBOX®</div>
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
            <p>&copy; 2026 MasterMeatBox®. All rights reserved.</p>
            <div className="footer-contact">
              <a href="mailto:hello@mastermeatbox.com">hello@mastermeatbox.com</a>
              <span>|</span>
              <a href="tel:8178072489">817-807-2489</a>
            </div>
          </div>
        </div>
      </footer>

      <Cart />
    </>
  );
};

export default LandingPage;
