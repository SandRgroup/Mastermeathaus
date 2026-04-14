import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Tag, Percent, DollarSign } from 'lucide-react';
import '../../styles/Admin.css';

const DiscountsManager = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    min_purchase: '0',
    max_uses: '',
    expires_at: '',
    active: true
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/discount-codes`, {
        withCredentials: true
      });
      setDiscounts(response.data);
    } catch (error) {
      console.error('Failed to fetch discount codes:', error);
      toast.error('Failed to load discount codes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.code.trim()) {
      toast.error('Code is required');
      return;
    }
    if (!formData.value || parseFloat(formData.value) <= 0) {
      toast.error('Value must be greater than 0');
      return;
    }
    if (formData.type === 'percentage' && parseFloat(formData.value) > 100) {
      toast.error('Percentage cannot exceed 100');
      return;
    }

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        type: formData.type,
        value: parseFloat(formData.value),
        min_purchase: parseFloat(formData.min_purchase) || 0,
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        active: formData.active
      };

      if (editingDiscount) {
        await axios.put(`${backendUrl}/api/discount-codes/${editingDiscount._id}`, payload, {
          withCredentials: true
        });
        toast.success('Discount code updated successfully');
      } else {
        await axios.post(`${backendUrl}/api/discount-codes`, payload, {
          withCredentials: true
        });
        toast.success('Discount code created successfully');
      }

      fetchDiscounts();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save discount code:', error);
      toast.error(error.response?.data?.detail || 'Failed to save discount code');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount code?')) {
      return;
    }

    try {
      await axios.delete(`${backendUrl}/api/discount-codes/${id}`, {
        withCredentials: true
      });
      toast.success('Discount code deleted');
      fetchDiscounts();
    } catch (error) {
      console.error('Failed to delete discount code:', error);
      toast.error('Failed to delete discount code');
    }
  };

  const handleEdit = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      description: discount.description || '',
      type: discount.type,
      value: discount.value.toString(),
      min_purchase: discount.min_purchase?.toString() || '0',
      max_uses: discount.max_uses?.toString() || '',
      expires_at: discount.expires_at ? new Date(discount.expires_at).toISOString().split('T')[0] : '',
      active: discount.active
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDiscount(null);
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      value: '',
      min_purchase: '0',
      max_uses: '',
      expires_at: '',
      active: true
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return <div className="loading">Loading discount codes...</div>;
  }

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Discount Codes</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingDiscount(null)}>
              <Plus size={18} />
              Add Discount Code
            </Button>
          </DialogTrigger>
          <DialogContent className="discount-dialog">
            <DialogHeader>
              <DialogTitle>
                {editingDiscount ? 'Edit Discount Code' : 'Create Discount Code'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="discount-form">
              <div className="form-row">
                <div className="form-group">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    placeholder="SUMMER2025"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Summer sale discount"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Label htmlFor="type">Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-group">
                  <Label htmlFor="value">
                    Value * {formData.type === 'percentage' ? '(%)' : '($)'}
                  </Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    placeholder={formData.type === 'percentage' ? '10' : '25.00'}
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Label htmlFor="min_purchase">Minimum Purchase ($)</Label>
                  <Input
                    id="min_purchase"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.min_purchase}
                    onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="max_uses">Max Uses (Optional)</Label>
                  <Input
                    id="max_uses"
                    type="number"
                    placeholder="100"
                    value={formData.max_uses}
                    onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
                  <Input
                    id="expires_at"
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="active">Status</Label>
                  <Select 
                    value={formData.active ? 'active' : 'inactive'} 
                    onValueChange={(value) => setFormData({ ...formData, active: value === 'active' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="form-actions">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingDiscount ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="discounts-grid">
        {discounts.length === 0 ? (
          <Card className="empty-state">
            <Tag size={48} />
            <p>No discount codes yet</p>
            <p className="empty-subtext">Create your first discount code to get started</p>
          </Card>
        ) : (
          discounts.map((discount) => (
            <Card key={discount._id} className="discount-card">
              <div className="discount-header">
                <div className="discount-code">
                  {discount.type === 'percentage' ? <Percent size={18} /> : <DollarSign size={18} />}
                  <span>{discount.code}</span>
                </div>
                <div className="discount-actions">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(discount)}>
                    <Pencil size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(discount._id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              {discount.description && (
                <p className="discount-description">{discount.description}</p>
              )}

              <div className="discount-details">
                <div className="discount-value">
                  {discount.type === 'percentage' 
                    ? `${discount.value}% OFF` 
                    : `$${discount.value.toFixed(2)} OFF`
                  }
                </div>

                <div className="discount-meta">
                  {discount.min_purchase > 0 && (
                    <span className="meta-item">Min: ${discount.min_purchase.toFixed(2)}</span>
                  )}
                  <span className={`meta-item ${isExpired(discount.expires_at) ? 'expired' : ''}`}>
                    Expires: {formatDate(discount.expires_at)}
                  </span>
                </div>

                <div className="discount-usage">
                  <div className="usage-bar">
                    <div 
                      className="usage-fill" 
                      style={{ 
                        width: discount.max_uses 
                          ? `${Math.min((discount.used_count / discount.max_uses) * 100, 100)}%`
                          : '0%'
                      }}
                    />
                  </div>
                  <span className="usage-text">
                    Used: {discount.used_count}
                    {discount.max_uses ? ` / ${discount.max_uses}` : ' (unlimited)'}
                  </span>
                </div>

                <div className="discount-status">
                  <span className={`status-badge ${discount.active ? 'active' : 'inactive'}`}>
                    {discount.active ? 'Active' : 'Inactive'}
                  </span>
                  {isExpired(discount.expires_at) && (
                    <span className="status-badge expired">Expired</span>
                  )}
                  {discount.max_uses && discount.used_count >= discount.max_uses && (
                    <span className="status-badge limit-reached">Limit Reached</span>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DiscountsManager;
