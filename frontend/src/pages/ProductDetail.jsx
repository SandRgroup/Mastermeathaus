import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

const LOGO_URL = 'https://customer-assets.emergentagent.com/job_wagyu-vault/artifacts/xd3bmr62_ChatGPT%20Image%20Apr%2017%2C%202026%20at%2008_47_27%20PM%20%282%29.png';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedGrade, setSelectedGrade] = useState('standard');
  const [selectedAging, setSelectedAging] = useState(0);

  const BEEF_GRADES = [
    { id: 'standard', label: 'Standard', modifier: 0 },
    { id: 'prime', label: 'Prime', modifier: 8 },
    { id: 'grass_fed', label: 'Grass Fed', modifier: 4 },
    { id: 'wagyu', label: 'Wagyu', modifier: 15 }
  ];

  const DRY_AGING_OPTIONS = [
    { days: 0, label: 'Fresh', price: 0 },
    { days: 21, label: '21 Days', price: 6 },
    { days: 35, label: '35 Days', price: 10 },
    { days: 45, label: '45 Days', price: 15 }
  ];

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/bbq-products`);
      const foundProduct = data.find(p => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        toast.error('Product not found');
        navigate('/shop');
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      toast.error('Failed to load product');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const isSteak = () => {
    if (!product || !product.name) return false;
    const name = product.name.toLowerCase();
    const steakKeywords = [
      'steak', 'ribeye', 'rib eye', 'filet', 'mignon', 
      'ny strip', 'new york', 'porterhouse', 't-bone', 't bone',
      'tomahawk', 'sirloin', 'tenderloin', 'wagyu'
    ];
    return steakKeywords.some(keyword => name.includes(keyword));
  };

  const calculatePrice = () => {
    if (!product) return 0;
    
    let basePrice = parseFloat(product.basePrice) || 0;
    
    // Apply grade modifier (per lb)
    if (isSteak()) {
      const grade = BEEF_GRADES.find(g => g.id === selectedGrade);
      if (grade) basePrice += grade.modifier;
    }
    
    // Total for quantity
    let total = basePrice * quantity;
    
    // Add dry aging (flat fee)
    if (isSteak() && selectedAging > 0) {
      const aging = DRY_AGING_OPTIONS.find(a => a.days === selectedAging);
      if (aging) total += aging.price;
    }
    
    return total;
  };

  const handleAddToCart = () => {
    let customizations = [];
    
    if (isSteak()) {
      const gradeLabel = BEEF_GRADES.find(g => g.id === selectedGrade)?.label;
      if (gradeLabel && selectedGrade !== 'standard') customizations.push(gradeLabel);
      if (selectedAging > 0) customizations.push(`${selectedAging}d Aged`);
    }
    
    const productName = customizations.length > 0 
      ? `${product.name} (${customizations.join(', ')})`
      : product.name;

    addToCart({
      product_id: product.id,
      product_name: productName,
      price: calculatePrice() / quantity,
      quantity,
      weight: `${quantity} lb`,
      subscribe: false
    });
    
    toast.success(`${productName} added to cart!`);
  };

  if (loading || !product) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #0a0a0a, #1a1a1a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#F5F1E8'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0a0a0a, #1a1a1a)'
    }}>
      {/* Header with Logo */}
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src={LOGO_URL}
              alt="Masters Meat Haus - Premium Butchery"
              style={{
                height: '50px',
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </a>
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="/" style={{ color: '#A8A296', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}>
              Home
            </a>
            <a href="/shop" style={{ color: '#C8A96A', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}>
              Shop
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 1.5rem'
        }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/shop')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'transparent',
            border: '1px solid rgba(200, 169, 106, 0.3)',
            color: '#C8A96A',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            marginBottom: '2rem',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}
        >
          <ArrowLeft size={16} />
          Back to Shop
        </button>

        {/* Product Detail */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '3rem',
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr'
          }
        }}>
          {/* Product Image */}
          <div style={{
            background: 'rgba(22,20,18,0.8)',
            border: '1px solid rgba(200, 169, 106, 0.2)',
            padding: '2rem'
          }}>
            <img
              src={product.image || 'https://images.unsplash.com/photo-1588347818036-4c0b583d9da5?w=600'}
              alt={product.name}
              style={{
                width: '100%',
                height: 'auto',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1588347818036-4c0b583d9da5?w=600';
              }}
            />
          </div>

          {/* Product Info */}
          <div>
            <h1 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '3rem',
              fontWeight: '300',
              color: '#F5F1E8',
              marginBottom: '1rem'
            }}>
              {product.name}
            </h1>

            {product.grade && (
              <div style={{
                fontSize: '0.85rem',
                color: '#C8A96A',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                marginBottom: '1.5rem'
              }}>
                {product.grade}
              </div>
            )}

            <div style={{
              marginBottom: '2rem'
            }}>
              <span style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: '2.5rem',
                color: '#C8A96A',
                fontWeight: '700'
              }}>
                ${product.basePrice}
              </span>
              <span style={{
                color: '#A8A296',
                fontSize: '1.1rem',
                marginLeft: '0.5rem'
              }}>
                /lb
              </span>
            </div>

            {product.description && (
              <p style={{
                color: '#A8A296',
                fontSize: '1.05rem',
                lineHeight: '1.7',
                marginBottom: '2rem'
              }}>
                {product.description}
              </p>
            )}

            <div style={{
              height: '1px',
              background: 'linear-gradient(to right, transparent, rgba(200, 169, 106, 0.3), transparent)',
              margin: '2rem 0'
            }}></div>

            {/* Customization Options - Only for Steaks */}
            {isSteak() && (
              <div style={{ marginBottom: '2rem' }}>
                {/* Beef Grade */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: '#F5F1E8',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '0.75rem'
                  }}>
                    Beef Quality Grade
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(200, 169, 106, 0.3)',
                      color: '#F5F1E8',
                      fontSize: '1rem',
                      fontFamily: 'Outfit, sans-serif'
                    }}
                  >
                    {BEEF_GRADES.map(grade => (
                      <option key={grade.id} value={grade.id}>
                        {grade.label} {grade.modifier > 0 ? `(+$${grade.modifier}/lb)` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dry Aging */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    color: '#F5F1E8',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '0.75rem'
                  }}>
                    Dry Aging
                  </label>
                  <select
                    value={selectedAging}
                    onChange={(e) => setSelectedAging(parseInt(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(200, 169, 106, 0.3)',
                      color: '#F5F1E8',
                      fontSize: '1rem',
                      fontFamily: 'Outfit, sans-serif'
                    }}
                  >
                    {DRY_AGING_OPTIONS.map(option => (
                      <option key={option.days} value={option.days}>
                        {option.label} {option.price > 0 ? `(+$${option.price})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{
                  height: '1px',
                  background: 'linear-gradient(to right, transparent, rgba(200, 169, 106, 0.3), transparent)',
                  margin: '2rem 0'
                }}></div>
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                color: '#F5F1E8',
                fontSize: '0.9rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '0.75rem'
              }}>
                Quantity (lbs)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: '48px',
                    height: '48px',
                    border: '1px solid rgba(200, 169, 106, 0.4)',
                    background: 'transparent',
                    color: '#F5F1E8',
                    cursor: 'pointer',
                    fontSize: '1.5rem'
                  }}
                >
                  −
                </button>
                <span style={{ 
                  color: '#F5F1E8', 
                  fontWeight: '600',
                  fontSize: '1.25rem',
                  minWidth: '50px',
                  textAlign: 'center'
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: '48px',
                    height: '48px',
                    border: '1px solid rgba(200, 169, 106, 0.4)',
                    background: 'transparent',
                    color: '#F5F1E8',
                    cursor: 'pointer',
                    fontSize: '1.5rem'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Price */}
            <div style={{
              background: 'rgba(22,20,18,0.8)',
              border: '2px solid #C8A96A',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  color: '#A8A296',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}>
                  Total
                </span>
                <span style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '2.5rem',
                  color: '#C8A96A',
                  fontWeight: '700'
                }}>
                  ${calculatePrice().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="btn-haus-primary"
              style={{
                width: '100%',
                padding: '1.25rem',
                fontSize: '1rem'
              }}
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
