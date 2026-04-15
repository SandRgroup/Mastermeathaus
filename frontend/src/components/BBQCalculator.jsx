import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BBQCalculator = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    people: 10,
    appetite: 0.75,
    experience: 'standard',
    proteins: ['beef']
  });

  const updatePeople = (value) => {
    setData({ ...data, people: parseInt(value) });
  };

  const updateExperience = (value) => {
    setData({ ...data, experience: value });
  };

  const updateProteins = (protein, checked) => {
    if (checked) {
      setData({ ...data, proteins: [...data.proteins, protein] });
    } else {
      setData({ ...data, proteins: data.proteins.filter(p => p !== protein) });
    }
  };

  const goToStep = (stepNumber) => {
    setStep(stepNumber);
  };

  const calculateResults = () => {
    const total = data.people * data.appetite;
    let beef = 0.5, chicken = 0.3, sausage = 0.2;

    if (data.experience === 'premium') {
      beef = 0.7;
      chicken = 0.2;
      sausage = 0.1;
    }
    if (data.experience === 'casual') {
      beef = 0.4;
      chicken = 0.3;
      sausage = 0.3;
    }

    const boxes = Math.ceil(total / 5);
    const pricePerBox = 149;
    const totalPrice = boxes * pricePerBox;

    return {
      total: total.toFixed(1),
      beef: (total * beef).toFixed(1),
      chicken: (total * chicken).toFixed(1),
      sausage: (total * sausage).toFixed(1),
      boxes,
      totalPrice
    };
  };

  const handleCheckout = () => {
    navigate('/shop-boxes');
  };

  const results = step === 4 ? calculateResults() : null;

  return (
    <div style={{
      maxWidth: '520px',
      margin: 'auto',
      padding: '25px',
      borderRadius: '18px',
      background: '#0d0d0d',
      border: '1px solid #222',
      boxShadow: '0 15px 40px rgba(0,0,0,0.3)',
      fontFamily: 'Inter, sans-serif',
      color: '#fff'
    }}>
      {/* STEP 1: People Count */}
      {step === 1 && (
        <div>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            marginBottom: '1rem',
            color: '#fff',
            textAlign: 'center'
          }}>
            🔥 Build Your BBQ Box
          </h2>
          <p style={{
            fontSize: '1rem',
            marginBottom: '1rem',
            color: 'rgba(255,255,255,0.8)'
          }}>
            How many people?
          </p>
          <input
            type="range"
            min="1"
            max="100"
            value={data.people}
            onChange={(e) => updatePeople(e.target.value)}
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '5px',
              outline: 'none',
              background: 'linear-gradient(to right, #8B0000, #C8A96A)',
              cursor: 'pointer',
              marginBottom: '1rem'
            }}
          />
          <div style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            textAlign: 'center',
            color: '#C8A96A',
            marginBottom: '1.5rem'
          }}>
            {data.people}
          </div>
          <button
            onClick={() => goToStep(2)}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: '600',
              background: '#8B0000',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
            onMouseOver={(e) => e.target.style.background = '#a00000'}
            onMouseOut={(e) => e.target.style.background = '#8B0000'}
          >
            Next →
          </button>
        </div>
      )}

      {/* STEP 2: Experience Level */}
      {step === 2 && (
        <div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#fff',
            textAlign: 'center'
          }}>
            Choose your experience
          </h3>
          <select
            value={data.experience}
            onChange={(e) => updateExperience(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              cursor: 'pointer'
            }}
          >
            <option value="standard">Balanced BBQ</option>
            <option value="premium">Steak Experience</option>
            <option value="casual">Casual Cookout</option>
          </select>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => goToStep(1)}
              style={{
                flex: '1',
                padding: '1rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                background: 'transparent',
                color: '#fff',
                border: '1px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.borderColor = '#C8A96A'}
              onMouseOut={(e) => e.target.style.borderColor = '#333'}
            >
              ← Back
            </button>
            <button
              onClick={() => goToStep(3)}
              style={{
                flex: '2',
                padding: '1rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                background: '#8B0000',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
              onMouseOver={(e) => e.target.style.background = '#a00000'}
              onMouseOut={(e) => e.target.style.background = '#8B0000'}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Protein Selection */}
      {step === 3 && (
        <div>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#fff',
            textAlign: 'center'
          }}>
            Select proteins
          </h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.9)'
            }}>
              <input
                type="checkbox"
                value="beef"
                checked={data.proteins.includes('beef')}
                onChange={(e) => updateProteins('beef', e.target.checked)}
                style={{ marginRight: '0.75rem', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              🥩 Beef
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.9)'
            }}>
              <input
                type="checkbox"
                value="chicken"
                checked={data.proteins.includes('chicken')}
                onChange={(e) => updateProteins('chicken', e.target.checked)}
                style={{ marginRight: '0.75rem', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              🍗 Chicken
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.9)'
            }}>
              <input
                type="checkbox"
                value="sausage"
                checked={data.proteins.includes('sausage')}
                onChange={(e) => updateProteins('sausage', e.target.checked)}
                style={{ marginRight: '0.75rem', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              🌭 Sausage
            </label>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => goToStep(2)}
              style={{
                flex: '1',
                padding: '1rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                background: 'transparent',
                color: '#fff',
                border: '1px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.borderColor = '#C8A96A'}
              onMouseOut={(e) => e.target.style.borderColor = '#333'}
            >
              ← Back
            </button>
            <button
              onClick={() => goToStep(4)}
              disabled={data.proteins.length === 0}
              style={{
                flex: '2',
                padding: '1rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                background: data.proteins.length === 0 ? '#333' : '#8B0000',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: data.proteins.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                opacity: data.proteins.length === 0 ? 0.5 : 1
              }}
              onMouseOver={(e) => {
                if (data.proteins.length > 0) e.target.style.background = '#a00000';
              }}
              onMouseOut={(e) => {
                if (data.proteins.length > 0) e.target.style.background = '#8B0000';
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Results */}
      {step === 4 && results && (
        <div>
          <h3 style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            color: '#C8A96A',
            textAlign: 'center'
          }}>
            Your Perfect BBQ Box
          </h3>

          <div style={{
            background: '#1a1a1a',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            border: '1px solid #333'
          }}>
            <p style={{
              fontSize: '1.1rem',
              marginBottom: '1rem',
              color: '#fff',
              fontWeight: '600'
            }}>
              Total Meat: <strong style={{ color: '#C8A96A' }}>{results.total} lbs</strong>
            </p>

            <div style={{
              fontSize: '0.95rem',
              lineHeight: '1.8',
              color: 'rgba(255,255,255,0.8)'
            }}>
              🥩 Beef: <strong>{results.beef} lbs</strong><br />
              🍗 Chicken: <strong>{results.chicken} lbs</strong><br />
              🌭 Sausage: <strong>{results.sausage} lbs</strong>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #8B0000, #a00000)',
            padding: '1.5rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '1.3rem',
              fontWeight: '700',
              color: '#fff',
              marginBottom: '0.5rem'
            }}>
              Recommended: {results.boxes} {results.boxes === 1 ? 'Box' : 'Boxes'}
            </p>
            <p style={{
              fontSize: '0.9rem',
              color: 'rgba(255,255,255,0.8)'
            }}>
              ${results.totalPrice} total (${149} per box)
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => goToStep(1)}
              style={{
                flex: '1',
                padding: '1rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                background: 'transparent',
                color: '#fff',
                border: '1px solid #333',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.borderColor = '#C8A96A'}
              onMouseOut={(e) => e.target.style.borderColor = '#333'}
            >
              ← Start Over
            </button>
            <button
              onClick={handleCheckout}
              style={{
                flex: '2',
                padding: '1rem',
                fontSize: '1rem',
                fontWeight: '700',
                background: '#C8A96A',
                color: '#0a0a0a',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#d4b87a';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#C8A96A';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🔥 Get My Box
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BBQCalculator;
