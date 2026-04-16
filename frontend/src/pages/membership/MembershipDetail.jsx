import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Check, Crown, Award, Users, Zap } from 'lucide-react';

const MembershipDetail = () => {
  const navigate = useNavigate();
  const { plan } = useParams();

  const membershipData = {
    free: {
      name: 'Free Tier',
      tagline: 'Start Your Journey',
      price: 'FREE',
      period: 'Forever',
      description: 'Perfect for those just discovering premium meats.',
      features: [
        'Access to all cuts',
        'Standard pricing',
        'Email support',
        'Monthly newsletter'
      ],
      icon: Users,
      color: 'from-gray-600 to-gray-800'
    },
    select: {
      name: 'Prime Select',
      tagline: 'Better Value',
      price: '$5',
      period: 'per month',
      yearlyPrice: '$42/year (save $18)',
      description: 'Better pricing on every order for regular buyers.',
      features: [
        '10% off all orders',
        'Early access to new products',
        'Priority email support',
        'Exclusive recipes'
      ],
      icon: Award,
      color: 'from-amber-600 to-orange-700'
    },
    prime: {
      name: 'Master Cut',
      tagline: 'Premium Savings',
      price: '$13',
      period: 'per month',
      yearlyPrice: '$109/year (save $47)',
      description: 'Maximum savings for serious meat enthusiasts.',
      features: [
        '15% off all orders',
        'Priority availability',
        'Phone & email support',
        'Exclusive product access',
        'Member events'
      ],
      icon: Crown,
      color: 'from-red-700 to-red-900',
      popular: true
    },
    premium: {
      name: 'Black Label',
      tagline: 'Ultimate Experience',
      price: '$20',
      period: 'per month',
      yearlyPrice: '$168/year (save $72)',
      description: 'The pinnacle of membership with concierge service.',
      features: [
        '20% off all orders',
        'FREE delivery',
        'Best pricing guaranteed',
        'Personal account manager',
        'VIP events & tastings',
        'Custom cut requests'
      ],
      icon: Zap,
      color: 'from-black to-gray-900',
      highlight: true
    }
  };

  const currentPlan = membershipData[plan] || membershipData.free;
  const Icon = currentPlan.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <div className={`bg-gradient-to-r ${currentPlan.color} text-white py-20 px-6`}>
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={() => navigate('/')} 
            className="mb-8 bg-white/10 hover:bg-white/20 border-0 text-white"
            variant="ghost"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Home
          </Button>

          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur">
              <Icon size={48} className="text-white" />
            </div>
            <div>
              <div className="text-sm text-white/70 uppercase tracking-wider mb-1">
                {currentPlan.tagline}
              </div>
              <h1 className="text-5xl md:text-6xl font-bold">
                {currentPlan.name}
              </h1>
            </div>
          </div>

          {currentPlan.popular && (
            <div className="inline-block bg-amber-500 text-black px-4 py-1 rounded-full text-sm font-bold mb-4">
              🔥 MOST POPULAR
            </div>
          )}

          <p className="text-2xl text-white/90 mb-8">
            {currentPlan.description}
          </p>

          <div className="flex items-baseline gap-3 mb-2">
            <div className="text-6xl font-bold">{currentPlan.price}</div>
            <div className="text-xl text-white/70">{currentPlan.period}</div>
          </div>
          
          {currentPlan.yearlyPrice && (
            <div className="text-lg text-white/80">
              {currentPlan.yearlyPrice}
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            What's Included
          </h2>

          <div className="space-y-4">
            {currentPlan.features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Check size={20} className="text-white" />
                </div>
                <div className="text-lg text-gray-800">{feature}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button 
            onClick={() => navigate('/')}
            className={`bg-gradient-to-r ${currentPlan.color} hover:opacity-90 text-white px-12 py-6 text-xl rounded-full shadow-2xl`}
            size="lg"
          >
            {plan === 'free' ? 'Start Free' : 'Choose This Plan'}
          </Button>
          
          <p className="mt-6 text-gray-600">
            No commitment • Cancel anytime • Money-back guarantee
          </p>
        </div>

        {/* Compare Plans */}
        <div className="mt-16 p-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Not sure? Compare all plans
          </h3>
          <div className="flex justify-center gap-4 mt-6 flex-wrap">
            {Object.keys(membershipData).map((key) => (
              <Button
                key={key}
                onClick={() => navigate(`/membership/${key}`)}
                variant={key === plan ? "default" : "outline"}
                className={key === plan ? "pointer-events-none" : ""}
              >
                {membershipData[key].name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-4">Questions about membership?</h3>
          <p className="text-xl text-gray-400 mb-8">
            Our team is here to help you choose the right plan
          </p>
          <div className="flex justify-center gap-8">
            <a href="mailto:hello@mastersmeathaus.com" className="text-amber-500 hover:text-amber-400">
              hello@mastersmeathaus.com
            </a>
            <a href="tel:8178072489" className="text-amber-500 hover:text-amber-400">
              817-807-2489
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipDetail;
