import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Save, Settings, RefreshCw } from 'lucide-react';
import axios from 'axios';

const SiteSettingsManager = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/site-settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${backendUrl}/api/site-settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Site settings updated! Refresh the homepage to see changes.');
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
  }

  return (
    <div className="settings-manager">
      <div className="manager-header">
        <h2 className="manager-title">
          <Settings size={24} />
          Website Content Management
        </h2>
        <div className="manager-actions">
          <Button onClick={fetchSettings} variant="outline">
            <RefreshCw size={18} />
            Reload
          </Button>
          <Button onClick={handleSave} disabled={saving} className="save-btn">
            <Save size={18} />
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      <div className="settings-grid">
        {/* Promo Banner */}
        <Card className="setting-section">
          <h3 className="section-title">📢 Promo Banner</h3>
          <div className="form-group">
            <Label>Banner Text</Label>
            <Input
              value={settings.promo_banner || ''}
              onChange={(e) => handleChange('promo_banner', e.target.value)}
              placeholder="15% off orders $299+..."
            />
            <small>Appears at the very top of the homepage (scrolling banner)</small>
          </div>
        </Card>

        {/* Hero Section */}
        <Card className="setting-section">
          <h3 className="section-title">🎯 Hero Section</h3>
          <div className="form-group">
            <Label>Headline (supports HTML)</Label>
            <Input
              value={settings.hero_headline || ''}
              onChange={(e) => handleChange('hero_headline', e.target.value)}
              placeholder='Premium cuts. <span>No shortcuts.</span>'
            />
          </div>
          <div className="form-group">
            <Label>Subheadline</Label>
            <Textarea
              value={settings.hero_subheadline || ''}
              onChange={(e) => handleChange('hero_subheadline', e.target.value)}
              placeholder="Hand-selected USDA Prime..."
              rows={3}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <Label>Primary Button Text</Label>
              <Input
                value={settings.hero_cta_primary || ''}
                onChange={(e) => handleChange('hero_cta_primary', e.target.value)}
                placeholder="Shop Now"
              />
            </div>
            <div className="form-group">
              <Label>Secondary Button Text</Label>
              <Input
                value={settings.hero_cta_secondary || ''}
                onChange={(e) => handleChange('hero_cta_secondary', e.target.value)}
                placeholder="View Plans"
              />
            </div>
          </div>
          <div className="form-group">
            <Label>Small Note Below Buttons</Label>
            <Input
              value={settings.hero_note || ''}
              onChange={(e) => handleChange('hero_note', e.target.value)}
              placeholder="Free shipping over $150 · Secure checkout via Stripe"
            />
          </div>
        </Card>

        {/* Why Section */}
        <Card className="setting-section">
          <h3 className="section-title">✨ Why Choose Us Section</h3>
          <div className="form-group">
            <Label>Section Title (supports HTML)</Label>
            <Input
              value={settings.why_title || ''}
              onChange={(e) => handleChange('why_title', e.target.value)}
              placeholder="Quality you can trust"
            />
          </div>
          <div className="form-group">
            <Label>Body Text</Label>
            <Textarea
              value={settings.why_body || ''}
              onChange={(e) => handleChange('why_body', e.target.value)}
              placeholder="We focus on sourcing and delivering..."
              rows={3}
            />
          </div>
        </Card>

        {/* Delivery Section */}
        <Card className="setting-section">
          <h3 className="section-title">🚚 Delivery Section</h3>
          <div className="form-group">
            <Label>Title (supports HTML)</Label>
            <Input
              value={settings.delivery_title || ''}
              onChange={(e) => handleChange('delivery_title', e.target.value)}
              placeholder='Delivered <span>fresh</span>'
            />
          </div>
          <div className="form-group">
            <Label>Description Text</Label>
            <Textarea
              value={settings.delivery_text || ''}
              onChange={(e) => handleChange('delivery_text', e.target.value)}
              placeholder="Every order handled with temperature-controlled logistics..."
              rows={2}
            />
          </div>
        </Card>

        {/* Final CTA */}
        <Card className="setting-section">
          <h3 className="section-title">🎬 Final Call-to-Action</h3>
          <div className="form-group">
            <Label>Main Title</Label>
            <Input
              value={settings.final_title || ''}
              onChange={(e) => handleChange('final_title', e.target.value)}
              placeholder="Better cuts start here"
            />
          </div>
          <div className="form-group">
            <Label>Small Text Below Button</Label>
            <Input
              value={settings.final_subtext || ''}
              onChange={(e) => handleChange('final_subtext', e.target.value)}
              placeholder="Premium cuts. Simple process. Secure checkout."
            />
          </div>
        </Card>

        {/* Footer */}
        <Card className="setting-section">
          <h3 className="section-title">📄 Footer Information</h3>
          <div className="form-group">
            <Label>Tagline</Label>
            <Input
              value={settings.footer_tagline || ''}
              onChange={(e) => handleChange('footer_tagline', e.target.value)}
              placeholder="Premium cuts. No shortcuts."
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <Label>Contact Email</Label>
              <Input
                type="email"
                value={settings.footer_email || ''}
                onChange={(e) => handleChange('footer_email', e.target.value)}
                placeholder="hello@mastermeatbox.com"
              />
            </div>
            <div className="form-group">
              <Label>Contact Phone</Label>
              <Input
                type="tel"
                value={settings.footer_phone || ''}
                onChange={(e) => handleChange('footer_phone', e.target.value)}
                placeholder="817-807-2489"
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="save-footer">
        <Button onClick={handleSave} disabled={saving} className="save-btn-large">
          <Save size={20} />
          {saving ? 'Saving Changes...' : 'Save All Changes'}
        </Button>
        <p className="save-note">Changes will appear on the homepage after saving and refreshing the page.</p>
      </div>

      <style jsx>{`
        .settings-manager {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .manager-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .manager-actions {
          display: flex;
          gap: 1rem;
        }

        .save-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #8B0000;
          color: white;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .setting-section {
          padding: 1.5rem;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e5e5e5;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .form-group small {
          display: block;
          margin-top: 0.35rem;
          color: #666;
          font-size: 0.8rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .save-footer {
          text-align: center;
          padding: 2rem;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .save-btn-large {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: #8B0000;
          color: white;
          padding: 1rem 2.5rem;
          font-size: 1.05rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .save-note {
          color: #666;
          font-size: 0.9rem;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .settings-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SiteSettingsManager;
