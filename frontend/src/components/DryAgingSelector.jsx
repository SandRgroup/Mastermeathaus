import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { DRY_AGING_TIERS } from '../utils/dryAgingTiers';
import '../styles/DryAgingSelector.css';

const DryAgingSelector = ({ product, isOpen, onClose, onSelect }) => {
  const [selectedTier, setSelectedTier] = useState(DRY_AGING_TIERS[0]);
  
  const basePrice = parseFloat(product.price.replace('$', ''));
  
  const handleConfirm = () => {
    if (selectedTier.contactOnly) {
      window.location.href = '/contact';
      return;
    }
    
    onSelect(selectedTier);
    onClose();
  };

  const getFinalPrice = (tier) => {
    if (tier.upcharge === null) return 'Contact Us';
    return `$${(basePrice + tier.upcharge).toFixed(2)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="dry-aging-modal">
        <DialogHeader>
          <DialogTitle>DRY-AGED UPGRADE TIERS</DialogTitle>
          <p className="modal-subtitle">Enhance {product.name} with our signature aging process</p>
        </DialogHeader>

        <div className="dry-aging-tiers">
          {DRY_AGING_TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`dry-aging-tier ${selectedTier.id === tier.id ? 'selected' : ''} ${tier.popular ? 'popular' : ''} ${tier.contactOnly ? 'contact-only' : ''}`}
              onClick={() => setSelectedTier(tier)}
            >
              {tier.popular && <div className="popular-badge">MOST POPULAR</div>}
              {tier.contactOnly && <div className="exclusive-badge">EXCLUSIVE</div>}
              
              <div className="tier-header">
                <div className="tier-name">{tier.name}</div>
                <div className="tier-price">
                  {tier.upcharge === null ? (
                    <span className="contact-price">Contact Us</span>
                  ) : tier.upcharge === 0 ? (
                    <span className="no-upcharge">Included</span>
                  ) : (
                    <span className="upcharge">+${tier.upcharge}</span>
                  )}
                </div>
              </div>
              
              <div className="tier-description">{tier.description}</div>
              
              {selectedTier.id === tier.id && !tier.contactOnly && (
                <div className="tier-total">
                  Final Price: <strong>{getFinalPrice(tier)}</strong>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            {selectedTier.contactOnly ? 'Contact Us' : `Add to Cart — ${getFinalPrice(selectedTier)}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DryAgingSelector;
