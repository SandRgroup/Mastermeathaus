import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Thermometer, Award, Truck, Star, Clock } from 'lucide-react';

const features = [
  {
    icon: Award,
    title: 'USDA Prime & Wagyu',
    description: 'Top 2% of beef in America. Hand-selected for exceptional marbling and tenderness.'
  },
  {
    icon: Shield,
    title: '100% Quality Guarantee',
    description: 'Every cut meets our master butcher standards or your money back. No questions asked.'
  },
  {
    icon: Thermometer,
    title: 'Temperature Controlled',
    description: 'Vacuum-sealed and shipped in insulated packaging with gel packs. Arrives fresh and safe.'
  },
  {
    icon: Truck,
    title: 'Free Shipping Over $150',
    description: 'Fast, reliable delivery across the continental US. Track your order in real-time.'
  },
  {
    icon: Clock,
    title: 'Expert Dry-Aging',
    description: 'Premium dry-aged options up to 45 days. Enhanced flavor and tenderness in every bite.'
  },
  {
    icon: Star,
    title: 'Trusted by Chefs',
    description: 'Restaurants and private chefs choose us for consistency, quality, and reliability.'
  }
];

const FeaturesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
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
    <section ref={sectionRef} className="relative bg-black py-32">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-[#C8A96A]" />
            <span className="text-[#C8A96A] uppercase tracking-[0.3em] text-xs font-semibold">
              Why Choose Us
            </span>
            <div className="w-12 h-px bg-[#C8A96A]" />
          </div>
          
          <h2 className="text-5xl md:text-6xl font-serif text-white mb-6">
            Quality you can <span className="italic text-[#C8A96A]">trust</span>
          </h2>
          
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            We focus on sourcing and delivering premium cuts without overcomplicating the process. 
            No unnecessary options — just high-quality meat done right.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative"
              >
                {/* Card */}
                <div className="relative h-full p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm transition-all duration-300 hover:bg-white/10 hover:border-[#C8A96A]/50 hover:shadow-2xl hover:shadow-[#C8A96A]/10">
                  {/* Icon */}
                  <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C8A96A]/10 border border-[#C8A96A]/30 transition-all duration-300 group-hover:bg-[#C8A96A]/20 group-hover:scale-110">
                    <Icon className="w-8 h-8 text-[#C8A96A]" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-serif text-white mb-4 transition-colors duration-300 group-hover:text-[#C8A96A]">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative Corner */}
                  <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[#C8A96A]/0 group-hover:border-[#C8A96A]/30 transition-all duration-300" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <a 
            href="#products"
            className="inline-block px-12 py-5 border-2 border-[#C8A96A] text-[#C8A96A] font-semibold text-lg tracking-wider uppercase transition-all duration-300 hover:bg-[#C8A96A] hover:text-black"
          >
            Explore Our Cuts
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
