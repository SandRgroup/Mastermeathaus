import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const MembershipsManager = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    tier_name: '',
    tier_level: 0,
    monthly_price: '',
    yearly_price: '',
    description: '',
    features: [''],
    highlight: false,
    best_value: false
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/memberships`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMemberships(data);
      }
    } catch (error) {
      toast.error('Failed to load memberships');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        tier_name: formData.tier_name,
        tier_level: parseInt(formData.tier_level),
        monthly_price: parseFloat(formData.monthly_price),
        yearly_price: parseFloat(formData.yearly_price),
        description: formData.description,
        features: formData.features.filter(f => f.trim() !== ''),
        highlight: formData.highlight,
        best_value: formData.best_value,
        benefits: {
          discount_percent: 0,
          select_steaks_discount: 0,
          a5_wagyu_discount: 0,
          custom_dry_aging: false,
          dry_aging_days: 0,
          vip_cut_eligible: false,
          vip_cut_threshold: 150,
          birthday_bonus: false,
          concierge_access: false,
          early_access: false,
          priority_delivery: false,
          delivery: {
            base_free_miles: 0,
            extended_free_miles: 0,
            order_threshold: 0
          }
        }
      };

      const url = editing
        ? `${backendUrl}/api/memberships/${editing.id}`
        : `${backendUrl}/api/memberships`;
      
      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(editing ? 'Membership updated' : 'Membership created');
        setDialogOpen(false);
        resetForm();
        fetchMemberships();
      } else {
        const error = await response.json();
        toast.error(`Failed: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save membership');
    }
  };

  const handleEdit = (membership) => {
    setEditing(membership);
    setFormData({
      tier_name: membership.tier_name,
      tier_level: membership.tier_level,
      monthly_price: membership.monthly_price.toString(),
      yearly_price: membership.yearly_price.toString(),
      description: membership.description,
      features: [...membership.features, ''],
      highlight: membership.highlight,
      best_value: membership.best_value
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this membership?')) return;
    try {
      const response = await fetch(`${backendUrl}/api/memberships/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        toast.success('Membership deleted');
        fetchMemberships();
      }
    } catch (error) {
      toast.error('Failed to delete membership');
    }
  };

  const resetForm = () => {
    setFormData({
      tier_name: '',
      tier_level: 0,
      monthly_price: '',
      yearly_price: '',
      description: '',
      features: [''],
      highlight: false,
      best_value: false
    });
    setEditing(null);
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  if (loading) {
    return <div className="p-6">Loading memberships...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Memberships</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Membership
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Membership' : 'Add Membership'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tier Name *</Label>
                  <Input
                    value={formData.tier_name}
                    onChange={(e) => setFormData({ ...formData, tier_name: e.target.value })}
                    placeholder="The Stockyard Block"
                    required
                  />
                </div>
                <div>
                  <Label>Tier Level *</Label>
                  <Input
                    type="number"
                    value={formData.tier_level}
                    onChange={(e) => setFormData({ ...formData, tier_level: e.target.value })}
                    placeholder="0, 1, 2, 3"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monthly Price ($) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.monthly_price}
                    onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
                    placeholder="14.99"
                    required
                  />
                </div>
                <div>
                  <Label>Yearly Price ($) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.yearly_price}
                    onChange={(e) => setFormData({ ...formData, yearly_price: e.target.value })}
                    placeholder="150"
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Premium tier with enhanced benefits"
                />
              </div>

              <div>
                <Label>Features</Label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="10% off all cuts"
                    />
                    {formData.features.length > 1 && (
                      <Button type="button" variant="ghost" onClick={() => removeFeature(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" onClick={addFeature} variant="outline" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.highlight}
                    onCheckedChange={(checked) => setFormData({ ...formData, highlight: checked })}
                  />
                  <span>Highlight</span>
                </label>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.best_value}
                    onCheckedChange={(checked) => setFormData({ ...formData, best_value: checked })}
                  />
                  <span>Best Value Badge</span>
                </label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editing ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {memberships.map((membership) => (
          <Card key={membership.id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold">{membership.tier_name}</h3>
              {membership.best_value && (
                <span className="text-xs bg-yellow-400 text-black px-2 py-1 rounded">
                  BEST VALUE
                </span>
              )}
            </div>
            <div className="text-2xl font-bold mb-2">
              ${membership.monthly_price}/mo
            </div>
            <div className="text-sm text-gray-600 mb-2">
              ${membership.yearly_price}/yr
            </div>
            <div className="text-sm text-gray-600 mb-3">
              {membership.description}
            </div>
            <ul className="text-sm space-y-1 mb-4">
              {membership.features?.map((feature, idx) => (
                <li key={idx}>✓ {feature}</li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(membership)}>
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(membership.id)}>
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {memberships.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No memberships yet. Click "Add Membership" to create one.
        </div>
      )}
    </div>
  );
};

export default MembershipsManager;
