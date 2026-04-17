import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import axios from 'axios';
import { Settings, Save, Eye, EyeOff, ShoppingCart, FileText } from 'lucide-react';

const UnifiedBBQBuilderSettings = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [settings, setSettings] = useState({
    enabled: true,
    mode: 'both',
    title: 'Premium BBQ Builder',
    subtitle: 'Build your perfect BBQ. Every cut, every grade.'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/bbq-builder-settings`);
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('Failed to load BBQ Builder settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(
        `${backendUrl}/api/bbq-builder-settings`,
        settings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('BBQ Builder settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading settings...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#1a1a1a',
          marginBottom: '0.5rem'
        }}>
          <Settings size={24} />
          Unified BBQ Builder Settings
        </h2>
        <p style={{ color: '#666', fontSize: '0.95rem' }}>
          Control the BBQ Builder display and functionality on your landing page
        </p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {/* Visibility Toggle */}
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                {settings.enabled ? <Eye size={20} /> : <EyeOff size={20} />}
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>
                  BBQ Builder Visibility
                </h3>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#666' }}>
                {settings.enabled 
                  ? 'The BBQ Builder is currently visible on the landing page'
                  : 'The BBQ Builder is currently hidden from the landing page'
                }
              </p>
            </div>
            <Button
              onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
              style={{
                background: settings.enabled ? '#10b981' : '#6b7280',
                color: 'white',
                padding: '0.75rem 1.5rem'
              }}
            >
              {settings.enabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </Card>

        {/* Mode Selection */}
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <Label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Builder Mode
            </Label>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
              Choose how customers interact with the BBQ Builder
            </p>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { 
                value: 'both', 
                label: 'Both Options', 
                icon: <div style={{ display: 'flex', gap: '0.25rem' }}><ShoppingCart size={16} /><FileText size={16} /></div>,
                desc: 'Customers can either checkout directly or request a custom quote' 
              },
              { 
                value: 'checkout', 
                label: 'Checkout Only', 
                icon: <ShoppingCart size={16} />,
                desc: 'Only show direct checkout option (e-commerce mode)' 
              },
              { 
                value: 'quote', 
                label: 'Quote Only', 
                icon: <FileText size={16} />,
                desc: 'Only show custom quote request (lead generation mode)' 
              }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setSettings({ ...settings, mode: option.value })}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1rem',
                  border: settings.mode === option.value ? '2px solid #8B0000' : '1px solid #e5e5e5',
                  background: settings.mode === option.value ? '#fff5f5' : 'white',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
              >
                <div style={{ 
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: settings.mode === option.value ? '#8B0000' : '#f0f0f0',
                  color: settings.mode === option.value ? 'white' : '#666',
                  borderRadius: '4px'
                }}>
                  {option.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '0.25rem'
                  }}>
                    {option.label}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666' }}>
                    {option.desc}
                  </div>
                </div>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: `2px solid ${settings.mode === option.value ? '#8B0000' : '#d1d5db'}`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {settings.mode === option.value && (
                    <div style={{
                      width: '10px',
                      height: '10px',
                      background: '#8B0000',
                      borderRadius: '50%'
                    }} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Content Customization */}
        <Card style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
            Content Customization
          </h3>
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <Label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Section Title
              </Label>
              <Input
                id="title"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                placeholder="Premium BBQ Builder"
              />
            </div>

            <div>
              <Label htmlFor="subtitle" style={{ display: 'block', marginBottom: '0.5rem' }}>
                Section Subtitle
              </Label>
              <Input
                id="subtitle"
                value={settings.subtitle}
                onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
                placeholder="Build your perfect BBQ. Every cut, every grade."
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <Button
            onClick={loadSettings}
            style={{
              background: 'white',
              color: '#666',
              border: '1px solid #e5e5e5',
              padding: '0.75rem 1.5rem'
            }}
          >
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: 'linear-gradient(135deg, #8B0000, #C8A96A)',
              color: 'white',
              padding: '0.75rem 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedBBQBuilderSettings;
