import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Package, Download } from 'lucide-react';

const PackagesManager = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    salePrice: '',
    regularPrice: '',
    items: []
  });
  const [itemInput, setItemInput] = useState({ name: '', quantity: '', unit: 'lbs' });

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchPackages();
    const interval = setInterval(fetchPackages, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/packages`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editing
        ? `${backendUrl}/api/packages/${editing.id}`
        : `${backendUrl}/api/packages`;
      
      const method = editing ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        salePrice: parseFloat(formData.salePrice),
        regularPrice: parseFloat(formData.regularPrice)
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success(editing ? 'Package updated!' : 'Package created!');
        await fetchPackages();
        resetForm();
        setDialogOpen(false);
      } else {
        const error = await response.text();
        toast.error(`Failed: ${error}`);
      }
    } catch (error) {
      console.error('Error saving package:', error);
      toast.error('Failed to save package');
    }
  };

  const handleEdit = (pkg) => {
    setEditing(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      salePrice: pkg.salePrice.toString(),
      regularPrice: pkg.regularPrice.toString(),
      items: pkg.items || []
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id, packageName) => {
    const confirmed = window.confirm(
      `⚠️ DELETE PACKAGE?\n\n` +
      `Package: ${packageName}\n` +
      `This will permanently delete this package.\n\n` +
      `Are you sure you want to continue?`
    );
    
    if (!confirmed) return;
    
    try {
      const response = await fetch(`${backendUrl}/api/packages/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast.success(`✓ Package "${packageName}" deleted successfully`);
        await fetchPackages();
      } else {
        const error = await response.text();
        toast.error(`Failed to delete: ${error}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete package');
    }
  };

  const addItem = () => {
    if (!itemInput.name || !itemInput.quantity) {
      toast.error('Please fill item name and quantity');
      return;
    }
    
    setFormData({
      ...formData,
      items: [...formData.items, { ...itemInput, quantity: parseFloat(itemInput.quantity) }]
    });
    setItemInput({ name: '', quantity: '', unit: 'lbs' });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      salePrice: '',
      regularPrice: '',
      items: []
    });
    setItemInput({ name: '', quantity: '', unit: 'lbs' });
    setEditing(null);
  };

  const calculateSavings = (regular, sale) => {
    const savings = parseFloat(regular) - parseFloat(sale);
    const percent = ((savings / parseFloat(regular)) * 100).toFixed(0);
    return { savings, percent };
  };

  if (loading) {
    return <div className="text-center py-8">Loading packages...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6" />
            Steak Box Bundles Manager
          </h2>
          <p className="text-gray-600">Manage Half/Quarter Cow packages & bundles</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={downloadPackagesCSV}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Download CSV ({packages.length})
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Package
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Package' : 'Add New Package'}</DialogTitle>
              </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Package Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g., Quarter Cow, Half Cow"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  placeholder="Describe what's included in this package"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="regularPrice">Regular Price ($) *</Label>
                  <Input
                    id="regularPrice"
                    type="number"
                    step="0.01"
                    value={formData.regularPrice}
                    onChange={(e) => setFormData({...formData, regularPrice: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="salePrice">Sale Price ($) *</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                    required
                  />
                </div>
              </div>

              {formData.regularPrice && formData.salePrice && (
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="text-sm text-green-900 font-semibold">
                    💰 Savings: ${calculateSavings(formData.regularPrice, formData.salePrice).savings.toFixed(2)} 
                    ({calculateSavings(formData.regularPrice, formData.salePrice).percent}% off)
                  </p>
                </div>
              )}

              <div className="border-t pt-4">
                <Label className="text-lg font-semibold mb-2 block">Package Contents</Label>
                
                <div className="grid grid-cols-12 gap-2 mb-2">
                  <Input
                    placeholder="Item name"
                    value={itemInput.name}
                    onChange={(e) => setItemInput({...itemInput, name: e.target.value})}
                    className="col-span-5"
                  />
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="Qty"
                    value={itemInput.quantity}
                    onChange={(e) => setItemInput({...itemInput, quantity: e.target.value})}
                    className="col-span-3"
                  />
                  <select
                    value={itemInput.unit}
                    onChange={(e) => setItemInput({...itemInput, unit: e.target.value})}
                    className="col-span-2 px-3 py-2 border rounded-md"
                  >
                    <option value="lbs">lbs</option>
                    <option value="oz">oz</option>
                    <option value="pcs">pcs</option>
                  </select>
                  <Button type="button" onClick={addItem} className="col-span-2">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span className="text-sm">
                        {item.quantity} {item.unit} {item.name}
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  {formData.items.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No items added yet</p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editing ? 'Update Package' : 'Create Package'}
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

      <div className="grid gap-4">
        {packages.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No packages yet. Create your first package!</p>
          </Card>
        ) : (
          packages.map((pkg) => {
            const { savings, percent } = calculateSavings(pkg.regularPrice, pkg.salePrice);
            return (
              <Card key={pkg.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{pkg.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{pkg.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(pkg)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(pkg.id, pkg.name)}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Regular Price</p>
                    <p className="text-lg font-semibold line-through text-gray-400">
                      ${pkg.regularPrice.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sale Price</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${pkg.salePrice.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">You Save</p>
                    <p className="text-lg font-semibold text-green-600">
                      ${savings.toFixed(2)} ({percent}%)
                    </p>
                  </div>
                </div>

                {pkg.items && pkg.items.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Package Contents:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {pkg.items.map((item, idx) => (
                        <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                          ✓ {item.quantity} {item.unit} {item.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PackagesManager;
