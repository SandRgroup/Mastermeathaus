import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import axios from 'axios';
import { Settings, Save, Eye, EyeOff, ShoppingCart, FileText, Plus, X, Trash2 } from 'lucide-react';

const UnifiedBBQBuilderSettings = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [settings, setSettings] = useState({
    enabled: true,
    mode: 'both',
    title: 'Premium BBQ Builder',
    subtitle: 'Build your perfect BBQ. Every cut, every grade.',
    examplePrompts: [
      '20 people luxury tomahawk dinner',
      '15 people family BBQ',
      '10 people mixed grill party',
      '8 people premium steak night'
    ],
    beefGrades: [
      { id: 'standard', label: 'Standard', tag: 'Base Price', modifier: 0 },
      { id: 'prime', label: 'Prime', tag: '+$8/lb', modifier: 8 },
      { id: 'grass_fed', label: 'Grass Fed', tag: '+$4/lb', modifier: 4 },
      { id: 'wagyu', label: 'Wagyu', tag: '+$15/lb', modifier: 15 }
    ],
    dryAgingOptions: [
      { days: 0, label: 'Fresh', price: 0 },
      { days: 21, label: '21 Days', price: 6 },
      { days: 35, label: '35 Days', price: 10 },
      { days: 45, label: '45 Days', price: 15 }
    ]
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPrompt, setNewPrompt] = useState('');
  const [newGrade, setNewGrade] = useState({ id: '', label: '', tag: '', modifier: 0 });
  const [newAging, setNewAging] = useState({ days: 0, label: '', price: 0 });

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

        {/* Example Prompts Editor */}
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <Label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Example Prompts
            </Label>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
              Manage the example prompts shown to customers
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            {(settings.examplePrompts || []).map((prompt, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <Input
                  value={prompt}
                  onChange={(e) => {
                    const newPrompts = [...settings.examplePrompts];
                    newPrompts[index] = e.target.value;
                    setSettings({ ...settings, examplePrompts: newPrompts });
                  }}
                  style={{ flex: 1 }}
                />
                <Button
                  onClick={() => {
                    const newPrompts = settings.examplePrompts.filter((_, i) => i !== index);
                    setSettings({ ...settings, examplePrompts: newPrompts });
                  }}
                  style={{ background: '#ef4444', color: 'white', padding: '0.5rem' }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Input
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              placeholder="Add new example prompt..."
              style={{ flex: 1 }}
            />
            <Button
              onClick={() => {
                if (newPrompt.trim()) {
                  setSettings({ 
                    ...settings, 
                    examplePrompts: [...(settings.examplePrompts || []), newPrompt] 
                  });
                  setNewPrompt('');
                }
              }}
              style={{ background: '#10b981', color: 'white' }}
            >
              <Plus size={16} />
            </Button>
          </div>
        </Card>

        {/* Beef Grades Editor */}
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <Label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Beef Grade Options
            </Label>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
              Configure available beef grades and price modifiers
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {(settings.beefGrades || []).map((grade, index) => (
              <div key={index} style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr auto auto', 
                gap: '0.5rem', 
                alignItems: 'end',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '0.375rem'
              }}>
                <div>
                  <Label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>ID</Label>
                  <Input
                    value={grade.id}
                    onChange={(e) => {
                      const newGrades = [...settings.beefGrades];
                      newGrades[index] = { ...grade, id: e.target.value };
                      setSettings({ ...settings, beefGrades: newGrades });
                    }}
                    placeholder="standard"
                  />
                </div>
                <div>
                  <Label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Label</Label>
                  <Input
                    value={grade.label}
                    onChange={(e) => {
                      const newGrades = [...settings.beefGrades];
                      newGrades[index] = { ...grade, label: e.target.value };
                      setSettings({ ...settings, beefGrades: newGrades });
                    }}
                    placeholder="Standard"
                  />
                </div>
                <div>
                  <Label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Tag</Label>
                  <Input
                    value={grade.tag}
                    onChange={(e) => {
                      const newGrades = [...settings.beefGrades];
                      newGrades[index] = { ...grade, tag: e.target.value };
                      setSettings({ ...settings, beefGrades: newGrades });
                    }}
                    placeholder="+$8/lb"
                  />
                </div>
                <div>
                  <Label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>$/lb</Label>
                  <Input
                    type="number"
                    value={grade.modifier}
                    onChange={(e) => {
                      const newGrades = [...settings.beefGrades];
                      newGrades[index] = { ...grade, modifier: parseFloat(e.target.value) || 0 };
                      setSettings({ ...settings, beefGrades: newGrades });
                    }}
                    style={{ width: '80px' }}
                  />
                </div>
                <Button
                  onClick={() => {
                    const newGrades = settings.beefGrades.filter((_, i) => i !== index);
                    setSettings({ ...settings, beefGrades: newGrades });
                  }}
                  style={{ background: '#ef4444', color: 'white', padding: '0.5rem' }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr auto auto', 
            gap: '0.5rem', 
            alignItems: 'end' 
          }}>
            <Input
              value={newGrade.id}
              onChange={(e) => setNewGrade({ ...newGrade, id: e.target.value })}
              placeholder="premium"
            />
            <Input
              value={newGrade.label}
              onChange={(e) => setNewGrade({ ...newGrade, label: e.target.value })}
              placeholder="Premium"
            />
            <Input
              value={newGrade.tag}
              onChange={(e) => setNewGrade({ ...newGrade, tag: e.target.value })}
              placeholder="+$20/lb"
            />
            <Input
              type="number"
              value={newGrade.modifier}
              onChange={(e) => setNewGrade({ ...newGrade, modifier: parseFloat(e.target.value) || 0 })}
              placeholder="20"
              style={{ width: '80px' }}
            />
            <Button
              onClick={() => {
                if (newGrade.id && newGrade.label) {
                  setSettings({ 
                    ...settings, 
                    beefGrades: [...(settings.beefGrades || []), newGrade] 
                  });
                  setNewGrade({ id: '', label: '', tag: '', modifier: 0 });
                }
              }}
              style={{ background: '#10b981', color: 'white' }}
            >
              <Plus size={16} />
            </Button>
          </div>
        </Card>

        {/* Dry-Aging Options Editor */}
        <Card style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <Label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Dry-Aging Options
            </Label>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
              Configure available dry-aging periods and pricing
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {(settings.dryAgingOptions || []).map((option, index) => (
              <div key={index} style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr auto auto', 
                gap: '0.5rem', 
                alignItems: 'end',
                padding: '1rem',
                background: '#f9fafb',
                borderRadius: '0.375rem'
              }}>
                <div>
                  <Label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Days</Label>
                  <Input
                    type="number"
                    value={option.days}
                    onChange={(e) => {
                      const newOptions = [...settings.dryAgingOptions];
                      newOptions[index] = { ...option, days: parseInt(e.target.value) || 0 };
                      setSettings({ ...settings, dryAgingOptions: newOptions });
                    }}
                  />
                </div>
                <div>
                  <Label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Label</Label>
                  <Input
                    value={option.label}
                    onChange={(e) => {
                      const newOptions = [...settings.dryAgingOptions];
                      newOptions[index] = { ...option, label: e.target.value };
                      setSettings({ ...settings, dryAgingOptions: newOptions });
                    }}
                    placeholder="21 Days"
                  />
                </div>
                <div>
                  <Label style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>Price ($/lb)</Label>
                  <Input
                    type="number"
                    value={option.price}
                    onChange={(e) => {
                      const newOptions = [...settings.dryAgingOptions];
                      newOptions[index] = { ...option, price: parseFloat(e.target.value) || 0 };
                      setSettings({ ...settings, dryAgingOptions: newOptions });
                    }}
                    style={{ width: '100px' }}
                  />
                </div>
                <Button
                  onClick={() => {
                    const newOptions = settings.dryAgingOptions.filter((_, i) => i !== index);
                    setSettings({ ...settings, dryAgingOptions: newOptions });
                  }}
                  style={{ background: '#ef4444', color: 'white', padding: '0.5rem' }}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr auto auto', 
            gap: '0.5rem', 
            alignItems: 'end' 
          }}>
            <Input
              type="number"
              value={newAging.days}
              onChange={(e) => setNewAging({ ...newAging, days: parseInt(e.target.value) || 0 })}
              placeholder="60"
            />
            <Input
              value={newAging.label}
              onChange={(e) => setNewAging({ ...newAging, label: e.target.value })}
              placeholder="60 Days"
            />
            <Input
              type="number"
              value={newAging.price}
              onChange={(e) => setNewAging({ ...newAging, price: parseFloat(e.target.value) || 0 })}
              placeholder="20"
              style={{ width: '100px' }}
            />
            <Button
              onClick={() => {
                if (newAging.label) {
                  setSettings({ 
                    ...settings, 
                    dryAgingOptions: [...(settings.dryAgingOptions || []), newAging] 
                  });
                  setNewAging({ days: 0, label: '', price: 0 });
                }
              }}
              style={{ background: '#10b981', color: 'white' }}
            >
              <Plus size={16} />
            </Button>
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
