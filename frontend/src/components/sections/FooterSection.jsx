import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const FooterSection = () => {
  return (
    <footer className="relative bg-black border-t border-gray-900">
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <img 
              src="/assets/mmh-logo.png" 
              alt="Masters Meat Haus" 
              className="w-48 mb-6 opacity-90"
            />
            <p className="text-gray-400 leading-relaxed mb-6">
              Premium cuts. No shortcuts.
            </p>
            <div className="space-y-3 text-sm text-gray-500">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 text-[#C8A96A] flex-shrink-0" />
                <span>Dallas-Fort Worth, TX</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#C8A96A] flex-shrink-0" />
                <a href="tel:8178072489" className="hover:text-[#C8A96A] transition-colors">
                  817-807-2489
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#C8A96A] flex-shrink-0" />
                <a href="mailto:hello@mastersmeathaus.com" className="hover:text-[#C8A96A] transition-colors">
                  hello@mastersmeathaus.com
                </a>
              </div>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6 font-serif">Shop</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="/shop-boxes" className="hover:text-[#C8A96A] transition-colors">
                  Shop Boxes
                </a>
              </li>
              <li>
                <a href="/build-your-box" className="hover:text-[#C8A96A] transition-colors">
                  Build Your Box
                </a>
              </li>
              <li>
                <a href="/membership/select" className="hover:text-[#C8A96A] transition-colors">
                  Membership Plans
                </a>
              </li>
              <li>
                <a href="#products" className="hover:text-[#C8A96A] transition-colors">
                  All Products
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6 font-serif">Company</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="/about" className="hover:text-[#C8A96A] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/faq" className="hover:text-[#C8A96A] transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-[#C8A96A] transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/admin" className="hover:text-[#C8A96A] transition-colors">
                  Admin Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-6 font-serif">Legal</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a href="/shipping-policy" className="hover:text-[#C8A96A] transition-colors">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="/refund-policy" className="hover:text-[#C8A96A] transition-colors">
                  Refund Policy
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="hover:text-[#C8A96A] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms-of-service" className="hover:text-[#C8A96A] transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/membership-terms" className="hover:text-[#C8A96A] transition-colors">
                  Membership Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Masters Meat Haus®. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <a href="/privacy-policy" className="hover:text-[#C8A96A] transition-colors">
              Privacy
            </a>
            <span className="text-gray-700">|</span>
            <a href="/terms-of-service" className="hover:text-[#C8A96A] transition-colors">
              Terms
            </a>
            <span className="text-gray-700">|</span>
            <a href="/sitemap" className="hover:text-[#C8A96A] transition-colors">
              Sitemap
            </a>
          </div>
        </div>

        {/* Certification Badge (Optional) */}
        <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
          <div className="text-center">
            <div className="text-xs text-gray-600 uppercase tracking-wider">USDA Approved</div>
          </div>
          <span className="text-gray-800">•</span>
          <div className="text-center">
            <div className="text-xs text-gray-600 uppercase tracking-wider">Secure Payments</div>
          </div>
          <span className="text-gray-800">•</span>
          <div className="text-center">
            <div className="text-xs text-gray-600 uppercase tracking-wider">Temperature Controlled</div>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C8A96A]/0 via-[#C8A96A]/30 to-[#C8A96A]/0" />
    </footer>
  );
};

export default FooterSection;
