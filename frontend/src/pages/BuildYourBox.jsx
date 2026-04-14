import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import '../styles/BuildYourBox.css';

const BuildYourBox = () => {
  const navigate = useNavigate();
  const [selectedCuts, setSelectedCuts] = useState({});

  const steakOptions = [
    { id: 'ribeye', name: 'Ribeye', price: 32, image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400', description: 'Rich marbling, intense flavor' },
    { id: 'filet', name: 'Filet Mignon', price: 45, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', description: 'Buttery texture, ultra-tender' },
    { id: 'strip', name: 'NY Strip', price: 28, image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400', description: 'Perfect balance of flavor and texture' },
    { id: 'tbones', name: 'T-Bone', price: 35, image: 'https://images.unsplash.com/photo-1606851094655-eab8cbb5f0d6?w=400', description: 'Two steaks in one cut' }
  ];

  const updateQuantity = (id, change) => {
    setSelectedCuts(prev => {
      const current = prev[id] || 0;
      const newQty = Math.max(0, current + change);
      if (newQty === 0) {
        const { [id]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: newQty };
    });
  };

  const getTotal = () => {
    return Object.entries(selectedCuts).reduce((sum, [id, qty]) => {
      const steak = steakOptions.find(s => s.id === id);
      return sum + (steak ? steak.price * qty : 0);
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(selectedCuts).reduce((sum, qty) => sum + qty, 0);
  };

  const handleAddToCart = () => {
    if (getTotalItems() === 0) {
      toast.error('Please select at least one steak');
      return;
    }
    toast.success('Box added to cart!');
    setTimeout(() => navigate('/checkout'), 1500);
  };

  return (
    <div className="build-box-page">
      <div className="build-box-container">
        <Button onClick={() => navigate('/shop-boxes')} className="back-btn" variant="ghost">
          <ArrowLeft size={18} />
          Back to Boxes
        </Button>

        <div className="build-hero">
          <h1>Build Your Steak Box</h1>
          <p>Select your favorite cuts and create the perfect box</p>
        </div>

        <div className="build-grid">
          {steakOptions.map((steak) => (
            <Card key={steak.id} className="steak-option-card">
              <img src={steak.image} alt={steak.name} className="steak-image" />
              <div className="steak-info">
                <h3>{steak.name}</h3>
                <p className="steak-desc">{steak.description}</p>
                <div className="steak-price">${steak.price} each</div>
              </div>
              <div className="quantity-controls">
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => updateQuantity(steak.id, -1)}
                  disabled={!selectedCuts[steak.id]}
                >
                  <Minus size={16} />
                </Button>
                <span className="quantity">{selectedCuts[steak.id] || 0}</span>
                <Button 
                  size="icon" 
                  variant="outline" 
                  onClick={() => updateQuantity(steak.id, 1)}
                >
                  <Plus size={16} />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="build-summary">
          <Card className="summary-card">
            <h3>Your Box Summary</h3>
            <div className="summary-items">
              {Object.entries(selectedCuts).map(([id, qty]) => {
                const steak = steakOptions.find(s => s.id === id);
                return steak ? (
                  <div key={id} className="summary-item">
                    <span>{qty}x {steak.name}</span>
                    <span>${(steak.price * qty).toFixed(2)}</span>
                  </div>
                ) : null;
              })}
            </div>
            {getTotalItems() === 0 && (
              <p className="empty-message">No items selected yet</p>
            )}
            <div className="summary-total">
              <span>Total ({getTotalItems()} items)</span>
              <span className="total-price">${getTotal().toFixed(2)}</span>
            </div>
            <Button className="add-to-cart-btn" onClick={handleAddToCart}>
              <ShoppingCart size={18} />
              Add to Cart
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BuildYourBox;