import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MembershipUpgrade = () => {
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [upgrading, setUpgrading] = useState(false);

  const tiers = [
    {
      level: 1,
      name: 'Select',
      price: 4.99,
      color: 'blue',
      features: [
        '5% off all products',
        'Free local delivery (5 miles)',
        'Priority customer support',
        'Early access to new products'
      ]
    },
    {
      level: 2,
      name: 'Prime',
      price: 12.99,
      color: 'amber',
      popular: true,
      features: [
        '15% off all products',
        '10% off Select Steaks & A5 Wagyu',
        'Free local delivery (10 miles)',
        'Custom dry aging up to 45 days',
        'VIP cut eligible ($150+ orders)',
        'Birthday bonus',
        'Priority delivery'
      ]
    },
    {
      level: 3,
      name: 'Premium',
      price: 19.99,
      color: 'red',
      features: [
        '30% off all products',
        '20% off Select Steaks & A5 Wagyu',
        'Free local delivery (15 miles)',
        'Custom dry aging up to 60 days',
        'VIP cut eligible ($150+ orders)',
        'Birthday bonus',
        'Concierge access',
        'Early access to limited releases'
      ]
    }
  ];

  const handleUpgrade = async (tierLevel) => {
    setUpgrading(true);
    try {
      const token = localStorage.getItem('customerToken');
      
      // Create/upgrade subscription
      const response = await axios.post(
        `${backendUrl}/api/stripe/create-subscription`,
        { tier_level: tierLevel },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { client_secret, subscription_id } = response.data;
      
      toast.success('Subscription created! Redirecting to payment...');
      
      // TODO: Integrate Stripe Payment Element here
      // For now, just show success
      setTimeout(() => {
        navigate('/portal');
      }, 2000);
      
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upgrade membership');
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #C8A96A 0, #C8A96A 1px, transparent 0, transparent 50%)',
          backgroundSize: '10px 10px'
        }} />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <img 
            src="/assets/mmh-logo.png" 
            alt="Masters Meat Haus" 
            className="h-12 opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => navigate('/')}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-serif text-white mb-4">
              Upgrade Your Membership
            </h1>
            <p className="text-xl text-gray-400">
              Unlock exclusive benefits and premium discounts
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <Card
                key={tier.level}
                className={`
                  relative p-8 bg-gradient-to-br 
                  ${tier.popular 
                    ? 'from-amber-900/30 to-amber-800/20 border-amber-500/50 scale-105' 
                    : 'from-white/5 to-white/10 border-white/10'
                  }
                  hover:scale-105 transition-all duration-300
                `}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-500 text-white px-6 py-1 rounded-full text-sm font-semibold">
                    MOST POPULAR
                  </div>
                )}

                <div className="text-center mb-6">
                  <Crown className={`w-12 h-12 text-${tier.color}-500 mx-auto mb-4`} />
                  <h3 className="text-3xl font-serif text-white mb-2">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">${tier.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">or ${(tier.price * 10).toFixed(2)}/year (save 2 months)</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#C8A96A] flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Upgrade Button */}
                <Button
                  onClick={() => handleUpgrade(tier.level)}
                  disabled={upgrading}
                  className={`
                    w-full 
                    ${tier.popular 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400' 
                      : 'bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700'
                    }
                    text-white font-semibold
                  `}
                >
                  {upgrading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Upgrade to ${tier.name}`
                  )}
                </Button>
              </Card>
            ))}
          </div>

          {/* Back to Portal */}
          <div className="text-center mt-12">
            <Button 
              variant="ghost" 
              className="text-gray-400 hover:text-white"
              onClick={() => navigate('/portal')}
            >
              ← Back to Portal
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MembershipUpgrade;
