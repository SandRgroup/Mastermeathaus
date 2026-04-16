import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import '../../styles/Admin.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('mmh_remember_email', email);
      } else {
        localStorage.removeItem('mmh_remember_email');
      }
      
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.detail || 'Login failed';
      
      if (errorMsg.includes('Invalid')) {
        toast.error('Invalid email or password. Please try again.');
      } else {
        toast.error(typeof errorMsg === 'string' ? errorMsg : 'An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email on mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('mmh_remember_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="login-page">
      <Card className="login-card">
        <div className="login-header">
          <div className="login-brand">
            <img 
              src="/assets/logo-full.jpg" 
              alt="Masters Meat Haus" 
              style={{maxWidth: '300px', width: '100%', height: 'auto', marginBottom: '1rem'}}
            />
          </div>
          <h2 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>CMS Admin Login</h2>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Secure access to content management</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Field */}
          <div className="form-group">
            <Label htmlFor="email">Email Address</Label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#999'
                }} 
              />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mastersmeathaus.com"
                style={{ paddingLeft: '40px' }}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <Label htmlFor="password">Password</Label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  color: '#999'
                }} 
              />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#999" />
                ) : (
                  <Eye size={18} color="#999" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '1.5rem'
          }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                cursor: 'pointer',
                accentColor: '#8B0000'
              }}
            />
            <label 
              htmlFor="remember" 
              style={{ 
                fontSize: '0.9rem', 
                color: '#666',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              Remember me
            </label>
          </div>

          {/* Login Button */}
          <Button 
            type="submit" 
            className="login-btn" 
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#999' : '#8B0000',
              padding: '12px',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span className="spinner" style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #fff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite'
                }}></span>
                Logging in...
              </span>
            ) : (
              'Login to CMS'
            )}
          </Button>
        </form>

        {/* Footer Info */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid #eee',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.8rem', color: '#999' }}>
            Secure admin access for Masters Meat Haus
          </p>
          <p style={{ fontSize: '0.75rem', color: '#ccc', marginTop: '0.5rem' }}>
            Need help? Contact: hello@mastersmeathaus.com
          </p>
        </div>
      </Card>

      {/* Add spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .login-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .brand-logo-top {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .brand-mmb {
          font-size: 1.8rem;
          font-weight: 700;
          color: #8B0000;
        }
        
        .brand-bar {
          width: 2px;
          height: 1.8rem;
          background: linear-gradient(180deg, #8B0000 0%, #C8A96A 100%);
        }
        
        .brand-kanji {
          font-size: 1.8rem;
          font-weight: 400;
          color: #C8A96A;
        }
      `}</style>
    </div>
  );
};

export default Login;
