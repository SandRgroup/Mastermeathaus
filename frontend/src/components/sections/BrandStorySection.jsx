import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const BrandStorySection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
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

  return (
    <section ref={sectionRef} className="relative bg-[#0e0e0e] py-32 overflow-hidden">
      {/* Decorative Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8A96A] to-transparent opacity-50" />

      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-sm">
              <img 
                src="https://images.unsplash.com/photo-1740487093184-e8d5b7859e67?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBidXRjaGVyJTIwbWVhdCUyMGN1dHRpbmclMjBhcnRpc2FufGVufDB8fHx8MTc3NjQwMzU0OXww&ixlib=rb-4.1.0&q=85" 
                alt="Master Butcher" 
                className="w-full h-[600px] object-cover"
              />
              {/* Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
            
            {/* Decorative Frame */}
            <div className="absolute -bottom-4 -right-4 w-64 h-64 border-r-2 border-b-2 border-[#C8A96A]/30 pointer-events-none" />
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isVisible ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-px bg-[#C8A96A]" />
              <span className="text-[#C8A96A] uppercase tracking-[0.3em] text-xs font-semibold">
                Our Story
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-5xl md:text-6xl font-serif text-white leading-tight">
              Mastery in <span className="italic text-[#C8A96A]">every cut</span>
            </h2>

            {/* Body Copy */}
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                At Masters Meat Haus, we believe exceptional beef begins with uncompromising standards. 
                Every steak is hand-selected by master butchers who understand the art of marbling, 
                aging, and precision cutting.
              </p>
              
              <p>
                From USDA Prime to rare Japanese A5 Wagyu, we source only from the most trusted 
                ranches and suppliers. Each cut is vacuum-sealed at peak freshness and shipped in 
                temperature-controlled packaging — ensuring steakhouse quality arrives at your door.
              </p>
              
              <p className="text-[#C8A96A] font-semibold italic">
                Premium cuts. No shortcuts. That's our promise.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-800">
              <div>
                <div className="text-4xl font-serif text-[#C8A96A] mb-2">15+</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Years Experience</div>
              </div>
              <div>
                <div className="text-4xl font-serif text-[#C8A96A] mb-2">50K+</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Happy Customers</div>
              </div>
              <div>
                <div className="text-4xl font-serif text-[#C8A96A] mb-2">100%</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Quality Guarantee</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8A96A] to-transparent opacity-50" />
    </section>
  );
};

export default BrandStorySection;
