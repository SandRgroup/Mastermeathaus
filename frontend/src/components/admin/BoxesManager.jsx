import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Package, X } from 'lucide-react';

const BoxesManager = () => {
  const [boxes, setBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    items: [],
    features: [],
    image: '',
    featured: false
  });
  const [itemInput, setItemInput] = useState({ name: '', quantity: '', unit: 'oz' });
  const [featureInput, setFeatureInput] = useState('');

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchBoxes();
    const interval = setInterval(fetchBoxes, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchBoxes = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/boxes`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBoxes(data);
      }
    } catch (error) {
      console.error('Error fetching boxes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || formData.items.length === 0) {
      toast.error('Please fill in name, price, and add at least one item');
      return;
    }

    try {
      const url = editing
        ? `${backendUrl}/api/boxes/${editing.id}`
        : `${backendUrl}/api/boxes`;
      
      const method = editing ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        price: parseFloat(formData.price)
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(editing ? 'Box updated!' : 'Box created!');
        await fetchBoxes();
        resetForm();
        setDialogOpen(false);
      } else {
        const error = await response.text();
        toast.error(`Failed: ${error}`);
      }
    } catch (error) {
      console.error('Error saving box:', error);
      toast.error('Failed to save box');
    }
  };

  const handleEdit = (box) => {
    setEditing(box);
    setFormData({
      name: box.name,
      description: box.description,
      price: box.price.toString(),
      items: box.items || [],
      features: box.features || [],
      image: box.image || '',
      featured: box.featured || false
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this box?')) return;

    try {
      const response = await fetch(`${backendUrl}/api/boxes/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Box deleted');
        fetchBoxes();
      } else {
        toast.error('Failed to delete box');
      }
    } catch (error) {
      console.error('Error deleting box:', error);
      toast.error('Failed to delete box');
    }
  };

  const addItem = () => {
    if (!itemInput.name || !itemInput.quantity) {
      toast.error('Please fill item name and quantity');
      return;
    }
    
    setFormData({
      ...formData,
      items: [...formData.items, { ...itemInput, quantity: parseInt(itemInput.quantity) }]
    });
    setItemInput({ name: '', quantity: '', unit: 'oz' });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const addFeature = () => {
    if (!featureInput.trim()) {
      toast.error('Please enter a feature');
      return;
    }
    
    setFormData({
      ...formData,
      features: [...formData.features, featureInput]
    });
    setFeatureInput('');
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      items: [],
      features: [],
      image: '',
      featured: false
    });
    setItemInput({ name: '', quantity: '', unit: 'oz' });
    setFeatureInput('');
    setEditing(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading boxes...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6" />
            Steak Boxes Manager
          </h2>
          <p className="text-gray-600">Manage premium steak box bundles</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Box
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Box' : 'Create New Box'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Box Name *</Label>
                  <Input
                    placeholder="e.g., Wagyu Luxury Bundle"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Price ($) *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="299.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe this box bundle..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Items Section */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Box Items *</h3>
                <div className="grid grid-cols-12 gap-2 mb-2">
                  <Input
                    className="col-span-5"
                    placeholder="Item name (e.g., Ribeye Steak)"
                    value={itemInput.name}
                    onChange={(e) => setItemInput({ ...itemInput, name: e.target.value })}
                  />
                  <Input
                    className="col-span-3"
                    type="number"
                    placeholder="Qty"
                    value={itemInput.quantity}
                    onChange={(e) => setItemInput({ ...itemInput, quantity: e.target.value })}
                  />
                  <select
                    className="col-span-2 border rounded px-2"
                    value={itemInput.unit}
                    onChange={(e) => setItemInput({ ...itemInput, unit: e.target.value })}
                  >
                    <option value="oz">oz</option>
                    <option value="pcs">pcs</option>
                    <option value="lbs">lbs</option>
                  </select>
                  <Button type="button" onClick={addItem} className="col-span-2">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.items.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {formData.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">
                          {item.name} - {item.quantity} {item.unit}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(idx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Features Section */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Features (Optional)</h3>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Enter a feature (e.g., Premium Aged Beef)"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  />
                  <Button type="button" onClick={addFeature}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {formData.features.length > 0 && (
                  <div className="space-y-2 mt-3">
                    {formData.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{feature}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(idx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Additional Options */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                />
                <Label htmlFor="featured">Mark as Featured</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editing ? 'Update Box' : 'Create Box'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Boxes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boxes.map((box) => (
          <Card key={box.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg">{box.name}</h3>
                <p className="text-2xl font-bold text-red-900">${box.price}</p>
              </div>
              {box.featured && (
                <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded">
                  FEATURED
                </span>
              )}
            </div>
            
            {box.description && (
              <p className="text-sm text-gray-600 mb-3">{box.description}</p>
            )}
            
            {box.items && box.items.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-semibold mb-1">Items:</p>
                <ul className="text-sm text-gray-700">
                  {box.items.map((item, idx) => (
                    <li key={idx}>• {item.name} ({item.quantity} {item.unit})</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" onClick={() => handleEdit(box)}>
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(box.id)}>
                <Trash2 className="w-3 h-3 mr-1" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {boxes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No boxes yet. Click "Add Box" to create one.
        </div>
      )}
    </div>
  );
};

export default BoxesManager;
