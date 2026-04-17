import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Mail, User, Phone, MapPin, Home } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  });
  const [originalData, setOriginalData] = useState({});

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

      const customer = response.data.customer;
      const profileData = {
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zip_code: customer.zip_code || ''
      };
      
      setFormData(profileData);
      setOriginalData(profileData);
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

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('customerToken');
      const response = await axios.put(
        `${backendUrl}/api/customer/profile`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setOriginalData(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading profile...</div>
      </div>
    );
  }

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
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link to="/">
            <img 
              src="/assets/mmh-logo.png" 
              alt="Masters Meat Haus" 
              className="h-12 opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
            />
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <Link to="/portal">
            <Button variant="ghost" className="text-gray-400 hover:text-white mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-serif text-white mb-3">
              My Profile
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your personal information
            </p>
          </div>

          {/* Profile Form */}
          <Card className="bg-white/5 border-white/10 p-8">
            <div className="space-y-6">
              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-300 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    First Name
                  </Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    placeholder="John"
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Last Name
                  </Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    placeholder="Doe"
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* Contact */}
              <div>
                <Label className="text-gray-300 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-600"
                />
              </div>

              {/* Address */}
              <div>
                <Label className="text-gray-300 mb-2 flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Street Address
                </Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="123 Main Street"
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-600"
                />
              </div>

              {/* City, State, Zip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-gray-300 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    City
                  </Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="New York"
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <Label className="text-gray-300 mb-2">State</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    placeholder="NY"
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-600"
                    maxLength={2}
                  />
                </div>
                <div>
                  <Label className="text-gray-300 mb-2">ZIP Code</Label>
                  <Input
                    value={formData.zip_code}
                    onChange={(e) => handleChange('zip_code', e.target.value)}
                    placeholder="10001"
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-600"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-6 border-t border-white/10">
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || saving}
                  className="bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white w-full md:w-auto"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                  <Save className="ml-2 w-4 h-4" />
                </Button>
                {hasChanges && (
                  <p className="text-sm text-gray-400 mt-2">
                    You have unsaved changes
                  </p>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerProfile;
