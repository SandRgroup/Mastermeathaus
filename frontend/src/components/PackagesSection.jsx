import React, { useState, useEffect } from 'react';
import { Package, Check } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../contexts/CartContext';

const PackagesSection = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/packages`);
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSavings = (regular, sale) => {
    const savings = regular - sale;
    const percent = ((savings / regular) * 100).toFixed(0);
    return { savings, percent };
  };

  const handleAddToCart = (pkg) => {
    addToCart({
      id: pkg.id,
      name: pkg.name,
      price: `$${pkg.salePrice.toFixed(2)}`,
      image: '/api/placeholder/400/300',
      type: 'package'
    });
  };

  if (loading) {
    return (
      <section style={{ background: '#0a0a0a', padding: '5rem 0' }}>
        <div className="container text-center">
          <p style={{ color: '#94A3B8' }}>Loading packages...</p>
        </div>
      </section>
    );
  }

  if (packages.length === 0) {
    return null;
  }

  return (
    <section style={{
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
      padding: '5rem 0',
      borderTop: '1px solid #222'
    }}>
      <div className="container">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="w-8 h-8" style={{ color: '#C8A96A' }} />
            <span style={{
              color: '#C8A96A',
              fontSize: '0.875rem',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              Premium Bulk Packages
            </span>
          </div>
          <h2 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #C8A96A 0%, #F4E4C1 50%, #C8A96A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem'
          }}>
            Half & Quarter Cow
          </h2>
          <p style={{
            color: '#E2E8F0',
            fontSize: '1.125rem',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Stock your freezer with premium beef. Maximum value, unmatched quality.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {packages.map((pkg) => {
            const { savings, percent } = calculateSavings(pkg.regularPrice, pkg.salePrice);
            
            return (
              <div
                key={pkg.id}
                style={{
                  background: 'linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)',
                  border: '2px solid #2a2a2a',
                  borderRadius: '16px',
                  padding: '2rem',
                  position: 'relative',
                  transition: 'all 0.3s ease'
                }}
                className="package-card"
              >
                {/* Savings Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
                }}>
                  Save ${savings.toFixed(0)} ({percent}% OFF)
                </div>

                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '800',
                  color: '#F1F5F9',
                  marginBottom: '0.5rem',
                  marginTop: '0.5rem'
                }}>
                  {pkg.name}
                </h3>

                <p style={{
                  color: '#94A3B8',
                  fontSize: '0.9375rem',
                  marginBottom: '1.5rem',
                  lineHeight: '1.5'
                }}>
                  {pkg.description}
                </p>

                {/* Pricing */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.5rem' }}>
                    <span style={{
                      fontSize: '2.5rem',
                      fontWeight: '900',
                      background: 'linear-gradient(135deg, #C8A96A 0%, #F4E4C1 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      ${pkg.salePrice.toFixed(0)}
                    </span>
                    <span style={{
                      fontSize: '1.25rem',
                      color: '#64748B',
                      textDecoration: 'line-through'
                    }}>
                      ${pkg.regularPrice.toFixed(0)}
                    </span>
                  </div>
                  <p style={{ color: '#10B981', fontSize: '0.875rem', fontWeight: '600' }}>
                    Best value for families
                  </p>
                </div>

                {/* Package Contents */}
                {pkg.items && pkg.items.length > 0 && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{
                      color: '#CBD5E1',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      Package Includes:
                    </p>
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {pkg.items.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: '#E2E8F0',
                            fontSize: '0.875rem',
                            padding: '0.5rem',
                            background: 'rgba(200, 169, 106, 0.05)',
                            borderRadius: '6px',
                            border: '1px solid rgba(200, 169, 106, 0.1)'
                          }}
                        >
                          <Check size={16} style={{ color: '#10B981', flexShrink: 0 }} />
                          <span>
                            <strong>{item.quantity} {item.unit}</strong> {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to Cart Button */}
                <Button
                  onClick={() => handleAddToCart(pkg)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    fontSize: '1rem',
                    fontWeight: '700',
                    background: 'linear-gradient(135deg, #C8A96A 0%, #B8956A 100%)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                  className="package-cta-button"
                >
                  Add to Cart
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .package-card:hover {
          border-color: #C8A96A;
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(200, 169, 106, 0.2);
        }
        
        .package-cta-button:hover {
          background: linear-gradient(135deg, #D4B97A 0%, #C8A96A 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(200, 169, 106, 0.4);
        }
      `}</style>
    </section>
  );
};

export default PackagesSection;
