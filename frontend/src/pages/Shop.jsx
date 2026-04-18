import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Filter, Search } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

const Shop = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, searchQuery, products]);

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/bbq-products`);
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.meatType === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredProducts(filtered);
  };

  const categories = [
    { id: 'all', label: 'All Products', icon: '🔥' },
    { id: 'beef', label: 'Beef', icon: '🥩' },
    { id: 'chicken', label: 'Chicken', icon: '🍗' },
    { id: 'pork', label: 'Pork', icon: '🥓' },
    { id: 'lamb', label: 'Lamb', icon: '🍖' }
  ];

  const handleAddToCart = (product) => {
    addToCart({
      product_id: product.id,
      product_name: product.name,
      price: parseFloat(product.basePrice),
      quantity: 1,
      weight: '1 lb',
      subscribe: false
    });
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom, #0a0a0a, #1a1a1a)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#F5F1E8'
      }}>
        <div>Loading products...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #0a0a0a, #1a1a1a)',
      paddingTop: '6rem'
    }}>
      {/* Hero Section */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 1.5rem 4rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '4rem',
            fontWeight: '300',
            color: '#F5F1E8',
            marginBottom: '1rem'
          }}>
            Premium Cuts
          </h1>
          <p style={{
            color: '#A8A296',
            fontSize: '1.1rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Hand-selected USDA Prime and Wagyu steaks delivered to your door
          </p>
        </div>

        {/* Search & Filter */}
        <div style={{
          background: 'rgba(22,20,18,0.8)',
          border: '1px solid rgba(200, 169, 106, 0.2)',
          padding: '2rem',
          marginBottom: '3rem'
        }}>
          {/* Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            background: 'rgba(0,0,0,0.3)',
            padding: '1rem',
            border: '1px solid rgba(200, 169, 106, 0.2)'
          }}>
            <Search size={20} style={{ color: '#C8A96A' }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#F5F1E8',
                fontSize: '1rem',
                outline: 'none',
                fontFamily: 'Outfit, sans-serif'
              }}
            />
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: selectedCategory === cat.id ? '#6A1A21' : 'transparent',
                  color: selectedCategory === cat.id ? '#F5F1E8' : '#A8A296',
                  border: `1px solid ${selectedCategory === cat.id ? '#6A1A21' : 'rgba(200, 169, 106, 0.3)'}`,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat.id) {
                    e.target.style.borderColor = '#C8A96A';
                    e.target.style.color = '#F5F1E8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== cat.id) {
                    e.target.style.borderColor = 'rgba(200, 169, 106, 0.3)';
                    e.target.style.color = '#A8A296';
                  }
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div style={{
          marginBottom: '2rem',
          color: '#A8A296',
          fontSize: '0.9rem',
          textTransform: 'uppercase',
          letterSpacing: '0.15em'
        }}>
          Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem',
            color: '#A8A296'
          }}>
            No products found. Try adjusting your filters.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {filteredProducts.map(product => (
              <div
                key={product.id}
                style={{
                  background: 'rgba(22,20,18,0.8)',
                  border: '1px solid rgba(200, 169, 106, 0.15)',
                  padding: '1.5rem',
                  transition: 'all 0.3s',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/product/${product.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#C8A96A';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(200, 169, 106, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Product Image */}
                {product.image && (
                  <div style={{
                    width: '100%',
                    height: '200px',
                    marginBottom: '1rem',
                    overflow: 'hidden',
                    background: 'rgba(0,0,0,0.3)'
                  }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1588347818036-4c0b583d9da5?w=400';
                      }}
                    />
                  </div>
                )}

                {/* Product Info */}
                <div>
                  <h3 style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: '1.5rem',
                    color: '#F5F1E8',
                    marginBottom: '0.5rem'
                  }}>
                    {product.name}
                  </h3>
                  
                  {product.grade && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#C8A96A',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '0.75rem'
                    }}>
                      {product.grade}
                    </div>
                  )}

                  {product.description && (
                    <p style={{
                      color: '#A8A296',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      marginBottom: '1rem'
                    }}>
                      {product.description.length > 100
                        ? `${product.description.substring(0, 100)}...`
                        : product.description
                      }
                    </p>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '1rem'
                  }}>
                    <div>
                      <span style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: '1.75rem',
                        color: '#C8A96A',
                        fontWeight: '700'
                      }}>
                        ${product.basePrice}
                      </span>
                      <span style={{
                        color: '#A8A296',
                        fontSize: '0.9rem',
                        marginLeft: '0.5rem'
                      }}>
                        /lb
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#6A1A21',
                        color: '#F5F1E8',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#8A2A31';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#6A1A21';
                      }}
                    >
                      <ShoppingCart size={16} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
