import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Users, ShoppingCart, Send, Check } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';

const EXAMPLE_PROMPTS = [
  '20 people luxury tomahawk dinner',
  '15 people family BBQ',
  '10 people mixed grill party',
  '8 people premium steak night'
];

const BEEF_GRADES = [
  { id: 'standard', label: 'Standard', tag: 'Base Price', modifier: 0 },
  { id: 'prime', label: 'Prime', tag: '+$8/lb', modifier: 8 },
  { id: 'grass_fed', label: 'Grass Fed', tag: '+$4/lb', modifier: 4 },
  { id: 'wagyu', label: 'Wagyu', tag: '+$15/lb', modifier: 15 }
];

const DRY_AGING_OPTIONS = [
  { days: 0, label: 'Fresh', price: 0 },
  { days: 21, label: '21 Days', price: 6 },   // Flat $6 per steak
  { days: 35, label: '35 Days', price: 10 },  // Flat $10 per steak
  { days: 45, label: '45 Days', price: 15 }   // Flat $15 per steak
];

const AIBBQCalculator = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const { addToCart } = useCart();
  
  // State
  const [prompt, setPrompt] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState({}); // { productId: { selected, quantity, grade, dryAgingDays } }
  const [mode, setMode] = useState('checkout'); // 'checkout' or 'quote'
  const [loading, setLoading] = useState(true);
  const [eventTypePortions, setEventTypePortions] = useState(null); // Load from API
  
  // Lead form
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState({ firstName: '', email: '', zipCode: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/bbq-products`);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const parsePrompt = (text) => {
    const peopleMatch = text.match(/(\d+)\s*people/i);
    const people = peopleMatch ? parseInt(peopleMatch[1]) : 10;
    
    let eventType = 'casual';
    if (/luxury|premium|high.?end/i.test(text)) eventType = 'luxury';
    else if (/family|dinner/i.test(text)) eventType = 'family';
    else if (/party|celebration/i.test(text)) eventType = 'party';
    
    const portionPerPerson = eventTypePortions ? (eventTypePortions[eventType] || 1.2) : 1.2;
    
    return {
      people,
      eventType: eventType.charAt(0).toUpperCase() + eventType.slice(1) + ' experience',
      portionPerPerson
    };
  };

  const isSteak = (product) => {
    return product.name && product.name.toLowerCase().includes('steak');
  };

  const handlePromptChange = (text) => {
    setPrompt(text);
    if (text.length > 5) {
      const parsed = parsePrompt(text);
      setParsedData(parsed);
    }
  };

  const toggleProduct = (productId) => {
    setSelectedProducts(prev => {
      const current = prev[productId] || { selected: false, quantity: 1, grade: 'standard', dryAgingDays: 0 };
      return {
        ...prev,
        [productId]: { ...current, selected: !current.selected }
      };
    });
  };

  const updateQuantity = (productId, quantity) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: { ...prev[productId], quantity: Math.max(1, quantity) }
    }));
  };

  const updateGrade = (productId, grade) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: { ...prev[productId], grade }
    }));
  };

  const updateDryAging = (productId, days) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: { ...prev[productId], dryAgingDays: days }
    }));
  };

  const calculateProductPrice = (product, quantity = 1, grade = 'standard', dryAgingDays = 0) => {
    let basePrice = parseFloat(product.basePrice) || 0;
    
    // Apply grade modifier (per lb)
    const gradeObj = BEEF_GRADES.find(g => g.id === grade);
    if (gradeObj) basePrice += gradeObj.modifier;
    
    // Calculate base total
    let total = basePrice * quantity;
    
    // Apply dry aging (flat fee per item, not per lb)
    if (dryAgingDays > 0) {
      const aging = DRY_AGING_OPTIONS.find(a => a.days === dryAgingDays);
      if (aging) {
        total += aging.price; // Flat fee, not multiplied by quantity
      }
    }
    
    return total;
  };

  const getTotalPrice = () => {
    return Object.entries(selectedProducts)
      .filter(([_, data]) => data.selected)
      .reduce((sum, [productId, data]) => {
        const product = products.find(p => p.id === productId);
        if (!product) return sum;
        return sum + calculateProductPrice(product, data.quantity, data.grade, data.dryAgingDays);
      }, 0);
  };

  const getSelectedCount = () => {
    return Object.values(selectedProducts).filter(s => s.selected).length;
  };

  const handleCheckout = async () => {
    const selectedItems = Object.entries(selectedProducts)
      .filter(([_, data]) => data.selected)
      .map(([productId, data]) => {
        const product = products.find(p => p.id === productId);
        const price = calculateProductPrice(product, 1, data.grade, data.dryAgingDays);
        
        // Build product name with customizations
        let customizations = [];
        if (isSteak(product)) {
          const gradeLabel = BEEF_GRADES.find(g => g.id === data.grade)?.label;
          if (gradeLabel && data.grade !== 'standard') customizations.push(gradeLabel);
          if (data.dryAgingDays > 0) customizations.push(`${data.dryAgingDays}d Aged`);
        }
        
        const productName = customizations.length > 0 
          ? `${product.name} (${customizations.join(', ')})`
          : product.name;
        
        return {
          product_id: product.id,
          product_name: productName,
          price,
          quantity: data.quantity,
          weight: '1 lb',
          subscribe: false
        };
      });

    if (selectedItems.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    try {
      const { data } = await axios.post(`${backendUrl}/api/checkout/session`, {
        cart_items: selectedItems,
        origin_url: window.location.origin
      });
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to create checkout session');
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    
    if (!leadData.firstName || !leadData.email || !leadData.zipCode) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const selectedItems = Object.entries(selectedProducts)
        .filter(([_, data]) => data.selected)
        .map(([productId, data]) => {
          const product = products.find(p => p.id === productId);
          
          let customizations = [];
          if (isSteak(product)) {
            const gradeLabel = BEEF_GRADES.find(g => g.id === data.grade)?.label;
            if (gradeLabel && data.grade !== 'standard') customizations.push(gradeLabel);
            if (data.dryAgingDays > 0) customizations.push(`${data.dryAgingDays}d Aged`);
          }
          
          const productName = customizations.length > 0 
            ? `${product.name} (${customizations.join(', ')})`
            : product.name;
          
          return {
            product_name: productName,
            quantity: data.quantity,
            grade: data.grade || 'standard',
            dry_aging_days: data.dryAgingDays || 0
          };
        });
      
      await axios.post(`${backendUrl}/api/bbq-plans`, {
        prompt: prompt || 'Direct selection',
        people: parsedData?.people || 10,
        event_type: parsedData?.eventType || 'Custom order',
        portion_per_person: parsedData?.portionPerPerson || 1.2,
        selected_categories: ['mixed'],
        selected_cuts: { mixed: selectedItems },
        total_lbs: getTotalPrice() / 25,
        total_price: getTotalPrice(),
        lead: {
          first_name: leadData.firstName,
          email: leadData.email,
          zip_code: leadData.zipCode
        }
      });
      
      toast.success('🎉 Your BBQ plan has been submitted!');
      setShowLeadForm(false);
      setLeadData({ firstName: '', email: '', zipCode: '' });
      setSelectedProducts({});
      setPrompt('');
      setParsedData(null);
      
    } catch (error) {
      console.error('Failed to submit:', error);
      toast.error('Failed to submit plan');
    } finally {
      setSubmitting(false);
    }
  };

  // Group products by meat type
  const groupedProducts = products.reduce((acc, product) => {
    const type = product.meatType || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(product);
    return acc;
  }, {});

  const meatTypeIcons = {
    beef: '🥩',
    chicken: '🍗',
    lamb: '🍖',
    pork: '🥓',
    other: '🔥'
  };

  return (
    <section id="ai-bbq-calculator" style={{ 
      background: 'linear-gradient(to bottom, #0a0a0a, #1a1a1a)',
      borderTop: '1px solid rgba(200, 169, 106, 0.15)',
      borderBottom: '1px solid rgba(200, 169, 106, 0.15)',
      padding: '6rem 1.5rem'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ maxWidth: '800px', marginBottom: '4rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            color: '#C8A96A',
            marginBottom: '2rem'
          }}>
            <Flame size={14} />
            AI BBQ Calculator
          </div>
          
          <h2 style={{
            fontFamily: 'Cormorant Garamond, Georgia, serif',
            fontSize: '3.5rem',
            fontWeight: '300',
            color: '#F5F1E8',
            lineHeight: '1.2',
            marginBottom: '1.5rem'
          }}>
            Tell us about your event.
            <span style={{ display: 'block', fontStyle: 'italic', color: '#C8A96A' }}>
              AI picks the perfect cuts.
            </span>
          </h2>
          
          <p style={{ 
            color: '#A8A296', 
            fontSize: '1.05rem',
            lineHeight: '1.7',
            maxWidth: '700px'
          }}>
            Our AI reads your party in plain English. Pick your meats, choose quality grades, 
            select dry-aging, and either checkout directly or request a custom quote.
          </p>
        </div>

        <div style={{ 
          height: '1px', 
          background: 'linear-gradient(to right, transparent, rgba(200, 169, 106, 0.3), transparent)',
          margin: '3rem 0'
        }}></div>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
          <button
            onClick={() => setMode('checkout')}
            style={{
              padding: '1rem 2rem',
              fontSize: '0.85rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              background: mode === 'checkout' ? '#6A1A21' : 'transparent',
              color: mode === 'checkout' ? '#F5F1E8' : '#A8A296',
              border: `1px solid ${mode === 'checkout' ? '#6A1A21' : 'rgba(181,137,80,0.3)'}`,
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            <ShoppingCart size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Direct Checkout
          </button>
          <button
            onClick={() => setMode('quote')}
            style={{
              padding: '1rem 2rem',
              fontSize: '0.85rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              background: mode === 'quote' ? '#6A1A21' : 'transparent',
              color: mode === 'quote' ? '#F5F1E8' : '#A8A296',
              border: `1px solid ${mode === 'quote' ? '#6A1A21' : 'rgba(181,137,80,0.3)'}`,
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            <Sparkles size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
            Custom Quote
          </button>
        </div>

        {/* AI Prompt Input */}
        <div style={{
          background: 'rgba(22,20,18,0.8)',
          border: '1px solid rgba(200, 169, 106, 0.2)',
          padding: '2rem',
          marginBottom: '3rem',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem', alignItems: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              border: '1px solid rgba(200, 169, 106, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#C8A96A'
            }}>
              <Sparkles size={24} />
            </div>
            <input
              placeholder="e.g. 20 people luxury tomahawk dinner"
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.3)',
                border: 'none',
                borderBottom: '1px solid rgba(200, 169, 106, 0.3)',
                color: '#F5F1E8',
                padding: '1rem 0',
                fontSize: '1.1rem',
                outline: 'none',
                fontFamily: 'Outfit, sans-serif'
              }}
              value={prompt}
              onChange={(e) => handlePromptChange(e.target.value)}
            />
          </div>

          {/* Example Prompts */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem' }}>
            <span style={{ 
              fontSize: '0.65rem', 
              textTransform: 'uppercase', 
              letterSpacing: '0.28em', 
              color: '#A8A296' 
            }}>
              Try:
            </span>
            {EXAMPLE_PROMPTS.map((example, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptChange(example)}
                style={{
                  fontSize: '0.75rem',
                  color: '#A8A296',
                  background: 'transparent',
                  border: '1px solid rgba(200, 169, 106, 0.2)',
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#F5F1E8';
                  e.target.style.borderColor = '#C8A96A';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#A8A296';
                  e.target.style.borderColor = 'rgba(200, 169, 106, 0.2)';
                }}
              >
                {example}
              </button>
            ))}
          </div>

          {/* Parsed Data */}
          {parsedData && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '2rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                border: '1px solid rgba(200, 169, 106, 0.25)',
                padding: '0.75rem 1.25rem'
              }}>
                <Users size={16} style={{ color: '#C8A96A' }} />
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.24em', color: '#A8A296' }}>
                  Guests
                </span>
                <span style={{ color: '#F5F1E8', fontWeight: '600' }}>{parsedData.people}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                border: '1px solid rgba(200, 169, 106, 0.25)',
                padding: '0.75rem 1.25rem'
              }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.24em', color: '#A8A296' }}>
                  Event
                </span>
                <span style={{ color: '#C8A96A', fontWeight: '600' }}>{parsedData.eventType}</span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                border: '1px solid rgba(200, 169, 106, 0.25)',
                padding: '0.75rem 1.25rem'
              }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.24em', color: '#A8A296' }}>
                  Per Person
                </span>
                <span style={{ color: '#F5F1E8', fontWeight: '600' }}>{parsedData.portionPerPerson} lbs</span>
              </div>
            </div>
          )}
        </div>

        {/* Product Selection */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#A8A296' }}>
            Loading products...
          </div>
        ) : (
          <div style={{ marginBottom: '3rem' }}>
            {Object.entries(groupedProducts).map(([meatType, productList]) => (
              <div key={meatType} style={{ marginBottom: '3rem' }}>
                <h3 style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '2rem',
                  color: '#C8A96A',
                  marginBottom: '1.5rem',
                  textTransform: 'capitalize',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem'
                }}>
                  <span style={{ fontSize: '2.5rem' }}>{meatTypeIcons[meatType]}</span>
                  {meatType}
                </h3>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1.5rem'
                }}>
                  {productList.map(product => {
                    const selection = selectedProducts[product.id] || { selected: false, quantity: 1, grade: 'standard', dryAgingDays: 0 };
                    const itemPrice = selection.selected ? calculateProductPrice(product, selection.quantity, selection.grade, selection.dryAgingDays) : 0;
                    const isSteakProduct = isSteak(product);

                    return (
                      <div
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        style={{
                          background: selection.selected ? 'rgba(106,26,33,0.2)' : 'rgba(22,20,18,0.8)',
                          border: `1px solid ${selection.selected ? '#C8A96A' : 'rgba(200, 169, 106, 0.15)'}`,
                          padding: '1.5rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{
                              fontFamily: 'Cormorant Garamond, serif',
                              fontSize: '1.35rem',
                              color: '#F5F1E8',
                              marginBottom: '0.5rem'
                            }}>
                              {product.name}
                              {isSteakProduct && (
                                <span style={{
                                  marginLeft: '0.5rem',
                                  fontSize: '0.7rem',
                                  color: '#C8A96A',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.1em'
                                }}>
                                  🥩 Customizable
                                </span>
                              )}
                            </h4>
                            <div style={{
                              fontSize: '0.8rem',
                              color: '#A8A296'
                            }}>
                              ${product.basePrice}/lb base
                            </div>
                          </div>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            border: `2px solid ${selection.selected ? '#C8A96A' : 'rgba(168,162,150,0.5)'}`,
                            background: selection.selected ? '#C8A96A' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            {selection.selected && <Check size={16} style={{ color: '#0a0a0a' }} />}
                          </div>
                        </div>

                        {product.description && (
                          <p style={{
                            fontSize: '0.9rem',
                            color: '#A8A296',
                            lineHeight: '1.5',
                            marginBottom: '1rem'
                          }}>
                            {product.description}
                          </p>
                        )}

                        {selection.selected && (
                          <div 
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              marginTop: '1rem',
                              paddingTop: '1rem',
                              borderTop: '1px solid rgba(200, 169, 106, 0.2)'
                            }}
                          >
                            {/* Beef Grade Selector - Only for Steaks */}
                            {isSteakProduct && (
                              <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                  fontSize: '0.7rem',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.18em',
                                  color: '#A8A296',
                                  display: 'block',
                                  marginBottom: '0.5rem'
                                }}>
                                  Beef Quality Grade
                                </label>
                                <select
                                  value={selection.grade || 'standard'}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    updateGrade(product.id, e.target.value);
                                  }}
                                  style={{
                                    width: '100%',
                                    background: 'rgba(0,0,0,0.5)',
                                    border: '1px solid rgba(200, 169, 106, 0.3)',
                                    color: '#F5F1E8',
                                    padding: '0.75rem',
                                    fontSize: '0.95rem',
                                    fontFamily: 'Outfit, sans-serif',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {BEEF_GRADES.map(grade => (
                                    <option key={grade.id} value={grade.id}>
                                      {grade.label} {grade.tag !== 'Base Price' ? `(${grade.tag})` : ''}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Dry Aging Selector - Only for Steaks */}
                            {isSteakProduct && (
                              <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                  fontSize: '0.7rem',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.18em',
                                  color: '#A8A296',
                                  display: 'block',
                                  marginBottom: '0.5rem'
                                }}>
                                  Dry Aging (Min 10lb)
                                </label>
                                <select
                                  value={selection.dryAgingDays || 0}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    updateDryAging(product.id, parseInt(e.target.value));
                                  }}
                                  style={{
                                    width: '100%',
                                    background: 'rgba(0,0,0,0.5)',
                                    border: '1px solid rgba(200, 169, 106, 0.3)',
                                    color: '#F5F1E8',
                                    padding: '0.75rem',
                                    fontSize: '0.95rem',
                                    fontFamily: 'Outfit, sans-serif',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {DRY_AGING_OPTIONS.map(option => (
                                    <option key={option.days} value={option.days}>
                                      {option.label} {option.price > 0 ? `(+$${option.price})` : ''}
                                    </option>
                                  ))}
                                </select>
                                {selection.dryAgingDays > 0 && (
                                  <div style={{
                                    fontSize: '0.7rem',
                                    color: '#C8A96A',
                                    marginTop: '0.5rem',
                                    fontStyle: 'italic'
                                  }}>
                                    ℹ️ Dry aging recommended for steaks 10lb+
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Quantity Selector */}
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginBottom: '0.75rem'
                            }}>
                              <span style={{
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.18em',
                                color: '#A8A296'
                              }}>
                                Quantity (lbs)
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(product.id, selection.quantity - 1);
                                  }}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    border: '1px solid rgba(200, 169, 106, 0.4)',
                                    background: 'transparent',
                                    color: '#F5F1E8',
                                    cursor: 'pointer',
                                    fontSize: '1.25rem'
                                  }}
                                >
                                  −
                                </button>
                                <span style={{ 
                                  color: '#F5F1E8', 
                                  fontWeight: '600',
                                  minWidth: '30px',
                                  textAlign: 'center'
                                }}>
                                  {selection.quantity}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateQuantity(product.id, selection.quantity + 1);
                                  }}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    border: '1px solid rgba(200, 169, 106, 0.4)',
                                    background: 'transparent',
                                    color: '#F5F1E8',
                                    cursor: 'pointer',
                                    fontSize: '1.25rem'
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            
                            {/* Price Display */}
                            <div style={{ textAlign: 'right' }}>
                              <span style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#C8A96A',
                                fontFamily: 'Cormorant Garamond, serif'
                              }}>
                                ${itemPrice.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary & Actions */}
        {getSelectedCount() > 0 && (
          <div style={{
            background: 'rgba(22,20,18,0.95)',
            border: '2px solid #C8A96A',
            padding: '2.5rem',
            marginTop: '3rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '2rem'
            }}>
              <div>
                <div style={{
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.24em',
                  color: '#A8A296',
                  marginBottom: '0.5rem'
                }}>
                  {getSelectedCount()} items selected
                </div>
                <div style={{
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: '3rem',
                  color: '#C8A96A',
                  fontWeight: '300'
                }}>
                  ${getTotalPrice().toFixed(2)}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {mode === 'checkout' && (
                  <button
                    onClick={handleCheckout}
                    className="btn-haus-primary"
                  >
                    <ShoppingCart size={18} />
                    Checkout Now
                  </button>
                )}
                {mode === 'quote' && (
                  <button
                    onClick={() => setShowLeadForm(true)}
                    className="btn-haus-primary"
                  >
                    <Send size={18} />
                    Request Custom Quote
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lead Form */}
        {showLeadForm && (
          <div style={{
            background: 'rgba(22,20,18,0.95)',
            border: '2px solid #C8A96A',
            padding: '2.5rem',
            marginTop: '2rem'
          }}>
            <h3 style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '2rem',
              color: '#C8A96A',
              marginBottom: '2rem'
            }}>
              Get Your Custom Quote
            </h3>
            <form onSubmit={handleLeadSubmit}>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      value={leadData.firstName}
                      onChange={(e) => setLeadData({ ...leadData, firstName: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      value={leadData.email}
                      onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Zip Code *</label>
                    <input
                      type="text"
                      value={leadData.zipCode}
                      onChange={(e) => setLeadData({ ...leadData, zipCode: e.target.value })}
                      className="form-input"
                      required
                      maxLength={10}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowLeadForm(false)}
                    className="btn-haus-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-haus-primary"
                  >
                    {submitting ? 'Submitting...' : 'Submit Quote Request →'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default AIBBQCalculator;
