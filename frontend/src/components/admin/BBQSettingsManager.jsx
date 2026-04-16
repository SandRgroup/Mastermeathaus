import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Settings, DollarSign, Calendar, Users, Power, Plus, Trash2 } from 'lucide-react';

const BBQSettingsManager = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [settings, setSettings] = useState({
    beefCuts: [],
    chickenCuts: [],
    sausageCuts: [],
    aging: [],
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

  const updateCut = (category, index, field, value) => {
    const newCuts = [...settings[category]];
    newCuts[index] = { ...newCuts[index], [field]: value };
    setSettings({ ...settings, [category]: newCuts });
  };

  const addCut = (category) => {
    const newCuts = [...settings[category], {
      name: "New Cut",
      pricePerLb: 10.0,
      enabled: true,
      description: ""
    }];
    setSettings({ ...settings, [category]: newCuts });
  };

  const removeCut = (category, index) => {
    const newCuts = settings[category].filter((_, i) => i !== index);
    setSettings({ ...settings, [category]: newCuts });
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

  const renderCutEditor = (category, title, emoji) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {emoji} {title}
        </h3>
        <button
          onClick={() => addCut(category)}
          className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Cut
        </button>
      </div>
      
      <div className="space-y-3">
        {settings[category]?.map((cut, index) => (
          <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              checked={cut.enabled}
              onChange={(e) => updateCut(category, index, 'enabled', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-emerald-600"
            />
            <div className="flex-1 grid grid-cols-4 gap-3">
              <input
                type="text"
                value={cut.name}
                onChange={(e) => updateCut(category, index, 'name', e.target.value)}
                placeholder="Cut name"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="number"
                step="0.5"
                value={cut.pricePerLb}
                onChange={(e) => updateCut(category, index, 'pricePerLb', parseFloat(e.target.value) || 0)}
                placeholder="Price/lb"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={cut.description || ''}
                onChange={(e) => updateCut(category, index, 'description', e.target.value)}
                placeholder="Description (optional)"
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => removeCut(category, index)}
              className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

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
              <p className="text-sm text-gray-600">Manage all meat cuts, pricing, and calculator options</p>
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

      {/* Beef Cuts */}
      {renderCutEditor('beefCuts', 'Steak Cuts', '🥩')}

      {/* Chicken Cuts */}
      {renderCutEditor('chickenCuts', 'Chicken Cuts', '🍗')}

      {/* Sausage Cuts */}
      {renderCutEditor('sausageCuts', 'Sausage Types', '🌭')}

      {/* Calculator Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-600" />
          Calculator Settings
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appetite per Person (lbs)
          </label>
          <input
            type="number"
            step="0.05"
            value={settings.appetitePerPerson}
            onChange={(e) => setSettings({ ...settings, appetitePerPerson: parseFloat(e.target.value) || 0 })}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-xs text-gray-500 mt-1">Total meat needed = People × Appetite per person</p>
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
          {settings.aging?.map((option, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={option.label}
                  onChange={(e) => updateAging(index, 'label', e.target.value)}
                  placeholder="Label"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="number"
                  value={option.days}
                  onChange={(e) => updateAging(index, 'days', parseInt(e.target.value) || 0)}
                  placeholder="Days"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="number"
                  value={option.upcharge}
                  onChange={(e) => updateAging(index, 'upcharge', parseInt(e.target.value) || 0)}
                  placeholder="Upcharge ($)"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              {settings.aging.length > 1 && (
                <button
                  onClick={() => removeAgingOption(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-md hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
};

export default BBQSettingsManager;
