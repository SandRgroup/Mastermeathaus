import React, { useState, useEffect } from 'react';
import { Box, Check, Star } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../contexts/CartContext';

const BoxesSection = () => {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchBoxes();
  }, []);

  const fetchBoxes = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/boxes`);
      if (response.ok) {
        const data = await response.json();
        setBoxes(data);
      }
    } catch (error) {
      console.error('Error fetching boxes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (box) => {
    addToCart({
      id: box.id,
      name: box.name,
      price: `$${box.price.toFixed(2)}`,
      image: '/api/placeholder/400/300',
      type: 'box'
    });
  };

  if (loading) {
    return (
      <section style={{ background: '#0a0a0a', padding: '5rem 0' }}>
        <div className="container text-center">
          <p style={{ color: '#94A3B8' }}>Loading steak boxes...</p>
        </div>
      </section>
    );
  }

  if (boxes.length === 0) {
    return null;
  }

  return (
    <section style={{
      background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
      padding: '5rem 0',
      borderTop: '1px solid #222'
    }}>
      <div className="container">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Box className="w-8 h-8" style={{ color: '#C8A96A' }} />
            <span style={{
              color: '#C8A96A',
              fontSize: '0.875rem',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              Premium Steak Collections
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
            Shop Steak Boxes
          </h2>
          <p style={{
            color: '#E2E8F0',
            fontSize: '1.125rem',
            maxWidth: '700px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Curated collections of our finest cuts. Perfect for any occasion.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {boxes.map((box) => (
            <div
              key={box.id}
              style={{
                background: 'linear-gradient(145deg, #1a1a1a 0%, #0f0f0f 100%)',
                border: box.featured ? '2px solid #C8A96A' : '2px solid #2a2a2a',
                borderRadius: '16px',
                padding: '1.5rem',
                position: 'relative',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
              className="box-card"
            >
              {/* Featured Badge */}
              {box.featured && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '15px',
                  background: 'linear-gradient(135deg, #C8A96A 0%, #B8956A 100%)',
                  color: '#000',
                  padding: '0.375rem 0.875rem',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  boxShadow: '0 4px 12px rgba(200, 169, 106, 0.4)'
                }}>
                  <Star size={12} fill="currentColor" />
                  FEATURED
                </div>
              )}

              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '800',
                color: '#F1F5F9',
                marginBottom: '0.5rem',
                marginTop: box.featured ? '0.5rem' : '0'
              }}>
                {box.name}
              </h3>

              <p style={{
                color: '#94A3B8',
                fontSize: '0.875rem',
                marginBottom: '1rem',
                lineHeight: '1.5',
                flexGrow: 1
              }}>
                {box.description}
              </p>

              {/* Price */}
              <div style={{ marginBottom: '1rem' }}>
                <span style={{
                  fontSize: '2rem',
                  fontWeight: '900',
                  background: 'linear-gradient(135deg, #C8A96A 0%, #F4E4C1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  ${box.price.toFixed(0)}
                </span>
              </div>

              {/* Box Contents */}
              {box.items && box.items.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <p style={{
                    color: '#CBD5E1',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Includes:
                  </p>
                  <div style={{ display: 'grid', gap: '0.375rem' }}>
                    {box.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.375rem',
                          color: '#E2E8F0',
                          fontSize: '0.8125rem',
                          lineHeight: '1.3'
                        }}
                      >
                        <Check size={14} style={{ color: '#10B981', flexShrink: 0, marginTop: '2px' }} />
                        <span>
                          {item.quantity}x {item.name} ({item.unit})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              {box.features && box.features.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  {box.features.map((feature, idx) => (
                    <p
                      key={idx}
                      style={{
                        fontSize: '0.75rem',
                        color: '#94A3B8',
                        fontStyle: 'italic',
                        marginTop: '0.25rem'
                      }}
                    >
                      • {feature}
                    </p>
                  ))}
                </div>
              )}

              {/* Add to Cart Button */}
              <Button
                onClick={() => handleAddToCart(box)}
                style={{
                  width: '100%',
                  padding: '0.875rem',
                  fontSize: '0.9375rem',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #C8A96A 0%, #B8956A 100%)',
                  color: '#000',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginTop: 'auto'
                }}
                className="box-cta-button"
              >
                Add to Cart
              </Button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .box-card:hover {
          border-color: #C8A96A !important;
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(200, 169, 106, 0.25);
        }
        
        .box-cta-button:hover {
          background: linear-gradient(135deg, #D4B97A 0%, #C8A96A 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(200, 169, 106, 0.5);
        }
      `}</style>
    </section>
  );
};

export default BoxesSection;
