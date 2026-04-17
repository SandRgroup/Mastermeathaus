import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, LogIn } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import axios from 'axios';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${backendUrl}/api/customer/login`, loginData);
      localStorage.setItem('customerToken', response.data.token);
      localStorage.setItem('customerData', JSON.stringify(response.data.customer));
      toast.success('Welcome back!');
      navigate('/portal');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (registerData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${backendUrl}/api/customer/register`, {
        email: registerData.email,
        password: registerData.password,
        first_name: registerData.first_name,
        last_name: registerData.last_name
      });
      
      localStorage.setItem('customerToken', response.data.token);
      localStorage.setItem('customerData', JSON.stringify(response.data.customer));
      toast.success('Account created successfully!');
      navigate('/portal');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6 py-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #C8A96A 0, #C8A96A 1px, transparent 0, transparent 50%)',
          backgroundSize: '10px 10px'
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/">
            <img 
              src="/assets/mmh-logo.png" 
              alt="Masters Meat Haus" 
              className="h-16 mx-auto mb-6 opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
            />
          </Link>
          <h1 className="text-4xl font-serif text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h1>
          <p className="text-gray-400">
            {isLogin ? 'Access your membership portal' : 'Create your account'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-sm p-8">
          {/* Toggle */}
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition-all ${
                isLogin 
                  ? 'bg-[#C8A96A] text-black' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-sm font-semibold uppercase tracking-wider transition-all ${
                !isLogin 
                  ? 'bg-[#C8A96A] text-black' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              Register
            </button>
          </div>

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    type="email"
                    required
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    placeholder="your@email.com"
                    className="pl-11 bg-white/5 border-white/20 text-white placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                    placeholder="••••••••"
                    className="pl-11 bg-white/5 border-white/20 text-white placeholder:text-gray-600"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white py-6 text-lg font-semibold uppercase tracking-wider"
              >
                {loading ? 'Logging in...' : 'Login'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">First Name</label>
                  <Input
                    type="text"
                    required
                    value={registerData.first_name}
                    onChange={(e) => setRegisterData({...registerData, first_name: e.target.value})}
                    placeholder="John"
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">Last Name</label>
                  <Input
                    type="text"
                    required
                    value={registerData.last_name}
                    onChange={(e) => setRegisterData({...registerData, last_name: e.target.value})}
                    placeholder="Doe"
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    placeholder="your@email.com"
                    className="pl-11 bg-white/5 border-white/20 text-white placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    type="password"
                    required
                    value={registerData.password}
                    onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    placeholder="••••••••"
                    className="pl-11 bg-white/5 border-white/20 text-white placeholder:text-gray-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <Input
                    type="password"
                    required
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    className="pl-11 bg-white/5 border-white/20 text-white placeholder:text-gray-600"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 text-white py-6 text-lg font-semibold uppercase tracking-wider"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <Link 
              to="/" 
              className="text-sm text-gray-400 hover:text-[#C8A96A] transition-colors flex items-center justify-center gap-2"
            >
              ← Back to Homepage
            </Link>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Premium cuts. Simple access. Secure portal.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CustomerLogin;
