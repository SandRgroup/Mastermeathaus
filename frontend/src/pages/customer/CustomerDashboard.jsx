import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, LogOut, CreditCard, Package, Settings, Crown, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [membership, setMembership] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('customerToken');
      if (!token) {
        navigate('/customer/login');
        return;
      }

      const response = await axios.get(`${backendUrl}/api/customer/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile(response.data.customer);
      setMembership(response.data.membership);
    } catch (error) {
      console.error('Failed to load profile:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
        navigate('/customer/login');
      } else {
        toast.error('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading your portal...</div>
      </div>
    );
  }

  const membershipTierNames = ['Free', 'Select', 'Prime', 'Premium'];
  const tierColors = ['gray', 'blue', 'amber', 'red'];
  const currentTier = profile?.membership_tier || 0;
  const tierName = membershipTierNames[currentTier] || 'Free';
  const tierColor = tierColors[currentTier] || 'gray';

  return (
    <div className="min-h-screen bg-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #C8A96A 0, #C8A96A 1px, transparent 0, transparent 50%)',
          backgroundSize: '10px 10px'
        }} />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/">
            <img 
              src="/assets/mmh-logo.png" 
              alt="Masters Meat Haus" 
              className="h-12 opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
            />
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white font-semibold">{profile?.first_name} {profile?.last_name}</p>
              <p className="text-sm text-gray-400">{profile?.email}</p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Welcome Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-3">
              Welcome Back, {profile?.first_name}
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your membership, profile, and orders
            </p>
          </div>

          {/* Membership Card */}
          <Card className="bg-gradient-to-br from-[#C8A96A]/20 to-[#8B7355]/20 border-[#C8A96A]/30 p-8 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Crown className={`w-8 h-8 text-${tierColor}-500`} />
                  <h2 className="text-3xl font-serif text-white">{tierName} Member</h2>
                </div>
                <p className="text-gray-300">
                  {membership ? membership.description : 'Your current membership tier'}
                </p>
              </div>
              {currentTier > 0 && membership && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#C8A96A]">
                    ${membership.monthly_price}/mo
                  </p>
                  <p className="text-sm text-gray-400">
                    ${membership.yearly_price}/year
                  </p>
                </div>
              )}
            </div>

            {/* Membership Benefits */}
            {membership?.features && membership.features.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {membership.features.slice(0, 6).map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-[#C8A96A] rounded-full mt-2" />
                    <p className="text-gray-300 text-sm">{feature}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Upgrade CTA */}
            {currentTier < 3 && (
              <Link to="/membership/premium">
                <Button className="bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white">
                  Upgrade Membership
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            )}
          </Card>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Profile */}
            <Link to="/portal/profile">
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all p-6 cursor-pointer group">
                <User className="w-10 h-10 text-[#C8A96A] mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-[#C8A96A] transition-colors">
                  My Profile
                </h3>
                <p className="text-gray-400 text-sm">
                  Update your personal information and preferences
                </p>
              </Card>
            </Link>

            {/* Orders (Placeholder) */}
            <Card className="bg-white/5 border-white/10 p-6 opacity-50">
              <Package className="w-10 h-10 text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                My Orders
              </h3>
              <p className="text-gray-400 text-sm">
                Coming soon: View your order history
              </p>
            </Card>

            {/* Settings (Placeholder) */}
            <Card className="bg-white/5 border-white/10 p-6 opacity-50">
              <Settings className="w-10 h-10 text-gray-500 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Settings
              </h3>
              <p className="text-gray-400 text-sm">
                Coming soon: Account settings
              </p>
            </Card>
          </div>

          {/* Back to Store */}
          <div className="text-center">
            <Link to="/">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                ← Back to Store
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
