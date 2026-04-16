import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useCart } from '../contexts/CartContext';
import { Sparkles, Beef, Drumstick } from 'lucide-react';
import '../styles/BBQBuilder.css';

const PremiumBBQBuilder = () => {
  const [bbqProducts, setBbqProducts] = useState([]);
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchBBQProducts();
  }, []);

  const fetchBBQProducts = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/bbq-products`);
      const data = await response.json();
      
      // Sort products by meat type for better organization
      const sortedData = data.sort((a, b) => {
        const order = { beef: 1, lamb: 2, pork: 3, chicken: 4 };
        return (order[a.meatType] || 5) - (order[b.meatType] || 5);
      });
      
      setBbqProducts(sortedData);
      
      // Initialize selections
      const initialSelections = {};
      sortedData.forEach(product => {
        initialSelections[product.id] = {
          selected: false,
          quantity: 1,
          grade: 'prime',
          dryAged: false,
          agingDays: 21
        };
      });
      setSelections(initialSelections);
    } catch (error) {
      console.error('Error fetching BBQ products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMeat = (productId) => {
    setSelections({
      ...selections,
      [productId]: {
        ...selections[productId],
        selected: !selections[productId].selected
      }
    });
  };

  const updateSelection = (productId, field, value) => {
    setSelections({
      ...selections,
      [productId]: {
        ...selections[productId],
        [field]: value
      }
    });
  };

  const getGradeStyle = (grade) => {
    const styles = {
      prime: { 
        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        color: '#000',
        icon: '👑'
      },
      wagyu: { 
        background: 'linear-gradient(135deg, #E5E4E2 0%, #C0C0C0 100%)',
        color: '#000',
        icon: '💎'
      },
      grassfed: { 
        background: 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)',
        color: '#fff',
        icon: '🌿'
      }
    };
    return styles[grade] || styles.prime;
  };

  const calculatePrice = (product, selection) => {
    if (!selection.selected) return 0;
    
    let price = product.basePrice || 0;
    
    // Add upcharges based on grade
    if (selection.grade === 'wagyu') {
      price += (product.wagyuUpcharge || 0);
    } else if (selection.grade === 'grassfed') {
      price += (product.grassFedUpcharge || 0);
    }
    
    // Add dry aged upcharge (if applicable)
    if (selection.dryAged && product.dryAgedUpcharge > 0) {
      price += product.dryAgedUpcharge;
    }
    
    return price * (selection.quantity || 1);
  };

  const getTotalPrice = () => {
    return bbqProducts.reduce((total, product) => {
      return total + calculatePrice(product, selections[product.id] || {});
    }, 0);
  };

  const getSelectedCount = () => {
    return Object.values(selections).filter(s => s.selected).length;
  };

  const handleCheckout = async () => {
    const selectedItems = bbqProducts
      .filter(product => selections[product.id]?.selected)
      .map(product => {
        const selection = selections[product.id];
        const price = calculatePrice(product, selection);
        
        return {
          product_id: product.id,
          product_name: `${product.name} (${selection.grade.toUpperCase()}${selection.dryAged ? ', Dry Aged' : ''})`,
          price: price / selection.quantity,
          quantity: selection.quantity,
          weight: '1 lb',
          subscribe: false
        };
      });

    if (selectedItems.length === 0) {
      alert('Please select at least one meat product');
      return;
    }

    try {
      // Create Stripe checkout session
      const checkoutResponse = await fetch(`${backendUrl}/api/checkout/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart_items: selectedItems,
          origin_url: window.location.origin
        })
      });

      const checkoutData = await checkoutResponse.json();
      
      if (checkoutData.url) {
        window.location.href = checkoutData.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to create checkout session');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading BBQ Meats...</div>;
  }

  return (
    <div className="bbq-builder-container">
      <div className="bbq-builder-header">
        <div className="bbq-title-wrapper">
          <Sparkles className="bbq-sparkle-icon" />
          <h2 className="bbq-title">Premium BBQ Builder</h2>
          <Sparkles className="bbq-sparkle-icon" />
        </div>
        <p className="bbq-subtitle">Select your premium meats, choose your grade, and customize your order</p>
        <div className="bbq-grade-legend">
          <span className="grade-badge" style={getGradeStyle('prime')}>
            {getGradeStyle('prime').icon} Prime
          </span>
          <span className="grade-badge" style={getGradeStyle('wagyu')}>
            {getGradeStyle('wagyu').icon} Wagyu
          </span>
          <span className="grade-badge" style={getGradeStyle('grassfed')}>
            {getGradeStyle('grassfed').icon} Grass Fed
          </span>
        </div>
      </div>

      <div className="bbq-builder-grid">
        {bbqProducts.map((product) => {
          const selection = selections[product.id] || {};
          const itemPrice = calculatePrice(product, selection);

          return (
            <Card key={product.id} className={`bbq-product-card ${selection.selected ? 'selected' : ''}`} data-meat-type={product.meatType}>
              <div className="bbq-card-header">
                <label className="bbq-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selection.selected}
                    onChange={() => toggleMeat(product.id)}
                    className="bbq-checkbox"
                  />
                  <span className="bbq-product-name">{product.name}</span>
                </label>
                <span className="bbq-base-price">${product.basePrice}/lb</span>
              </div>
              
              {product.description && (
                <p className="bbq-product-description">{product.description}</p>
              )}

              {selection.selected && (
                <div className="bbq-options">
                  <div className="bbq-option-row">
                    <Label htmlFor={`grade-${product.id}`}>Grade</Label>
                    <Select
                      value={selection.grade}
                      onValueChange={(value) => updateSelection(product.id, 'grade', value)}
                    >
                      <SelectTrigger id={`grade-${product.id}`} className="grade-select-trigger">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="grade-select-content">
                        <SelectItem value="prime" className="grade-select-item">
                          <div className="grade-option" style={getGradeStyle('prime')}>
                            <span className="grade-icon">{getGradeStyle('prime').icon}</span>
                            <span>Prime</span>
                          </div>
                        </SelectItem>
                        {product.wagyuUpcharge > 0 && (
                          <SelectItem value="wagyu" className="grade-select-item">
                            <div className="grade-option" style={getGradeStyle('wagyu')}>
                              <span className="grade-icon">{getGradeStyle('wagyu').icon}</span>
                              <span>American Wagyu (+${product.wagyuUpcharge}/lb)</span>
                            </div>
                          </SelectItem>
                        )}
                        {product.grassFedUpcharge > 0 && (
                          <SelectItem value="grassfed" className="grade-select-item">
                            <div className="grade-option" style={getGradeStyle('grassfed')}>
                              <span className="grade-icon">{getGradeStyle('grassfed').icon}</span>
                              <span>Grass Fed (+${product.grassFedUpcharge}/lb)</span>
                            </div>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bbq-option-row">
                    <Label htmlFor={`qty-${product.id}`}>Pounds</Label>
                    <Input
                      id={`qty-${product.id}`}
                      type="number"
                      min="1"
                      max="50"
                      value={selection.quantity}
                      onChange={(e) => updateSelection(product.id, 'quantity', parseInt(e.target.value) || 1)}
                      className="bbq-qty-input"
                    />
                  </div>

                  {product.dryAgedUpcharge > 0 && (
                    <div className="bbq-option-row">
                      <label className="bbq-dry-aged-label">
                        <input
                          type="checkbox"
                          checked={selection.dryAged}
                          onChange={(e) => updateSelection(product.id, 'dryAged', e.target.checked)}
                          className="bbq-checkbox-small"
                        />
                        <span>Dry Aged (+${product.dryAgedUpcharge}/lb)</span>
                      </label>
                    </div>
                  )}

                  {selection.dryAged && product.dryAgedUpcharge > 0 && (
                    <div className="bbq-option-row">
                      <Label htmlFor={`aging-${product.id}`}>Aging Days</Label>
                      <Select
                        value={selection.agingDays.toString()}
                        onValueChange={(value) => updateSelection(product.id, 'agingDays', parseInt(value))}
                      >
                        <SelectTrigger id={`aging-${product.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="21">21 Days</SelectItem>
                          <SelectItem value="28">28 Days</SelectItem>
                          <SelectItem value="35">35 Days</SelectItem>
                          <SelectItem value="45">45 Days (Premium)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="bbq-product-info">
                    <div className="info-item">
                      <span className="info-label">Ranch:</span> {product.ranchOrigin}
                    </div>
                    <div className="info-item">
                      <span className="info-label">Grade:</span> {product.gradeLabel}
                    </div>
                    <div className="info-item">
                      <span className="info-label">Genetics:</span> {product.genetics}
                    </div>
                    <div className="info-item">
                      <span className="info-label">Grain Finished:</span> {product.grainFinished}
                    </div>
                  </div>

                  <div className="bbq-item-total">
                    Item Total: <span className="price-highlight">${itemPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="bbq-summary-card">
        <div className="bbq-summary-content">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Selected Meats:</span>
              <span className="stat-value">{getSelectedCount()}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total:</span>
              <span className="stat-value-lg">${getTotalPrice().toFixed(2)}</span>
            </div>
          </div>
          <Button 
            onClick={handleCheckout}
            disabled={getSelectedCount() === 0}
            className="bbq-checkout-btn"
          >
            Checkout with Stripe →
          </Button>
          <p className="bbq-note">Free shipping on orders over $150 • Secure payment via Stripe</p>
        </div>
      </Card>
    </div>
  );
};

export default PremiumBBQBuilder;
