import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import '../../styles/Admin.css';

const BoxesManager = () => {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBox, setEditingBox] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    price: '',
    features: [''],
    icon: '🥩',
    highlight: false
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchBoxes();
  }, []);

  const fetchBoxes = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/steak-boxes`);
      setBoxes(response.data);
    } catch (error) {
      console.error('Failed to fetch boxes:', error);
      toast.error('Failed to load boxes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const filteredFeatures = formData.features.filter(f => f.trim() !== '');
    
    if (!formData.name || !formData.price || filteredFeatures.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        ...formData,
        features: filteredFeatures
      };

      if (editingBox) {
        await axios.put(`${backendUrl}/api/steak-boxes/${editingBox.id}`, payload, {
          withCredentials: true
        });
        toast.success('Box updated successfully');
      } else {
        await axios.post(`${backendUrl}/api/steak-boxes`, payload, {
          withCredentials: true
        });
        toast.success('Box created successfully');
      }

      fetchBoxes();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save box:', error);
      toast.error('Failed to save box');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this box?')) {
      return;
    }

    try {
      await axios.delete(`${backendUrl}/api/steak-boxes/${id}`, {
        withCredentials: true
      });
      toast.success('Box deleted');
      fetchBoxes();
    } catch (error) {
      console.error('Failed to delete box:', error);
      toast.error('Failed to delete box');
    }
  };

  const handleEdit = (box) => {
    setEditingBox(box);
    setFormData({
      name: box.name,
      tagline: box.tagline,
      description: box.description,
      price: box.price,
      features: box.features,
      icon: box.icon,
      highlight: box.highlight
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBox(null);
    setFormData({
      name: '',
      tagline: '',
      description: '',
      price: '',
      features: [''],
      icon: '🥩',
      highlight: false
    });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  if (loading) {
    return <div className="loading">Loading boxes...</div>;
  }

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Steak Boxes</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingBox(null)}>
              <Plus size={18} />
              Add Box
            </Button>
          </DialogTrigger>
          <DialogContent className="box-dialog">
            <DialogHeader>
              <DialogTitle>{editingBox ? 'Edit Box' : 'Create Box'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="box-form">
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
                <Label htmlFor="tagline">Tagline *</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="$149"
                    required
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="icon">Icon</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <Label>Features *</Label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="feature-input-row">
                    <Input
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      placeholder="Feature description"
                    />
                    {formData.features.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(index)}>
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addFeature}>
                  <Plus size={16} /> Add Feature
                </Button>
              </div>

              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="highlight"
                  checked={formData.highlight}
                  onChange={(e) => setFormData({ ...formData, highlight: e.target.checked })}
                />
                <Label htmlFor="highlight">Highlight (Best Choice)</Label>
              </div>

              <div className="form-actions">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBox ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="boxes-grid">
        {boxes.length === 0 ? (
          <Card className="empty-state">
            <Package size={48} />
            <p>No steak boxes yet</p>
            <p className="empty-subtext">Create your first box to get started</p>
          </Card>
        ) : (
          boxes.map((box) => (
            <Card key={box.id} className="box-card">
              <div className="box-header">
                <div className="box-icon-large">{box.icon}</div>
                <div className="box-actions">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(box)}>
                    <Pencil size={16} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(box.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <h3>{box.name}</h3>
              <p className="box-tagline">{box.tagline}</p>
              <p className="box-description">{box.description}</p>
              <div className="box-price">{box.price}</div>
              <ul className="box-features">
                {box.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              {box.highlight && <div className="highlight-badge">Best Choice</div>}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BoxesManager;
