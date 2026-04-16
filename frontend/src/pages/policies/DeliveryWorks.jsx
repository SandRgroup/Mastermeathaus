import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Package, Thermometer, Truck, MapPin, Snowflake, Clock, Shield, CheckCircle2 } from 'lucide-react';
import '../../styles/Policies.css';

const DeliveryWorks = () => {
  const navigate = useNavigate();

  const deliverySteps = [
    {
      icon: <Package size={32} className="text-amber-600" />,
      title: "Order Processing",
      time: "1-3 Days",
      description: "Your order is carefully reviewed and packed with precision",
      details: [
        "Quality check on every item",
        "Professional vacuum sealing",
        "Food safety protocols followed"
      ]
    },
    {
      icon: <Snowflake size={32} className="text-blue-500" />,
      title: "Temperature Control",
      time: "Immediate",
      description: "Packed with premium insulation and cooling elements",
      details: [
        "Industrial-grade insulated packaging",
        "Dry ice or gel packs included",
        "Safe arrival guaranteed"
      ]
    },
    {
      icon: <Truck size={32} className="text-green-600" />,
      title: "Fast Shipping",
      time: "2-5 Days",
      description: "Express delivery with real-time tracking",
      details: [
        "Trackable shipping number",
        "Most orders arrive in 48 hours",
        "Email & SMS notifications"
      ]
    },
    {
      icon: <MapPin size={32} className="text-red-600" />,
      title: "Doorstep Delivery",
      time: "On Time",
      description: "Delivered safely to your address",
      details: [
        "Signature optional",
        "Photo confirmation available",
        "Retrieve immediately for best quality"
      ]
    }
  ];

  const qualityFeatures = [
    {
      icon: <Shield size={24} />,
      title: "100% Quality Guarantee",
      desc: "Every order backed by our satisfaction promise"
    },
    {
      icon: <Thermometer size={24} />,
      title: "Temperature Monitored",
      desc: "Cold chain maintained throughout transit"
    },
    {
      icon: <Clock size={24} />,
      title: "Fast & Reliable",
      desc: "Most orders delivered within 48 hours"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <Button 
            onClick={() => navigate('/')} 
            className="mb-8 bg-white/10 hover:bg-white/20 border-0 text-white"
            variant="ghost"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Home
          </Button>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            How Delivery Works
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            From our facility to your table — premium cuts delivered fresh with care, precision, and speed.
          </p>
        </div>
      </div>

      {/* Quality Features Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {qualityFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delivery Steps */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Your Journey to Premium Meat
          </h2>
          <p className="text-gray-600 text-lg">
            Follow your order through our carefully designed delivery process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {deliverySteps.map((step, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                    {step.time}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {step.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {step.description}
                </p>

                <ul className="space-y-2">
                  {step.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="h-2 bg-gradient-to-r from-amber-500 to-red-600 group-hover:h-3 transition-all"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Storage Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl p-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-blue-100 rounded-xl">
                <Snowflake size={32} className="text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800">
                Upon Arrival: Storage Instructions
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-green-500" />
                  Do This
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <span>Refrigerate or freeze immediately upon arrival</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <span>Check packaging for any special instructions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <span>Store at 0°F (-18°C) for frozen items</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">✅</span>
                    <span>Use refrigerated items within 3-5 days</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-red-500">⚠️</span>
                  Avoid This
                </h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <span>Don't leave package outside for extended periods</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <span>Don't refreeze completely thawed meat</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <span>Don't store near strong-smelling foods</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl">❌</span>
                    <span>Don't keep in vehicle during errands</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-xl border-l-4 border-blue-500">
              <p className="text-gray-700">
                <strong className="text-blue-700">Normal Conditions:</strong> Your order may arrive fully frozen, partially thawed, or refrigerated. All conditions are safe and expected due to transit variables. The cold chain is maintained throughout delivery.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-amber-600 to-red-600 rounded-2xl shadow-2xl p-10 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help with Your Delivery?</h2>
          <p className="text-lg mb-8 text-white/90">
            Our support team is here to ensure every order meets our quality standards
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="text-4xl mb-2">📧</div>
              <div className="font-semibold mb-1">Email Us</div>
              <a href="mailto:hello@mastersmeathaus.com" className="text-sm text-white/80 hover:text-white">
                hello@mastersmeathaus.com
              </a>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="text-4xl mb-2">📱</div>
              <div className="font-semibold mb-1">Call Us</div>
              <a href="tel:8178072489" className="text-sm text-white/80 hover:text-white">
                817-807-2489
              </a>
            </div>
            
            <div className="bg-white/10 backdrop-blur rounded-xl p-6">
              <div className="text-4xl mb-2">🕒</div>
              <div className="font-semibold mb-1">Support Hours</div>
              <div className="text-sm text-white/80">
                Mon-Fri, 9AM-5PM CST
              </div>
            </div>
          </div>

          <p className="mt-8 text-sm text-white/70">
            Contact us within 24 hours of delivery for any quality concerns
          </p>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-600">
          <p>
            <strong>Note:</strong> Delivery times may vary due to weather, carrier delays, or high order volume. 
            We are not responsible for delays once the package is with the carrier.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryWorks;
