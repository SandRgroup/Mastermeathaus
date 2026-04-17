import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Zap } from 'lucide-react';

const CountdownSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 32,
    seconds: 45
  });

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

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-gradient-to-br from-red-950 via-red-900 to-black py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #C8A96A 0, #C8A96A 1px, transparent 0, transparent 50%)',
          backgroundSize: '10px 10px'
        }} />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={isVisible ? { scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 mb-8"
          >
            <Zap className="w-10 h-10 text-[#C8A96A]" />
          </motion.div>

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <TrendingUp className="w-5 h-5 text-[#C8A96A]" />
            <span className="text-[#C8A96A] uppercase tracking-[0.3em] text-sm font-semibold">
              Limited Time Offer
            </span>
            <TrendingUp className="w-5 h-5 text-[#C8A96A]" />
          </motion.div>

          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-6xl font-serif text-white mb-6 leading-tight"
          >
            Save Big on <span className="italic text-[#C8A96A]">Premium Cuts</span>
          </motion.h2>

          {/* Offer Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="space-y-3 mb-12"
          >
            <div className="text-2xl md:text-3xl font-semibold text-white">
              <span className="text-[#C8A96A]">15% OFF</span> orders $299+ · 
              <span className="text-[#C8A96A]"> 10% OFF</span> orders $199+ · 
              <span className="text-[#C8A96A]"> 5% OFF</span> orders $99+
            </div>
            <div className="text-lg text-gray-300">
              Use code <span className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded font-mono text-[#C8A96A] text-xl font-bold">PREMIUM</span> at checkout
            </div>
          </motion.div>

          {/* Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center justify-center gap-4 md:gap-8 mb-12"
          >
            {/* Days */}
            <div className="text-center">
              <div className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/30 rounded-sm mb-2">
                <span className="text-3xl md:text-5xl font-serif text-white">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
              </div>
              <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">Days</div>
            </div>

            <span className="text-3xl text-white/50 font-serif">:</span>

            {/* Hours */}
            <div className="text-center">
              <div className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/30 rounded-sm mb-2">
                <span className="text-3xl md:text-5xl font-serif text-white">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
              </div>
              <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">Hours</div>
            </div>

            <span className="text-3xl text-white/50 font-serif">:</span>

            {/* Minutes */}
            <div className="text-center">
              <div className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/30 rounded-sm mb-2">
                <span className="text-3xl md:text-5xl font-serif text-white">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
              </div>
              <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">Minutes</div>
            </div>

            <span className="text-3xl text-white/50 font-serif">:</span>

            {/* Seconds */}
            <div className="text-center">
              <div className="w-20 h-20 md:w-28 md:h-28 flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/30 rounded-sm mb-2">
                <span className="text-3xl md:text-5xl font-serif text-white">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
              <div className="text-xs md:text-sm text-gray-400 uppercase tracking-wider">Seconds</div>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <a 
              href="#products"
              className="inline-flex items-center gap-3 px-12 py-5 bg-white text-red-900 font-semibold text-lg tracking-wider uppercase transition-all duration-300 hover:bg-[#C8A96A] hover:text-black hover:shadow-2xl hover:shadow-[#C8A96A]/30"
            >
              <Clock className="w-5 h-5" />
              Shop Now & Save
            </a>
          </motion.div>

          {/* Fine Print */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-8 text-sm text-gray-400"
          >
            *Offer expires soon. Cannot be combined with membership discounts. Continental US only.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default CountdownSection;
