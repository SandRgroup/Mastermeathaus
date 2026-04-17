import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('mmh_remember_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      localStorage.setItem('mmh_remember_email', email);
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23C8A96A\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative'
    }}>
      {/* Back to Site Link */}
      <Link 
        to="/"
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#A89F8F',
          textDecoration: 'none',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          transition: 'color 0.3s',
          fontWeight: '500'
        }}
        onMouseEnter={(e) => e.target.style.color = '#C8A96A'}
        onMouseLeave={(e) => e.target.style.color = '#A89F8F'}
      >
        <ArrowLeft size={16} />
        <span>Back to Site</span>
      </Link>

      {/* Login Card */}
      <div style={{
        width: '100%',
        maxWidth: '540px',
        background: 'rgba(10, 10, 10, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(200, 169, 106, 0.15)',
        padding: '4rem 3rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        position: 'relative'
      }}>
        {/* Decorative Top Border */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #C8A96A 50%, transparent)'
        }} />

        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              width: '40px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #C8A96A)'
            }} />
            <div style={{
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              letterSpacing: '0.3em',
              color: '#C8A96A',
              fontWeight: '500'
            }}>
              STAFF · CRM
            </div>
            <div style={{
              width: '40px',
              height: '1px',
              background: 'linear-gradient(90deg, #C8A96A, transparent)'
            }} />
          </div>

          <h1 style={{
            fontFamily: 'Georgia, serif',
            fontSize: '2.5rem',
            fontWeight: '300',
            color: '#F5F1E8',
            marginBottom: '1rem',
            lineHeight: '1.2',
            letterSpacing: '0.02em'
          }}>
            Sign in to the Haus
          </h1>

          <p style={{
            color: '#A89F8F',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            Internal access only. Manage content, reservations, and customer communication.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ marginTop: '2.5rem' }}>
          {/* Email Field */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              <Mail size={16} style={{ color: '#A89F8F' }} />
              <label style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.24em',
                color: '#A89F8F',
                fontWeight: '500'
              }}>
                Email
              </label>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@mastersmeathaus.com"
              required
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.3)',
                border: 'none',
                borderBottom: '1px solid rgba(200, 169, 106, 0.2)',
                padding: '1rem 0',
                color: '#F5F1E8',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.3s',
                fontFamily: 'Georgia, serif',
                letterSpacing: '0.02em'
              }}
              onFocus={(e) => e.target.style.borderBottomColor = 'rgba(200, 169, 106, 0.6)'}
              onBlur={(e) => e.target.style.borderBottomColor = 'rgba(200, 169, 106, 0.2)'}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              <Lock size={16} style={{ color: '#A89F8F' }} />
              <label style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.24em',
                color: '#A89F8F',
                fontWeight: '500'
              }}>
                Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                background: 'rgba(0, 0, 0, 0.3)',
                border: 'none',
                borderBottom: '1px solid rgba(200, 169, 106, 0.2)',
                padding: '1rem 0',
                color: '#F5F1E8',
                fontSize: '1.25rem',
                outline: 'none',
                transition: 'border-color 0.3s',
                letterSpacing: '0.2em'
              }}
              onFocus={(e) => e.target.style.borderBottomColor = 'rgba(200, 169, 106, 0.6)'}
              onBlur={(e) => e.target.style.borderBottomColor = 'rgba(200, 169, 106, 0.2)'}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #8B0000 0%, #A02020 100%)',
              border: 'none',
              padding: '1.25rem',
              color: '#F5F1E8',
              fontSize: '0.85rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              opacity: loading ? 0.6 : 1,
              boxShadow: '0 4px 14px 0 rgba(139, 0, 0, 0.4)'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px 0 rgba(139, 0, 0, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 14px 0 rgba(139, 0, 0, 0.4)';
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(200, 169, 106, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.24em',
            color: '#6B6456',
            fontWeight: '500'
          }}>
            Masters Meat Haus · CRM V1
          </p>
        </div>

        {/* Decorative Bottom Border */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, #C8A96A 50%, transparent)'
        }} />
      </div>
    </div>
  );
};

export default Login;
