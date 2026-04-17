import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Mail, Phone, Clock, MapPin, MessageCircle } from 'lucide-react';

const ContactPage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const cardsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (cardsRef.current) {
      observer.observe(cardsRef.current);
    }

    return () => {
      if (cardsRef.current) {
        observer.unobserve(cardsRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative py-24 px-6 bg-gradient-to-b from-[#1a1a1a] to-black overflow-hidden">
        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" 
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E\")"
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
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

            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-12 h-px bg-[#C8A96A]" />
                <span className="text-[#C8A96A] uppercase tracking-[0.3em] text-xs font-semibold">
                  Get In Touch
                </span>
                <div className="w-12 h-px bg-[#C8A96A]" />
              </div>

              <h1 className="text-5xl md:text-7xl font-serif text-white mb-6 leading-tight">
                Contact <span className="italic text-[#C8A96A]">Us</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
                We're here to help.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Decorative Line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C8A96A] to-transparent opacity-50" />
      </section>

      {/* Contact Cards */}
      <section ref={cardsRef} className="bg-[#0e0e0e] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Email Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="group relative"
            >
              <div className="h-full p-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm transition-all duration-300 hover:bg-white/10 hover:border-[#C8A96A]/50 hover:shadow-2xl hover:shadow-[#C8A96A]/10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#6A1A21]/20 border border-[#C8A96A]/30 mb-8 transition-all duration-300 group-hover:bg-[#6A1A21]/30 group-hover:scale-110">
                  <Mail className="w-10 h-10 text-[#C8A96A]" />
                </div>

                <h3 className="text-2xl font-serif text-white mb-6 transition-colors duration-300 group-hover:text-[#C8A96A]">
                  Email
                </h3>

                <a 
                  href="mailto:hello@mastersmeathaus.com" 
                  className="text-lg text-gray-300 hover:text-[#C8A96A] transition-colors break-all"
                >
                  hello@mastersmeathaus.com
                </a>
              </div>
            </motion.div>

            {/* Phone Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group relative"
            >
              <div className="h-full p-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm transition-all duration-300 hover:bg-white/10 hover:border-[#C8A96A]/50 hover:shadow-2xl hover:shadow-[#C8A96A]/10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#6A1A21]/20 border border-[#C8A96A]/30 mb-8 transition-all duration-300 group-hover:bg-[#6A1A21]/30 group-hover:scale-110">
                  <Phone className="w-10 h-10 text-[#C8A96A]" />
                </div>

                <h3 className="text-2xl font-serif text-white mb-6 transition-colors duration-300 group-hover:text-[#C8A96A]">
                  Phone
                </h3>

                <a 
                  href="tel:8178072489" 
                  className="text-lg text-gray-300 hover:text-[#C8A96A] transition-colors"
                >
                  817-807-2489
                </a>
              </div>
            </motion.div>

            {/* Support Hours Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group relative"
            >
              <div className="h-full p-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm transition-all duration-300 hover:bg-white/10 hover:border-[#C8A96A]/50 hover:shadow-2xl hover:shadow-[#C8A96A]/10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#6A1A21]/20 border border-[#C8A96A]/30 mb-8 transition-all duration-300 group-hover:bg-[#6A1A21]/30 group-hover:scale-110">
                  <Clock className="w-10 h-10 text-[#C8A96A]" />
                </div>

                <h3 className="text-2xl font-serif text-white mb-6 transition-colors duration-300 group-hover:text-[#C8A96A]">
                  Support Hours
                </h3>

                <div className="text-lg text-gray-300 space-y-2">
                  <p>Monday – Friday</p>
                  <p className="text-[#C8A96A]">9 AM – 5 PM (CST)</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Support Tips Section */}
      <section className="bg-black py-24 px-6 border-t border-gray-900">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="p-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-sm"
          >
            <div className="flex items-center gap-3 mb-8">
              <MessageCircle className="w-8 h-8 text-[#C8A96A]" />
              <h2 className="text-3xl font-serif text-white">
                For <span className="italic text-[#C8A96A]">Faster Support</span>
              </h2>
            </div>

            <p className="text-xl text-gray-300 mb-8">
              When contacting us, please include:
            </p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-start gap-4 text-lg text-gray-300">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#C8A96A] mt-2" />
                <span>Order number</span>
              </li>
              <li className="flex items-start gap-4 text-lg text-gray-300">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#C8A96A] mt-2" />
                <span>Photos (if applicable)</span>
              </li>
              <li className="flex items-start gap-4 text-lg text-gray-300">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#C8A96A] mt-2" />
                <span>Clear explanation of your issue</span>
              </li>
            </ul>

            <div className="p-6 bg-gradient-to-r from-[#C8A96A]/10 to-[#6A1A21]/10 border border-[#C8A96A]/20 rounded-sm text-center">
              <p className="text-lg text-gray-300">
                We typically respond within <span className="text-[#C8A96A] font-semibold">24–48 hours</span>.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Location Section */}
      <section className="bg-[#0e0e0e] py-20 px-6 border-t border-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#6A1A21]/20 border border-[#C8A96A]/30 mb-6">
            <MapPin className="w-8 h-8 text-[#C8A96A]" />
          </div>

          <h3 className="text-3xl font-serif text-white mb-4">
            Based in <span className="italic text-[#C8A96A]">Dallas-Fort Worth</span>
          </h3>

          <p className="text-xl text-gray-400">
            Proudly serving Texas and beyond with premium cuts
          </p>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
