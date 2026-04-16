import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const BBQProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    wagyuUpcharge: '0',
    grassFedUpcharge: '0',
    dryAgedUpcharge: '0',
    ranchOrigin: 'Texas, USA',
    genetics: 'Premium genetics, raised the right way',
    grainFinished: '350+ Days',
    gradeLabel: 'GOLD Grade',
    meatType: 'beef',
    category: 'steak',
    defaultGrade: 'prime'
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/bbq-products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching BBQ products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editing
        ? `${backendUrl}/api/bbq-products/${editing.id}`
        : `${backendUrl}/api/bbq-products`;
      
      const method = editing ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        wagyuUpcharge: parseFloat(formData.wagyuUpcharge),
        grassFedUpcharge: parseFloat(formData.grassFedUpcharge),
        dryAgedUpcharge: parseFloat(formData.dryAgedUpcharge)
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchProducts();
        resetForm();
        setDialogOpen(false);
      }
    } catch (error) {
      console.error('Error saving BBQ product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditing(product);
    setFormData({
      name: product.name,
      description: product.description,
      basePrice: product.basePrice.toString(),
      wagyuUpcharge: product.wagyuUpcharge.toString(),
      grassFedUpcharge: product.grassFedUpcharge.toString(),
      dryAgedUpcharge: product.dryAgedUpcharge.toString(),
      ranchOrigin: product.ranchOrigin,
      genetics: product.genetics,
      grainFinished: product.grainFinished,
      gradeLabel: product.gradeLabel,
      meatType: product.meatType,
      category: product.category,
      defaultGrade: product.defaultGrade
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this BBQ product?')) return;
    
    try {
      const response = await fetch(`${backendUrl}/api/bbq-products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting BBQ product:', error);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({
      name: '',
      description: '',
      basePrice: '',
      wagyuUpcharge: '0',
      grassFedUpcharge: '0',
      dryAgedUpcharge: '0',
      ranchOrigin: 'Texas, USA',
      genetics: 'Premium genetics, raised the right way',
      grainFinished: '350+ Days',
      gradeLabel: 'GOLD Grade',
      meatType: 'beef',
      category: 'steak',
      defaultGrade: 'prime'
    });
  };

  if (loading) return <div className="text-center py-8">Loading BBQ Products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">BBQ Products Manager</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
              + Add BBQ Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit' : 'Add'} BBQ Product</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <Label htmlFor="name">Meat Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Filet Mignon"
                    required
                  />
                </div>

                <div className="form-group">
                  <Label htmlFor="basePrice">Base Price ($/lb) *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="45.00"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Premium beef description..."
                  rows={3}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold mb-3">Pricing Upcharges</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="form-group">
                    <Label htmlFor="wagyuUpcharge">Wagyu Upcharge ($)</Label>
                    <Input
                      id="wagyuUpcharge"
                      type="number"
                      step="0.01"
                      value={formData.wagyuUpcharge}
                      onChange={(e) => setFormData({ ...formData, wagyuUpcharge: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <Label htmlFor="grassFedUpcharge">Grass Fed Upcharge ($)</Label>
                    <Input
                      id="grassFedUpcharge"
                      type="number"
                      step="0.01"
                      value={formData.grassFedUpcharge}
                      onChange={(e) => setFormData({ ...formData, grassFedUpcharge: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <Label htmlFor="dryAgedUpcharge">Dry Aged Upcharge ($)</Label>
                    <Input
                      id="dryAgedUpcharge"
                      type="number"
                      step="0.01"
                      value={formData.dryAgedUpcharge}
                      onChange={(e) => setFormData({ ...formData, dryAgedUpcharge: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold mb-3">Product Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <Label htmlFor="ranchOrigin">Ranch Origin</Label>
                    <Input
                      id="ranchOrigin"
                      value={formData.ranchOrigin}
                      onChange={(e) => setFormData({ ...formData, ranchOrigin: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <Label htmlFor="gradeLabel">Grade Label</Label>
                    <Input
                      id="gradeLabel"
                      value={formData.gradeLabel}
                      onChange={(e) => setFormData({ ...formData, gradeLabel: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <Label htmlFor="genetics">Genetics</Label>
                    <Input
                      id="genetics"
                      value={formData.genetics}
                      onChange={(e) => setFormData({ ...formData, genetics: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <Label htmlFor="grainFinished">Grain Finished</Label>
                    <Input
                      id="grainFinished"
                      value={formData.grainFinished}
                      onChange={(e) => setFormData({ ...formData, grainFinished: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-bold mb-3">Categorization</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="form-group">
                    <Label htmlFor="meatType">Meat Type</Label>
                    <Select value={formData.meatType} onValueChange={(value) => setFormData({ ...formData, meatType: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beef">Beef</SelectItem>
                        <SelectItem value="pork">Pork</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="form-group">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="steak">Steak</SelectItem>
                        <SelectItem value="ribs">Ribs</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="form-group">
                    <Label htmlFor="defaultGrade">Default Grade</Label>
                    <Select value={formData.defaultGrade} onValueChange={(value) => setFormData({ ...formData, defaultGrade: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prime">Prime</SelectItem>
                        <SelectItem value="wagyu">American Wagyu</SelectItem>
                        <SelectItem value="grassfed">Grass Fed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editing ? 'Update' : 'Create'} Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {products.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            No BBQ products yet. Click "Add BBQ Product" to create your first one.
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <div><span className="font-semibold">Base Price:</span> ${product.basePrice}/lb</div>
                    <div><span className="font-semibold">Wagyu Upcharge:</span> +${product.wagyuUpcharge}</div>
                    <div><span className="font-semibold">Grass Fed Upcharge:</span> +${product.grassFedUpcharge}</div>
                    <div><span className="font-semibold">Dry Aged Upcharge:</span> +${product.dryAgedUpcharge}</div>
                    <div><span className="font-semibold">Ranch:</span> {product.ranchOrigin}</div>
                    <div><span className="font-semibold">Grade:</span> {product.gradeLabel}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default BBQProductsManager;
