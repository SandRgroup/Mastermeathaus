import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Settings, DollarSign, Calendar, Weight, Users, Power } from 'lucide-react';

const BBQSettingsManager = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [settings, setSettings] = useState({
    basePrice: 149,
    aging: [
      { label: "21 Days (Standard)", days: 21, upcharge: 0 },
      { label: "30 Days (Premium)", days: 30, upcharge: 25 },
      { label: "45 Days (Ultra Aged)", days: 45, upcharge: 60 }
    ],
    pricePerBoxWeight: 5,
    appetitePerPerson: 0.75,
    enabled: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/pricing`);
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch BBQ settings:', error);
      toast.error('Failed to load BBQ settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${backendUrl}/api/pricing`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('BBQ Calculator settings updated!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateAging = (index, field, value) => {
    const newAging = [...settings.aging];
    newAging[index] = { ...newAging[index], [field]: value };
    setSettings({ ...settings, aging: newAging });
  };

  const addAgingOption = () => {
    const newAging = [...settings.aging, { label: "New Aging Option", days: 0, upcharge: 0 }];
    setSettings({ ...settings, aging: newAging });
  };

  const removeAgingOption = (index) => {
    const newAging = settings.aging.filter((_, i) => i !== index);
    setSettings({ ...settings, aging: newAging });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading BBQ Calculator settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-gray-700" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">BBQ Calculator Settings</h2>
              <p className="text-sm text-gray-600">Manage pricing, aging options, and calculator configuration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <Power className={`w-5 h-5 ${settings.enabled ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span className="text-sm font-medium text-gray-700">
                {settings.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Basic Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gray-600" />
          Basic Pricing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Price per Box ($)
            </label>
            <input
              type="number"
              value={settings.basePrice}
              onChange={(e) => setSettings({ ...settings, basePrice: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="149"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Weight className="w-4 h-4" />
              Box Weight (lbs)
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.pricePerBoxWeight}
              onChange={(e) => setSettings({ ...settings, pricePerBoxWeight: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Users className="w-4 h-4" />
              Appetite per Person (lbs)
            </label>
            <input
              type="number"
              step="0.05"
              value={settings.appetitePerPerson}
              onChange={(e) => setSettings({ ...settings, appetitePerPerson: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="0.75"
            />
          </div>
        </div>
      </div>

      {/* Aging Options */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            Dry-Aging Options
          </h3>
          <button
            onClick={addAgingOption}
            className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition-colors"
          >
            + Add Option
          </button>
        </div>
        
        <div className="space-y-4">
          {settings.aging.map((option, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={option.label}
                    onChange={(e) => updateAging(index, 'label', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="21 Days (Standard)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Days
                  </label>
                  <input
                    type="number"
                    value={option.days}
                    onChange={(e) => updateAging(index, 'days', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="21"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upcharge ($)
                  </label>
                  <input
                    type="number"
                    value={option.upcharge}
                    onChange={(e) => updateAging(index, 'upcharge', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0"
                  />
                </div>
              </div>
              {settings.aging.length > 1 && (
                <button
                  onClick={() => removeAgingOption(index)}
                  className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-lg border border-emerald-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Preview Calculation</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Example: 20 people</p>
            <p className="font-semibold text-gray-800">
              Total meat: {(20 * settings.appetitePerPerson).toFixed(1)} lbs
            </p>
            <p className="font-semibold text-gray-800">
              Boxes needed: {Math.ceil((20 * settings.appetitePerPerson) / settings.pricePerBoxWeight)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Price range:</p>
            {settings.aging.map((option, index) => {
              const boxes = Math.ceil((20 * settings.appetitePerPerson) / settings.pricePerBoxWeight);
              const price = (settings.basePrice + option.upcharge) * boxes;
              return (
                <p key={index} className="font-semibold text-gray-800">
                  {option.label}: ${price}
                </p>
              );
            })}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save BBQ Settings'}
        </button>
      </div>
    </div>
  );
};

export default BBQSettingsManager;
