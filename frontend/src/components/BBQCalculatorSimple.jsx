import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Flame } from 'lucide-react';
import { toast } from 'sonner';

const BBQCalculatorSimple = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [people, setPeople] = useState(10);
  const [mode, setMode] = useState('mixed');
  const [aging, setAging] = useState(0);
  const [pricing, setPricing] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/pricing`);
      setPricing(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch pricing:', error);
      toast.error('Failed to load pricing');
      setLoading(false);
    }
  };

  const calculate = () => {
    if (!pricing) return;

    const totalMeat = people * pricing.appetitePerPerson;
    const modeConfig = pricing.modes[mode];
    const ratios = modeConfig.ratios;

    const beef = (totalMeat * ratios.beef).toFixed(1);
    const chicken = (totalMeat * ratios.chicken).toFixed(1);
    const sausage = (totalMeat * ratios.sausage).toFixed(1);

    const agingOption = pricing.aging[aging];
    const pricePerLb = pricing.basePricePerLb;
    const totalPrice = (totalMeat * pricePerLb) + agingOption.upcharge;

    setResult({
      totalMeat: totalMeat.toFixed(1),
      beef,
      chicken,
      sausage,
      totalPrice: totalPrice.toFixed(2),
      agingLabel: agingOption.label,
      modeLabel: modeConfig.label
    });
  };

  const handleOrder = async () => {
    if (!result) {
      toast.error('Please calculate your order first');
      return;
    }

    setOrdering(true);
    try {
      const response = await axios.post(`${backendUrl}/api/bbq-checkout`, {
        totalPrice: parseFloat(result.totalPrice),
        people,
        mode: result.modeLabel,
        aging: result.agingLabel
      });

      // Redirect to Stripe checkout
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
        Loading calculator...
      </div>
    );
  }

  if (!pricing || !pricing.enabled) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.6)' }}>
        BBQ Calculator is currently unavailable
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '580px',
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
          AI BBQ Planner
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)' }}>
          I'll build your perfect BBQ in seconds
        </p>
      </div>

      {/* Inputs */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: '600',
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Users size={18} />
          How many people? ({people})
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

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.9rem',
          fontWeight: '600',
          color: 'rgba(255,255,255,0.8)',
          marginBottom: '0.5rem'
        }}>
          BBQ Style
        </label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
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
          {Object.entries(pricing.modes).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>
      </div>

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
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            Your Perfect BBQ Plan
          </h3>

          <div style={{
            fontSize: '0.95rem',
            lineHeight: '1.9',
            color: 'rgba(255,255,255,0.85)',
            marginBottom: '1rem'
          }}>
            🥩 Beef: <strong>{result.beef} lbs</strong><br />
            🍗 Chicken: <strong>{result.chicken} lbs</strong><br />
            🌭 Sausage: <strong>{result.sausage} lbs</strong><br />
            <div style={{ height: '1px', background: '#333', margin: '0.75rem 0' }}></div>
            📊 Total Meat: <strong style={{ color: '#C8A96A' }}>{result.totalMeat} lbs</strong><br />
            🥩 Aging: <strong>{result.agingLabel}</strong>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #8B0000, #a00000)',
            padding: '1.25rem',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#fff',
              marginBottom: '0.25rem'
            }}>
              ${result.totalPrice}
            </p>
            <p style={{
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.8)'
            }}>
              Total Price
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

export default BBQCalculatorSimple;
