import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Settings, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const BBQSettingsManager = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [settings, setSettings] = useState({
    totalMeatPerPerson: 1.2,
    totalMeatLabel: "Total Meat Per Person",
    steakPerPerson: 0.7,
    chickenPerPerson: 0.5,
    sausagePerPerson: 0.4,
    aging: [],
    bbqProducts: [],
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
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      toast.success('BBQ settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addProduct = () => {
    const newProducts = [...(settings.bbqProducts || []), {
      name: '',
      category: 'steak',
      pricePerLb: 0,
      description: ''
    }];
    setSettings({ ...settings, bbqProducts: newProducts });
  };

  const updateProduct = (index, field, value) => {
    const newProducts = [...settings.bbqProducts];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setSettings({ ...settings, bbqProducts: newProducts });
  };

  const removeProduct = (index) => {
    const newProducts = settings.bbqProducts.filter((_, i) => i !== index);
    setSettings({ ...settings, bbqProducts: newProducts });
  };

  const updateAging = (index, field, value) => {
    const newAging = [...settings.aging];
    newAging[index] = { ...newAging[index], [field]: value };
    setSettings({ ...settings, aging: newAging });
  };

  const addAgingOption = () => {
    const newAging = [...(settings.aging || []), { label: '', days: 0, upcharge: 0 }];
    setSettings({ ...settings, aging: newAging });
  };

  const removeAgingOption = (index) => {
    const newAging = settings.aging.filter((_, i) => i !== index);
    setSettings({ ...settings, aging: newAging });
  };

  if (loading) return <div className="p-8">Loading BBQ settings...</div>;

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-amber-600" />
          <h2 className="text-2xl font-bold text-gray-800">BBQ Planner Settings</h2>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>

      {/* Total Meat Per Person - PRIMARY SETTING */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-lg shadow-md border-2 border-amber-300 mb-6">
        <h3 className="text-xl font-bold mb-3 text-gray-800 flex items-center gap-2">
          🍖 Total Meat Setting
        </h3>
        
        {/* Editable Label */}
        <div className="mb-4">
          <Label className="text-sm font-medium text-gray-700">Display Name (Editable)</Label>
          <Input
            type="text"
            value={settings.totalMeatLabel || "Total Meat Per Person"}
            onChange={(e) => setSettings({ ...settings, totalMeatLabel: e.target.value })}
            placeholder="Total Meat Per Person"
            className="text-base"
          />
          <p className="text-xs text-gray-500 mt-1">
            This name will appear on the BBQ Calculator
          </p>
        </div>

        {/* Amount Value */}
        <div className="max-w-xs">
          <Label className="text-sm font-medium text-gray-700">Default Amount (lbs)</Label>
          <Input
            type="number"
            step="0.1"
            min="0.5"
            max="5"
            value={settings.totalMeatPerPerson || 1.2}
            onChange={(e) => setSettings({ ...settings, totalMeatPerPerson: parseFloat(e.target.value) || 1.2 })}
            className="text-2xl font-bold text-center border-2 border-amber-400"
          />
          <p className="text-sm text-gray-600 mt-2">
            📊 Example: If customer selects 3 meats, each gets <strong>{((settings.totalMeatPerPerson || 1.2) / 3).toFixed(2)} lbs</strong> per person
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Total = {settings.totalMeatPerPerson || 1.2} lbs ÷ number of selected meats
          </p>
        </div>
      </div>

      {/* Portion Sizes Per Category - DEPRECATED (kept for reference) */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm border mb-6 opacity-60">
        <h3 className="text-lg font-semibold mb-2 text-gray-600">
          ⚠️ Individual Portions (Not Used - Use Total Above)
        </h3>
        <p className="text-sm text-gray-500 mb-4">These values are no longer used. The calculator now uses "Total Meat Per Person" divided among selected meats.</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>🥩 Steak per Person</Label>
            <Input
              type="number"
              step="0.1"
              value={settings.steakPerPerson}
              onChange={(e) => setSettings({ ...settings, steakPerPerson: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-xs text-gray-500 mt-1">~{(settings.steakPerPerson * 16).toFixed(0)} oz</p>
          </div>
          <div>
            <Label>🍗 Chicken per Person</Label>
            <Input
              type="number"
              step="0.1"
              value={settings.chickenPerPerson}
              onChange={(e) => setSettings({ ...settings, chickenPerPerson: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-xs text-gray-500 mt-1">~{(settings.chickenPerPerson * 16).toFixed(0)} oz</p>
          </div>
          <div>
            <Label>🌭 Sausage per Person</Label>
            <Input
              type="number"
              step="0.1"
              value={settings.sausagePerPerson}
              onChange={(e) => setSettings({ ...settings, sausagePerPerson: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-xs text-gray-500 mt-1">~{(settings.sausagePerPerson * 16).toFixed(0)} oz</p>
          </div>
        </div>
      </div>

      {/* BBQ Products */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">BBQ Products</h3>
          <Button onClick={addProduct} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="space-y-3">
          {(settings.bbqProducts || []).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No BBQ products added yet. Click "Add Product" to start.
            </div>
          ) : (
            (settings.bbqProducts || []).map((product, index) => (
              <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg border">
                <div className="flex-1 grid grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input
                      placeholder="Product name"
                      value={product.name}
                      onChange={(e) => updateProduct(index, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Category</Label>
                    <Select
                      value={product.category}
                      onValueChange={(value) => updateProduct(index, 'category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="steak">🥩 Steak</SelectItem>
                        <SelectItem value="chicken">🍗 Chicken</SelectItem>
                        <SelectItem value="sausage">🌭 Sausage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Price per lb ($)</Label>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="0.00"
                      value={product.pricePerLb}
                      onChange={(e) => updateProduct(index, 'pricePerLb', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Input
                      placeholder="Brief description"
                      value={product.description}
                      onChange={(e) => updateProduct(index, 'description', e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeProduct(index)}
                  className="self-end"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Aging Options */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Dry-Aging Options</h3>
          <Button onClick={addAgingOption} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Option
          </Button>
        </div>

        <div className="space-y-3">
          {(settings.aging || []).map((option, index) => (
            <div key={index} className="flex gap-3 p-4 bg-gray-50 rounded-lg border">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Label</Label>
                  <Input
                    placeholder="e.g., 30 Days (Premium)"
                    value={option.label}
                    onChange={(e) => updateAging(index, 'label', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Days</Label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={option.days}
                    onChange={(e) => updateAging(index, 'days', parseInt(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label className="text-xs">Upcharge ($)</Label>
                  <Input
                    type="number"
                    placeholder="25"
                    value={option.upcharge}
                    onChange={(e) => updateAging(index, 'upcharge', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeAgingOption(index)}
                className="self-end"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Enable/Disable */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300 text-emerald-600"
          />
          <span className="text-sm font-medium text-gray-700">
            Enable BBQ Planner on website
          </span>
        </label>
      </div>
    </div>
  );
};

export default BBQSettingsManager;
