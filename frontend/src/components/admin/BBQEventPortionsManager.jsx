import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Save, Flame } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BBQEventPortionsManager = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [portions, setPortions] = useState({
    luxury: 1.3,
    family: 1.1,
    party: 1.0,
    casual: 1.2
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/bbq-settings`);
      setPortions(data.event_type_portions);
    } catch (error) {
      console.error('Failed to load BBQ settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(
        `${backendUrl}/api/bbq-settings`,
        { event_type_portions: portions },
        { withCredentials: true }
      );
      toast.success('✅ BBQ event portions saved!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updatePortion = (eventType, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setPortions(prev => ({ ...prev, [eventType]: numValue }));
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-sm text-gray-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#C8A96A]" />
            BBQ Event Portions
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Configure portion sizes per person for AI BBQ Calculator
          </p>
        </div>
      </div>

      <Card className="p-6 bg-[#161412] border-[#C8A96A]/20">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Luxury Experience */}
            <div className="space-y-2">
              <Label htmlFor="luxury" className="text-sm font-medium text-white">
                🌟 Luxury Experience
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="luxury"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={portions.luxury}
                  onChange={(e) => updatePortion('luxury', e.target.value)}
                  className="flex-1 bg-black/30 border-[#C8A96A]/30 text-white"
                />
                <span className="text-sm text-gray-400">lbs/person</span>
              </div>
              <p className="text-xs text-gray-500">
                Premium events with generous portions
              </p>
            </div>

            {/* Family Dinner */}
            <div className="space-y-2">
              <Label htmlFor="family" className="text-sm font-medium text-white">
                👨‍👩‍👧‍👦 Family Dinner
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="family"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={portions.family}
                  onChange={(e) => updatePortion('family', e.target.value)}
                  className="flex-1 bg-black/30 border-[#C8A96A]/30 text-white"
                />
                <span className="text-sm text-gray-400">lbs/person</span>
              </div>
              <p className="text-xs text-gray-500">
                Family gatherings and dinners
              </p>
            </div>

            {/* Party */}
            <div className="space-y-2">
              <Label htmlFor="party" className="text-sm font-medium text-white">
                🎉 Party / Celebration
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="party"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={portions.party}
                  onChange={(e) => updatePortion('party', e.target.value)}
                  className="flex-1 bg-black/30 border-[#C8A96A]/30 text-white"
                />
                <span className="text-sm text-gray-400">lbs/person</span>
              </div>
              <p className="text-xs text-gray-500">
                Celebrations with multiple food options
              </p>
            </div>

            {/* Casual */}
            <div className="space-y-2">
              <Label htmlFor="casual" className="text-sm font-medium text-white">
                🔥 Casual BBQ
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="casual"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={portions.casual}
                  onChange={(e) => updatePortion('casual', e.target.value)}
                  className="flex-1 bg-black/30 border-[#C8A96A]/30 text-white"
                />
                <span className="text-sm text-gray-400">lbs/person</span>
              </div>
              <p className="text-xs text-gray-500">
                Casual backyard BBQs
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#C8A96A]/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                💡 Changes take effect immediately for new BBQ calculations
              </div>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="bg-gradient-to-r from-[#C8A96A] to-[#B8996A] text-black hover:opacity-90"
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-4 bg-[#161412]/50 border-[#C8A96A]/10">
        <h4 className="font-semibold text-white text-sm mb-2">ℹ️ How This Works</h4>
        <ul className="space-y-1 text-xs text-gray-400">
          <li>• AI detects event keywords (luxury, family, party, casual) from customer input</li>
          <li>• Multiplies guests × portion size to recommend meat quantities</li>
          <li>• Higher portions = more generous recommendations</li>
        </ul>
      </Card>
    </div>
  );
};

export default BBQEventPortionsManager;
