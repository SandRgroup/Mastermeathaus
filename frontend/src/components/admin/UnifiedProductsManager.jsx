import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

const UnifiedProductsManager = () => {
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
    genetics: 'Premium genetics',
    grainFinished: '350+ Days',
    gradeLabel: 'GOLD Grade',
    meatType: 'beef',
    category: 'steak',
    defaultGrade: 'prime'
  });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  // Conversion helper functions
  const convertToPounds = (weight, unit) => {
    const w = parseFloat(weight) || 0;
    if (unit === 'oz') return w / 16;
    if (unit === 'kg') return w / 0.453592;
    return w;
  };

  const getConversions = (weight, unit) => {
    const w = parseFloat(weight) || 0;
    if (!w) return '';
    
    if (unit === 'lb') {
      const oz = (w * 16).toFixed(2);
      const kg = (w * 0.453592).toFixed(3);
      return `= ${oz} oz = ${kg} kg`;
    } else if (unit === 'oz') {
      const lb = (w / 16).toFixed(3);
      const kg = (w * 0.0283495).toFixed(3);
      return `= ${lb} lb = ${kg} kg`;
    } else if (unit === 'kg') {
      const lb = (w / 0.453592).toFixed(2);
      const oz = (w * 35.274).toFixed(2);
      return `= ${lb} lb = ${oz} oz`;
    }
    return '';
  };

  useEffect(() => {
    fetchProducts();
    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/bbq-products`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
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
        toast.success(editing ? 'Product updated successfully!' : 'Product created successfully!');
        await fetchProducts();
        resetForm();
        setDialogOpen(false);
      } else {
        const error = await response.text();
        toast.error(`Failed: ${error}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product. Please try again.');
    }
  };

  const handleEdit = (product) => {
    setEditing(product);
    setFormData({
      name: product.name,
      description: product.description,
      basePrice: product.basePrice.toString(),
      weight: (product.weight || 1.0).toString(),
      weight_unit: product.weight_unit || 'lb',
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
    if (!window.confirm('Delete this product? It will be removed from both Products and BBQ Builder.')) return;
    
    try {
      const response = await fetch(`${backendUrl}/api/bbq-products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success('Product deleted successfully!');
        await fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: '',
      weight: '1.0',
      weight_unit: 'lb',
      wagyuUpcharge: '0',
      grassFedUpcharge: '0',
      dryAgedUpcharge: '0',
      ranchOrigin: 'Texas, USA',
      genetics: 'Premium genetics',
      grainFinished: '350+ Days',
      gradeLabel: 'GOLD Grade',
      meatType: 'beef',
      category: 'steak',
      defaultGrade: 'prime'
    });
    setEditing(null);
  };

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Products Manager</h2>
          <p className="text-gray-600">Manage all products - syncs to both Products & BBQ Builder</p>
          <p className="text-sm text-green-600 mt-1">✓ Auto-syncing to website every 10 seconds</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>+ Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="weight">Weight *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    required
                    placeholder="e.g., 1.0, 16, 0.453"
                  />
                </div>
                <div>
                  <Label htmlFor="weight_unit">Unit *</Label>
                  <Select value={formData.weight_unit} onValueChange={(value) => setFormData({...formData, weight_unit: value})}>
                    <SelectTrigger id="weight_unit">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lb">lb (pounds)</SelectItem>
                      <SelectItem value="oz">oz (ounces)</SelectItem>
                      <SelectItem value="kg">kg (kilograms)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.weight && (
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                  <p className="text-sm font-medium text-blue-900">
                    📊 {formData.weight} {formData.weight_unit} {getConversions(formData.weight, formData.weight_unit)}
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="basePrice">Price per Pound ($/lb) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                  required
                />
                {formData.basePrice && formData.weight && (
                  <p className="text-sm text-green-700 mt-2 font-semibold bg-green-50 p-2 rounded">
                    💰 Total Price: ${(parseFloat(formData.basePrice) * convertToPounds(formData.weight, formData.weight_unit)).toFixed(2)}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="wagyuUpcharge">Wagyu Upcharge ($/lb)</Label>
                  <Input
                    id="wagyuUpcharge"
                    type="number"
                    step="0.01"
                    value={formData.wagyuUpcharge}
                    onChange={(e) => setFormData({...formData, wagyuUpcharge: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="grassFedUpcharge">Grass Fed Upcharge ($/lb)</Label>
                  <Input
                    id="grassFedUpcharge"
                    type="number"
                    step="0.01"
                    value={formData.grassFedUpcharge}
                    onChange={(e) => setFormData({...formData, grassFedUpcharge: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="dryAgedUpcharge">Dry Aged Upcharge ($/lb)</Label>
                  <Input
                    id="dryAgedUpcharge"
                    type="number"
                    step="0.01"
                    value={formData.dryAgedUpcharge}
                    onChange={(e) => setFormData({...formData, dryAgedUpcharge: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meatType">Meat Type</Label>
                  <Select value={formData.meatType} onValueChange={(value) => setFormData({...formData, meatType: value})}>
                    <SelectTrigger id="meatType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beef">Beef</SelectItem>
                      <SelectItem value="lamb">Lamb</SelectItem>
                      <SelectItem value="pork">Pork</SelectItem>
                      <SelectItem value="chicken">Chicken</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ranchOrigin">Ranch Origin</Label>
                  <Input
                    id="ranchOrigin"
                    value={formData.ranchOrigin}
                    onChange={(e) => setFormData({...formData, ranchOrigin: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="gradeLabel">Grade Label</Label>
                  <Input
                    id="gradeLabel"
                    value={formData.gradeLabel}
                    onChange={(e) => setFormData({...formData, gradeLabel: e.target.value})}
                    placeholder="e.g., GOLD Grade"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="genetics">Genetics</Label>
                  <Input
                    id="genetics"
                    value={formData.genetics}
                    onChange={(e) => setFormData({...formData, genetics: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="grainFinished">Grain Finished</Label>
                  <Input
                    id="grainFinished"
                    value={formData.grainFinished}
                    onChange={(e) => setFormData({...formData, grainFinished: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editing ? 'Update Product' : 'Create Product'}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  resetForm();
                  setDialogOpen(false);
                }}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="text-sm font-semibold text-gray-700 mb-4">
            Total Products: {products.length} (Auto-synced to Products & BBQ Builder)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Name</th>
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-left py-2 px-4">Weight</th>
                  <th className="text-left py-2 px-4">$/lb</th>
                  <th className="text-left py-2 px-4">Total Price</th>
                  <th className="text-left py-2 px-4">Wagyu</th>
                  <th className="text-left py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.gradeLabel}</div>
                    </td>
                    <td className="py-3 px-4 capitalize">{product.meatType}</td>
                    <td className="py-3 px-4 font-medium">{product.weight || 1.0} lb</td>
                    <td className="py-3 px-4">${product.basePrice}</td>
                    <td className="py-3 px-4 font-bold text-green-600">
                      ${((product.basePrice || 0) * (product.weight || 1.0)).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">${product.wagyuUpcharge}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UnifiedProductsManager;
