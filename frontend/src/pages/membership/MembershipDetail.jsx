import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Check, Crown, Award, Users, Zap, Sparkles } from 'lucide-react';

const MembershipDetail = () => {
  const navigate = useNavigate();
  const { plan } = useParams();
  const [isVisible, setIsVisible] = useState(false);
  const featuresRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (featuresRef.current) {
      observer.observe(featuresRef.current);
    }

    return () => {
      if (featuresRef.current) {
        observer.unobserve(featuresRef.current);
      }
    };
  }, []);

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
      gradientFrom: '#4b5563',
      gradientTo: '#1f2937'
    },
    select: {
      name: 'Prime Select',
      tagline: 'Better Value',
      price: '$4.99',
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
      gradientFrom: '#d97706',
      gradientTo: '#c2410c'
    },
    prime: {
      name: 'Master Cut',
      tagline: 'Premium Savings',
      price: '$12.99',
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
      gradientFrom: '#C8A96A',
      gradientTo: '#6A1A21',
      popular: true
    },
    premium: {
      name: 'Black Label',
      tagline: 'Ultimate Experience',
      price: '$19.99',
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
      gradientFrom: '#000000',
      gradientTo: '#1a1a1a',
      highlight: true
    }
  };

  const currentPlan = membershipData[plan] || membershipData.free;
  const Icon = currentPlan.icon;

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section 
        className="relative py-24 px-6 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${currentPlan.gradientFrom} 0%, ${currentPlan.gradientTo} 100%)`
        }}
      >
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" 
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E\")"
          }}
        />

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Button 
              onClick={() => navigate('/')} 
              className="mb-12 bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-sm"
              variant="ghost"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Home
            </Button>

            <div className="flex items-center gap-6 mb-8">
              <div className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-sm">
                <Icon size={56} className="text-white" />
              </div>
              <div>
                <div className="text-sm text-white/70 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                  {currentPlan.popular && <Sparkles size={14} />}
                  {currentPlan.tagline}
                </div>
                <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight">
                  {currentPlan.name}
                </h1>
              </div>
            </div>

            {currentPlan.popular && (
              <div className="inline-flex items-center gap-2 bg-[#C8A96A] text-black px-6 py-2 rounded-sm text-sm font-bold uppercase tracking-wider mb-6">
                <Sparkles size={16} />
                Most Popular
              </div>
            )}

            <p className="text-2xl md:text-3xl text-white/90 mb-12 leading-relaxed max-w-3xl">
              {currentPlan.description}
            </p>

            <div className="flex items-baseline gap-4 mb-3">
              <div className="text-7xl md:text-8xl font-serif text-white font-bold">
                {currentPlan.price}
              </div>
              <div className="text-2xl text-white/70">{currentPlan.period}</div>
            </div>
            
            {currentPlan.yearlyPrice && (
              <div className="text-xl text-[#C8A96A]">
                {currentPlan.yearlyPrice}
              </div>
            )}
          </motion.div>
        </div>

        {/* Decorative Lines */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="bg-[#0e0e0e] py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-12 h-px bg-[#C8A96A]" />
              <span className="text-[#C8A96A] uppercase tracking-[0.3em] text-xs font-semibold">
                Membership Benefits
              </span>
              <div className="w-12 h-px bg-[#C8A96A]" />
            </div>

            <h2 className="text-4xl md:text-5xl font-serif text-white text-center mb-16">
              What's <span className="italic text-[#C8A96A]">Included</span>
            </h2>

            <div className="space-y-4 max-w-3xl mx-auto">
              {currentPlan.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isVisible ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative"
                >
                  <div className="flex items-center gap-6 p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm transition-all duration-300 hover:bg-white/10 hover:border-[#C8A96A]/50">
                    <div className="flex-shrink-0 w-10 h-10 bg-[#C8A96A]/20 border border-[#C8A96A]/40 rounded-full flex items-center justify-center transition-all duration-300 group-hover:bg-[#C8A96A]/30 group-hover:scale-110">
                      <Check size={20} className="text-[#C8A96A]" />
                    </div>
                    <div className="text-lg text-white">{feature}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <Button 
            onClick={() => navigate('/')}
            className="group relative px-14 py-7 bg-gradient-to-r from-red-900 to-red-800 text-white font-semibold text-xl tracking-wider uppercase overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/50"
            size="lg"
          >
            <span className="relative z-10">
              {plan === 'free' ? 'Start Free' : 'Choose This Plan'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-800 to-red-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </Button>
          
          <p className="mt-8 text-gray-400 text-sm">
            No commitment • Cancel anytime • Money-back guarantee
          </p>
        </div>
      </section>

      {/* Compare Plans */}
      <section className="bg-[#0e0e0e] py-20 px-6 border-t border-gray-900">
        <div className="max-w-5xl mx-auto">
          <div className="p-12 bg-gradient-to-r from-[#C8A96A]/10 to-[#6A1A21]/10 backdrop-blur-sm border border-[#C8A96A]/20 rounded-sm">
            <h3 className="text-3xl md:text-4xl font-serif text-white mb-4 text-center">
              Not sure? <span className="italic text-[#C8A96A]">Compare all plans</span>
            </h3>
            <div className="flex justify-center gap-4 mt-10 flex-wrap">
              {Object.keys(membershipData).map((key) => (
                <button
                  key={key}
                  onClick={() => navigate(`/membership/${key}`)}
                  className={`px-8 py-3 text-sm uppercase tracking-wider font-semibold transition-all duration-300 ${
                    key === plan 
                      ? 'bg-[#C8A96A] text-black pointer-events-none' 
                      : 'bg-white/5 text-white border border-white/20 hover:bg-white/10 hover:border-[#C8A96A]/50'
                  }`}
                >
                  {membershipData[key].name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-black py-20 px-6 border-t border-gray-900">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-3xl md:text-4xl font-serif text-white mb-4">
            Questions about <span className="italic text-[#C8A96A]">membership?</span>
          </h3>
          <p className="text-xl text-gray-400 mb-10">
            Our team is here to help you choose the right plan
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-8 items-center">
            <a 
              href="mailto:hello@mastersmeathaus.com" 
              className="text-[#C8A96A] hover:text-white transition-colors text-lg flex items-center gap-2"
            >
              <span>hello@mastersmeathaus.com</span>
            </a>
            <span className="hidden sm:block text-gray-700">|</span>
            <a 
              href="tel:8178072489" 
              className="text-[#C8A96A] hover:text-white transition-colors text-lg flex items-center gap-2"
            >
              <span>817-807-2489</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MembershipDetail;
