import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    text: "Best quality I've found online. The ribeye was perfectly marbled and arrived fresh. Consistent and reliable every single time I order.",
    author: "Michael R.",
    location: "Dallas, TX",
    stars: 5,
    verified: true
  },
  {
    text: "Simple ordering, premium cuts. The dry-aged options are exceptional — you can really taste the difference. Worth every penny.",
    author: "Sarah K.",
    location: "Austin, TX",
    stars: 5,
    verified: true
  },
  {
    text: "The Wagyu tomahawk was restaurant-quality. Temperature-controlled shipping kept everything perfect. Exactly what I needed for my dinner party.",
    author: "James L.",
    location: "Houston, TX",
    stars: 5,
    verified: true
  },
  {
    text: "As a private chef, I demand the best. Masters Meat Haus delivers steakhouse-grade beef consistently. My clients notice the difference.",
    author: "Chef Maria D.",
    location: "Fort Worth, TX",
    stars: 5,
    verified: true
  },
  {
    text: "Membership is a no-brainer. The savings add up quickly and I never have to worry about quality. Customer service is top-notch too.",
    author: "David P.",
    location: "Plano, TX",
    stars: 5,
    verified: true
  },
  {
    text: "My family only eats grass-fed beef and MMH has the best selection. Always fresh, always delicious. We're customers for life.",
    author: "Jennifer M.",
    location: "Arlington, TX",
    stars: 5,
    verified: true
  }
];

const SocialProofSection = () => {
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
    <section ref={sectionRef} className="relative bg-[#0e0e0e] py-32">
      {/* Top Decorative Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8A96A] to-transparent opacity-50" />

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
              Reviews
            </span>
            <div className="w-12 h-px bg-[#C8A96A]" />
          </div>
          
          <h2 className="text-5xl md:text-6xl font-serif text-white mb-6">
            Customers <span className="italic text-[#C8A96A]">trust the quality</span>
          </h2>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-8 h-8 fill-[#C8A96A] text-[#C8A96A]" />
            ))}
          </div>
          
          <p className="text-xl text-gray-400">
            Rated 5.0 out of 5 from 2,847+ verified customers
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm transition-all duration-300 hover:bg-white/10 hover:border-[#C8A96A]/50 hover:shadow-2xl hover:shadow-[#C8A96A]/10">
                {/* Quote Icon */}
                <Quote className="absolute top-6 right-6 w-12 h-12 text-[#C8A96A]/10" />

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.stars)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#C8A96A] text-[#C8A96A]" />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-300 leading-relaxed mb-6 relative z-10">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="border-t border-gray-800 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white mb-1">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testimonial.location}
                      </div>
                    </div>
                    {testimonial.verified && (
                      <div className="flex items-center gap-1 text-xs text-[#C8A96A]">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Verified</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Decorative Corner */}
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-[#C8A96A]/0 group-hover:border-[#C8A96A]/30 transition-all duration-300" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 p-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm"
        >
          <div className="text-center">
            <div className="text-4xl font-serif text-[#C8A96A] mb-2">50K+</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Orders Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-serif text-[#C8A96A] mb-2">5.0</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-serif text-[#C8A96A] mb-2">98%</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Satisfaction Rate</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-serif text-[#C8A96A] mb-2">24hr</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Customer Support</div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Decorative Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8A96A] to-transparent opacity-50" />
    </section>
  );
};

export default SocialProofSection;
