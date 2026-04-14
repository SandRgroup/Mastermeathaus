import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { getMemberships, createMembership, updateMembership, deleteMembership } from '../../api/cms';
import { toast } from 'sonner';

const MembershipsManager = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    period: '/month',
    features: [''],
    highlight: false,
    bestValue: false
  });

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      const { data } = await getMemberships();
      setMemberships(data);
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
        ...formData,
        features: formData.features.filter(f => f.trim() !== '')
      };

      if (editing) {
        await updateMembership(editing._id, payload);
        toast.success('Membership updated');
      } else {
        await createMembership(payload);
        toast.success('Membership created');
      }
      setDialogOpen(false);
      resetForm();
      fetchMemberships();
    } catch (error) {
      toast.error('Failed to save membership');
    }
  };

  const handleEdit = (membership) => {
    setEditing(membership);
    setFormData({
      name: membership.name,
      price: membership.price,
      period: membership.period,
      features: [...membership.features, ''],
      highlight: membership.highlight,
      bestValue: membership.bestValue
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this membership?')) return;
    try {
      await deleteMembership(id);
      toast.success('Membership deleted');
      fetchMemberships();
    } catch (error) {
      toast.error('Failed to delete membership');
    }
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

  const resetForm = () => {
    setEditing(null);
    setFormData({
      name: '',
      price: '',
      period: '/month',
      features: [''],
      highlight: false,
      bestValue: false
    });
  };

  if (loading) return <div className="loading">Loading memberships...</div>;

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Membership Plans ({memberships.length})</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="add-btn">
              <Plus size={18} />
              Add Membership
            </Button>
          </DialogTrigger>
          <DialogContent className="dialog-content">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Membership' : 'Add Membership'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="membership-form">
              <div className="form-grid">
                <div className="form-group">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="$19.99"
                    required
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="period">Period *</Label>
                  <Input
                    id="period"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    placeholder="/month"
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <Label>Features</Label>
                  {formData.features.map((feature, index) => (
                    <div key={index} className="feature-input">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Feature description"
                      />
                      {formData.features.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFeature(index)}
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" size="sm" variant="outline" onClick={addFeature}>
                    <Plus size={16} /> Add Feature
                  </Button>
                </div>
                <div className="form-group checkbox-group">
                  <div className="checkbox-item">
                    <Checkbox
                      id="highlight"
                      checked={formData.highlight}
                      onCheckedChange={(checked) => setFormData({ ...formData, highlight: checked })}
                    />
                    <Label htmlFor="highlight">Highlight</Label>
                  </div>
                  <div className="checkbox-item">
                    <Checkbox
                      id="bestValue"
                      checked={formData.bestValue}
                      onCheckedChange={(checked) => setFormData({ ...formData, bestValue: checked })}
                    />
                    <Label htmlFor="bestValue">Best Value Badge</Label>
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="memberships-grid">
        {memberships.map((membership) => (
          <Card key={membership._id} className={`membership-item ${membership.highlight ? 'highlighted' : ''}`}>
            {membership.bestValue && <div className="best-value-tag">Best Value</div>}
            <h3>{membership.name}</h3>
            <div className="membership-price">
              <span className="price">{membership.price}</span>
              <span className="period">{membership.period}</span>
            </div>
            <ul className="features-list">
              {membership.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
            <div className="membership-actions">
              <Button size="sm" variant="outline" onClick={() => handleEdit(membership)}>
                <Edit size={16} />
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(membership._id)}>
                <Trash2 size={16} />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MembershipsManager;
