import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { ArrowLeft, Star, Check } from 'lucide-react';
import '../styles/ShopBoxes.css';

const ShopBoxes = () => {
  const navigate = useNavigate();

  const boxes = [
    {
      id: 'build-your-box',
      name: 'Build Your Steak Box',
      tagline: 'Fully customizable steak selection',
      icon: '🥩',
      description: 'Choose exactly what you want. Select your favorite cuts, quantities, and sizes to create your perfect steak box.',
      features: [
        'Choose your cuts (Ribeye, Filet, NY Strip, etc.)',
        'Select quantities and sizes',
        'Mix and match premium grades',
        'Custom packaging'
      ],
      price: 'Starting at $79',
      highlight: false,
      link: '/build-your-box'
    },
    {
      id: 'master-box',
      name: 'Master Steak Box',
      tagline: 'Curated premium everyday steak mix',
      icon: '🔪',
      description: 'Our expertly curated selection of premium everyday steaks. Perfect balance of popular cuts for the discerning home chef.',
      features: [
        '4 premium steaks included',
        'Mix of Ribeye, Strip, and Filet',
        'Restaurant-quality USDA Prime',
        'Chef-selected cuts'
      ],
      price: '$149',
      highlight: false
    },
    {
      id: 'brazilian-box',
      name: 'Brazilian Steak Box',
      tagline: 'Churrasco-style cuts for grilling',
      icon: '🔥',
      description: 'Authentic Brazilian churrasco experience at home. Traditional cuts perfect for grilling, skewers, and outdoor cooking.',
      features: [
        'Picanha (top sirloin cap)',
        'Fraldinha (bottom sirloin)',
        'Costela (beef ribs)',
        'Perfect for grilling'
      ],
      price: '$129',
      highlight: false
    },
    {
      id: 'prime-cut-box',
      name: 'Prime Cut Box',
      tagline: 'Highest-grade selection only',
      icon: '⭐',
      description: 'All premium steaks (ribeye, filet mignon, NY strip) — no filler, no lower grades. The ultimate luxury steak experience.',
      features: [
        '100% USDA Prime cuts',
        'Ribeye, Filet Mignon, NY Strip',
        'Exceptional marbling',
        'Hand-selected by master butchers',
        'Best-of-the-best guarantee'
      ],
      price: '$249',
      highlight: true
    }
  ];

  return (
    <div className="shop-boxes-page">
      <div className="shop-boxes-container">
        <Button onClick={() => navigate('/')} className="back-btn" variant="ghost">
          <ArrowLeft size={18} />
          Back to Home
        </Button>

        <div className="shop-hero">
          <h1>Shop Steak Boxes</h1>
          <p>Premium steak collections delivered to your door</p>
        </div>

        <div className="boxes-grid">
          {boxes.map((box) => (
            <Card key={box.id} className={`box-card ${box.highlight ? 'highlight' : ''}`}>
              {box.highlight && <div className="best-choice-badge">Best Choice</div>}
              <div className="box-icon">{box.icon}</div>
              <h2>{box.name}</h2>
              <p className="box-tagline">{box.tagline}</p>
              <p className="box-description">{box.description}</p>
              
              <div className="box-features">
                {box.features.map((feature, idx) => (
                  <div key={idx} className="box-feature-item">
                    <Check size={16} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="box-footer">
                <div className="box-price">{box.price}</div>
                <Button 
                  className={box.highlight ? 'shop-btn highlight' : 'shop-btn'}
                  onClick={() => box.link ? navigate(box.link) : alert('Coming soon!')}
                >
                  {box.link ? 'Build Now' : 'Shop Now'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopBoxes;