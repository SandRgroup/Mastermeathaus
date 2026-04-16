import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Flame } from 'lucide-react';
import { toast } from 'sonner';

const BBQCalculator = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [people, setPeople] = useState(10);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [aging, setAging] = useState(0);
  const [unit, setUnit] = useState('lbs'); // 'lbs' or 'kg'
  const [pricing, setPricing] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const pricingRes = await axios.get(`${backendUrl}/api/pricing`);
      setPricing(pricingRes.data);
      
      // Auto-select first product if any
      if (pricingRes.data.bbqProducts && pricingRes.data.bbqProducts.length > 0) {
        setSelectedProducts({ [0]: true }); // Select first product by index
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load calculator');
      setLoading(false);
    }
  };

  const toggleProduct = (productId) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const calculate = () => {
    if (!pricing || !pricing.bbqProducts) return;

    const selectedIndices = Object.keys(selectedProducts).filter(idx => selectedProducts[idx]);
    
    if (selectedIndices.length === 0) {
      toast.error('Please select at least one product');
      return;
    }

    const totalMeatPerPerson = pricing.totalMeatPerPerson || 1.2;
    const numberOfMeats = selectedIndices.length;
    const lbsPerMeatPerPerson = totalMeatPerPerson / numberOfMeats;

    const breakdown = [];
    let totalMeat = 0;
    let totalCost = 0;

    selectedIndices.forEach(index => {
      const product = pricing.bbqProducts[index];
      if (!product) return;
      
      // Math: people × (total per person / number of meats) = total for this meat
      const totalLbs = people * lbsPerMeatPerPerson;
      const cost = totalLbs * (product.pricePerLb || 0);
      
      totalMeat += totalLbs;
      totalCost += cost;
      
      breakdown.push({
        name: product.name,
        category: product.category,
        lbs: totalLbs,
        lbsPerPerson: lbsPerMeatPerPerson,
        people: people,
        pricePerLb: product.pricePerLb,
        cost: cost.toFixed(2)
      });
    });

    const agingOption = pricing.aging[aging] || { label: 'Standard', upcharge: 0 };
    const finalTotal = totalCost + agingOption.upcharge;

    // Convert to kg if needed
    const displayUnit = unit;
    const conversionFactor = displayUnit === 'kg' ? 0.453592 : 1;

    setResult({
      totalMeat: (totalMeat * conversionFactor).toFixed(1),
      totalMeatPerPerson: (totalMeatPerPerson * conversionFactor).toFixed(2),
      numberOfMeats: numberOfMeats,
      lbsPerMeat: (lbsPerMeatPerPerson * conversionFactor).toFixed(2),
      breakdown: breakdown.map(item => ({
        ...item,
        lbs: (item.lbs * conversionFactor).toFixed(1),
        lbsPerPerson: (item.lbsPerPerson * conversionFactor).toFixed(2),
        displayUnit
      })),
      subtotal: totalCost.toFixed(2),
      agingLabel: agingOption.label,
      agingCost: agingOption.upcharge,
      totalPrice: finalTotal.toFixed(2),
      people: people,
      unit: displayUnit
    });
  };

  const handleOrder = async () => {
    if (!result) {
      toast.error('Please calculate your order first');
      return;
    }

    setOrdering(true);
    try {
      const productList = result.breakdown.map(p => p.name).join(', ');
      const response = await axios.post(`${backendUrl}/api/bbq-checkout`, {
        totalPrice: parseFloat(result.totalPrice),
        people,
        mode: `BBQ Selection: ${productList}`,
        aging: result.agingLabel
      });

      window.location.href = response.data.url;
    } catch (error) {
      console.error('Checkout failed:', error);
      toast.error('Failed to create checkout session');
      setOrdering(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.6)' }}>
        Loading BBQ Planner...
      </div>
    );
  }

  if (!pricing || !pricing.enabled) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.6)' }}>
        BBQ Planner is currently unavailable
      </div>
    );
  }

  if (!pricing.bbqProducts || pricing.bbqProducts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.6)' }}>
        No products available for BBQ yet. Admin: Add products in BBQ Settings.
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '650px',
      margin: 'auto',
      padding: '30px',
      borderRadius: '16px',
      background: '#0d0d0d',
      border: '1px solid #222',
      boxShadow: '0 15px 40px rgba(0,0,0,0.4)'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#C8A96A',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          <Flame size={32} />
          BBQ Planner
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>
          Select your meats and we'll calculate what you need
        </p>
        
        {/* Unit Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <button
            onClick={() => setUnit('lbs')}
            style={{
              padding: '0.5rem 1.5rem',
              background: unit === 'lbs' ? '#C8A96A' : '#1a1a1a',
              color: unit === 'lbs' ? '#000' : '#fff',
              border: `1px solid ${unit === 'lbs' ? '#C8A96A' : '#333'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            lbs
          </button>
          <button
            onClick={() => setUnit('kg')}
            style={{
              padding: '0.5rem 1.5rem',
              background: unit === 'kg' ? '#C8A96A' : '#1a1a1a',
              color: unit === 'kg' ? '#000' : '#fff',
              border: `1px solid ${unit === 'kg' ? '#C8A96A' : '#333'}`,
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            kg
          </button>
        </div>
      </div>

      {/* People Input */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.9rem',
          fontWeight: '600',
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '0.5rem'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} />
            How many people?
          </span>
          <span style={{ fontSize: '1.5rem', color: '#C8A96A' }}>{people}</span>
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={people}
          onChange={(e) => setPeople(parseInt(e.target.value))}
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '5px',
            outline: 'none',
            background: 'linear-gradient(to right, #8B0000, #C8A96A)',
            cursor: 'pointer'
          }}
        />
      </div>

      {/* Total Meat Per Person Info */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #8B0000 0%, #C8A96A 100%)',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.8)',
            marginBottom: '0.25rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Total Meat Per Person
          </p>
          <p style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#fff',
            marginBottom: '0.25rem'
          }}>
            {pricing?.totalMeatPerPerson || 1.2} {unit}
          </p>
          <p style={{
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.7)',
            fontStyle: 'italic'
          }}>
            Divided among your selected meats
          </p>
        </div>
      </div>

      {/* Product Selection */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#C8A96A',
          marginBottom: '0.75rem'
        }}>
          Select Your Meats
        </h4>
        <div style={{
          background: '#0d0d0d',
          border: '1px solid #333',
          borderRadius: '8px',
          padding: '0.75rem',
          maxHeight: '320px',
          overflowY: 'auto'
        }}>
          {(pricing.bbqProducts || []).map((product, index) => {
            const isSelected = selectedProducts[index];
            const categoryEmoji = {
              'steak': '🥩',
              'chicken': '🍗',
              'sausage': '🌭'
            }[product.category] || '🍖';

            return (
              <label
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem',
                  marginBottom: '0.5rem',
                  background: isSelected ? '#1a1a1a' : 'transparent',
                  border: `1px solid ${isSelected ? '#C8A96A' : '#222'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  ':hover': {
                    background: '#1a1a1a'
                  }
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = '#1a1a1a';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = 'transparent';
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected || false}
                  onChange={() => {
                    const newSelection = { ...selectedProducts };
                    if (newSelection[index]) {
                      delete newSelection[index];
                    } else {
                      newSelection[index] = true;
                    }
                    setSelectedProducts(newSelection);
                  }}
                  style={{
                    width: '18px',
                    height: '18px',
                    marginRight: '0.75rem',
                    cursor: 'pointer',
                    accentColor: '#C8A96A'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: isSelected ? '#fff' : 'rgba(255,255,255,0.9)'
                  }}>
                    {categoryEmoji} {product.name}
                  </div>
                  {product.description && (
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.5)',
                      marginTop: '0.25rem'
                    }}>
                      {product.description}
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
        <p style={{
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.5)',
          marginTop: '0.5rem',
          fontStyle: 'italic'
        }}>
          Click to select multiple cuts
        </p>
      </div>

      {/* Aging Selection */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: '600',
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '0.5rem'
        }}>
          Dry-Aging Level
        </label>
        <select
          value={aging}
          onChange={(e) => setAging(parseInt(e.target.value))}
          style={{
            width: '100%',
            padding: '0.85rem',
            fontSize: '1rem',
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {pricing.aging.map((option, index) => (
            <option key={index} value={index}>
              {option.label} {option.upcharge > 0 ? `(+$${option.upcharge})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Calculate Button */}
      <button
        onClick={calculate}
        style={{
          width: '100%',
          padding: '1rem',
          fontSize: '1rem',
          fontWeight: '700',
          background: '#8B0000',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '1.5rem'
        }}
        onMouseOver={(e) => e.target.style.background = '#a00000'}
        onMouseOut={(e) => e.target.style.background = '#8B0000'}
      >
        Calculate My BBQ
      </button>

      {/* Results */}
      {result && (
        <div style={{
          background: '#1a1a1a',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #333',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '700',
            color: '#C8A96A',
            marginBottom: '0.5rem',
            textAlign: 'center'
          }}>
            Your BBQ Needs
          </h3>
          <div style={{
            background: '#0d0d0d',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem' }}>
              Total Per Person ÷ Number of Meats = Amount Each
            </p>
            <p style={{ fontSize: '1.1rem', color: '#fff', fontWeight: '600' }}>
              {result.totalMeatPerPerson} {result.unit} ÷ {result.numberOfMeats} meats = {result.lbsPerMeat} {result.unit} each
            </p>
          </div>

          <div style={{
            fontSize: '0.85rem',
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #333'
          }}>
            {result.breakdown.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 0',
                color: 'rgba(255,255,255,0.85)'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#fff' }}>
                    {item.category === 'steak' && '🥩'} 
                    {item.category === 'chicken' && '🍗'} 
                    {item.category === 'sausage' && '🌭'} 
                    {' '}{item.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                    {item.people} × {item.lbsPerPerson} {item.displayUnit} = {item.lbs} {item.displayUnit} total
                  </div>
                </div>
                <div style={{ fontWeight: '700', color: '#C8A96A' }}>
                  ${item.cost}
                </div>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Subtotal ({result.totalMeat} {unit}):</span>
              <span>${result.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span>{result.agingLabel}:</span>
              <span>+${result.agingCost}</span>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #8B0000, #a00000)',
            padding: '1rem',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '1.6rem',
              fontWeight: '700',
              color: '#fff'
            }}>
              ${result.totalPrice}
            </p>
            <p style={{
              fontSize: '0.8rem',
              color: 'rgba(255,255,255,0.8)'
            }}>
              Total for {people} people
            </p>
          </div>
        </div>
      )}

      {/* Order Button */}
      {result && (
        <button
          onClick={handleOrder}
          disabled={ordering}
          style={{
            width: '100%',
            padding: '1.2rem',
            fontSize: '1.1rem',
            fontWeight: '700',
            background: '#C8A96A',
            color: '#0a0a0a',
            border: 'none',
            borderRadius: '10px',
            cursor: ordering ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            opacity: ordering ? 0.6 : 1
          }}
          onMouseOver={(e) => {
            if (!ordering) e.target.style.background = '#d4b87a';
          }}
          onMouseOut={(e) => {
            if (!ordering) e.target.style.background = '#C8A96A';
          }}
        >
          {ordering ? '🔄 Processing...' : '🔥 Order Now with Stripe'}
        </button>
      )}

      <p style={{
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'rgba(255,255,255,0.4)',
        marginTop: '1rem'
      }}>
        Secure checkout powered by Stripe
      </p>
    </div>
  );
};

export default BBQCalculator;
