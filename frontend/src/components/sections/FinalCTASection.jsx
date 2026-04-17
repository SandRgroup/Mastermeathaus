import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Truck, Star } from 'lucide-react';

const FinalCTASection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleScrollToProducts = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      ref={sectionRef} 
      className="relative py-32 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0e0e0e 0%, #1a1a1a 50%, #0e0e0e 100%)'
      }}
    >
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1625604086816-4bfaf603e842?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTJ8MHwxfHNlYXJjaHwyfHxwcmVtaXVtJTIwcmliZXllJTIwc3RlYWslMjBkYXJrJTIwbW9vZHl8ZW58MHx8fHwxNzc2NDAzNTQ5fDA&ixlib=rb-4.1.0&q=85)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80" />

      {/* Decorative Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8A96A] to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8A96A] to-transparent" />

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="w-16 h-px bg-[#C8A96A]" />
            <span className="text-[#C8A96A] uppercase tracking-[0.3em] text-xs font-semibold">
              Ready to Elevate Your Meals?
            </span>
            <div className="w-16 h-px bg-[#C8A96A]" />
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight"
          >
            Better cuts <span className="italic text-[#C8A96A]">start here</span>
          </motion.h2>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Join 50,000+ customers who trust Masters Meat Haus for steakhouse-quality beef 
            delivered straight to their door.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-16"
          >
            <button 
              onClick={handleScrollToProducts}
              className="group inline-flex items-center gap-4 px-14 py-6 bg-gradient-to-r from-red-900 to-red-800 text-white font-semibold text-xl tracking-wider uppercase transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/50 hover:scale-105"
            >
              Shop Masters Meat Haus
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col md:flex-row items-center justify-center gap-8 text-gray-400"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#C8A96A]" />
              <span className="text-sm">Secure Stripe Checkout</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-gray-700" />
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-[#C8A96A]" />
              <span className="text-sm">Free Shipping Over $150</span>
            </div>
            <div className="hidden md:block w-px h-6 bg-gray-700" />
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-[#C8A96A]" />
              <span className="text-sm">5.0 from 2,800+ Reviews</span>
            </div>
          </motion.div>

          {/* Secondary Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-10 text-base text-gray-500"
          >
            Premium cuts. Simple process. Exceptional quality.
          </motion.p>
        </motion.div>
      </div>

      {/* Decorative Corners */}
      <div className="absolute top-8 left-8 w-32 h-32 border-t-2 border-l-2 border-[#C8A96A]/20 pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-32 h-32 border-b-2 border-r-2 border-[#C8A96A]/20 pointer-events-none" />
    </section>
  );
};

export default FinalCTASection;
