import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Menu, ExternalLink } from 'lucide-react';
import '../../styles/Admin.css';

const MenuManager = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    label: '',
    link: '',
    position: 'header',
    order: 0,
    enabled: true
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/menu-items`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.label || !formData.link) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingItem) {
        await axios.put(`${backendUrl}/api/menu-items/${editingItem.id}`, formData, {
          withCredentials: true
        });
        toast.success('Menu item updated successfully');
      } else {
        await axios.post(`${backendUrl}/api/menu-items`, formData, {
          withCredentials: true
        });
        toast.success('Menu item created successfully');
      }

      fetchMenuItems();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save menu item:', error);
      toast.error('Failed to save menu item');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      await axios.delete(`${backendUrl}/api/menu-items/${id}`, {
        withCredentials: true
      });
      toast.success('Menu item deleted');
      fetchMenuItems();
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      label: item.label,
      link: item.link,
      position: item.position,
      order: item.order,
      enabled: item.enabled
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({
      label: '',
      link: '',
      position: 'header',
      order: 0,
      enabled: true
    });
  };

  const presetItems = [
    { label: 'Shop Boxes', link: '/shop-boxes' },
    { label: 'Build Your Box', link: '/build-your-box' },
    { label: 'Shop Cuts', link: '/' },
    { label: 'View Membership', link: '/membership/premium' },
    { label: 'Learn More', link: '/about' }
  ];

  const addPreset = (preset) => {
    setFormData({
      ...formData,
      label: preset.label,
      link: preset.link
    });
  };

  if (loading) {
    return <div className="loading">Loading menu items...</div>;
  }

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Menu & CTA Manager</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingItem(null)}>
              <Plus size={18} />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="menu-dialog">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Create Menu Item'}</DialogTitle>
            </DialogHeader>
            
            <div className="preset-buttons">
              <p className="preset-label">Quick Add:</p>
              <div className="preset-grid">
                {presetItems.map((preset, idx) => (
                  <Button
                    key={idx}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addPreset(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="menu-form">
              <div className="form-group">
                <Label htmlFor="label">Label *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="Shop Boxes"
                  required
                />
              </div>

              <div className="form-group">
                <Label htmlFor="link">Link/URL *</Label>
                <Input
                  id="link"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="/shop-boxes or https://..."
                  required
                />
                <p className="input-hint">Internal link (/shop-boxes) or external (https://...)</p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Label htmlFor="position">Position</Label>
                  <Select value={formData.position} onValueChange={(value) => setFormData({ ...formData, position: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="header">Header Navigation</SelectItem>
                      <SelectItem value="hero">Hero CTA</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="form-group">
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  />
                  <p className="input-hint">Display order (0-99)</p>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                />
                <Label htmlFor="enabled">Enabled (Show on site)</Label>
              </div>

              <div className="form-actions">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="menu-items-list">
        {menuItems.length === 0 ? (
          <Card className="empty-state">
            <Menu size={48} />
            <p>No menu items yet</p>
            <p className="empty-subtext">Add navigation links and CTAs</p>
          </Card>
        ) : (
          menuItems.map((item) => (
            <Card key={item.id} className="menu-item-card">
              <div className="menu-item-header">
                <div className="menu-item-info">
                  <h3>{item.label}</h3>
                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="menu-link">
                    {item.link} <ExternalLink size={14} />
                  </a>
                </div>
                <div className="menu-item-actions">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                    <Pencil size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <div className="menu-item-meta">
                <span className="meta-badge">{item.position}</span>
                <span className="meta-order">Order: {item.order}</span>
                <span className={`meta-status ${item.enabled ? 'enabled' : 'disabled'}`}>
                  {item.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MenuManager;
