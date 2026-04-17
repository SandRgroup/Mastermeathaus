import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/cms';
import { toast } from 'sonner';
import axios from 'axios';

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    description: '',
    price: '',
    originalPrice: '',
    image: '',
    cookingTemp: '',
    badge: '',
    badgeColor: 'gold',
    weight_unit: 'oz'
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await getProducts();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const { data } = await axios.post(
        `${backendUrl}/api/upload/image`,
        formData,
        { 
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        }
      );
      
      return data.url;
    } catch (error) {
      toast.error('Image upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      
      // Upload image file if one was selected
      if (imageFile) {
        const uploadedUrl = await handleImageUpload(imageFile);
        if (uploadedUrl) {
          payload.image = uploadedUrl;
        } else {
          toast.error('Image upload failed. Please try again.');
          return;
        }
      }
      
      if (!payload.originalPrice) delete payload.originalPrice;
      if (!payload.cookingTemp) delete payload.cookingTemp;
      if (!payload.badge) delete payload.badge;

      if (editing) {
        await updateProduct(editing.id || editing._id, payload);
        toast.success('Product updated');
      } else {
        await createProduct(payload);
        toast.success('Product created');
      }
      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Product save error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to save product';
      toast.error(errorMsg);
    }
  };

  const handleEdit = (product) => {
    setEditing(product);
    setFormData({
      name: product.name,
      grade: product.grade,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || '',
      image: product.image,
      cookingTemp: product.cookingTemp || '',
      badge: product.badge || '',
      badgeColor: product.badgeColor || 'gold',
      weight_unit: product.weight_unit || 'oz'
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    setEditing(null);
    setImageFile(null);
    setFormData({
      name: '',
      grade: '',
      description: '',
      price: '',
      originalPrice: '',
      image: '',
      cookingTemp: '',
      badge: '',
      badgeColor: 'gold',
      weight_unit: 'oz'
    });
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Products ({products.length})</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="add-btn">
              <Plus size={18} />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="dialog-content">
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
            </DialogHeader>
            
            {uploading && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mb-4">
                <p className="text-blue-400 text-sm flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Uploading image...
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="product-form">
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
                  <Label htmlFor="grade">Grade *</Label>
                  <Select 
                    value={formData.grade} 
                    onValueChange={(value) => setFormData({ ...formData, grade: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Prime">Prime</SelectItem>
                      <SelectItem value="Wagyu X">Wagyu X</SelectItem>
                      <SelectItem value="A5 Wagyu">A5 Wagyu</SelectItem>
                      <SelectItem value="Grass fed">Grass fed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-group full-width">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="$45.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="originalPrice">Original Price</Label>
                  <Input
                    id="originalPrice"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    placeholder="$55.00"
                  />
                </div>
                <div className="form-group full-width">
                  <Label htmlFor="image">Product Image</Label>
                  <div className="space-y-3">
                    {/* Image URL Input */}
                    <div>
                      <Label className="text-sm text-gray-400 mb-1">Option 1: Image URL</Label>
                      <Input
                        id="image"
                        value={formData.image}
                        onChange={(e) => {
                          setFormData({ ...formData, image: e.target.value });
                          setImageFile(null); // Clear file if URL is being used
                        }}
                        placeholder="https://example.com/image.jpg"
                        disabled={!!imageFile}
                      />
                    </div>
                    
                    {/* OR Separator */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 border-t border-gray-600"></div>
                      <span className="text-sm text-gray-400">OR</span>
                      <div className="flex-1 border-t border-gray-600"></div>
                    </div>
                    
                    {/* File Upload */}
                    <div>
                      <Label className="text-sm text-gray-400 mb-1">Option 2: Upload File</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          setImageFile(e.target.files[0]);
                          setFormData({ ...formData, image: '' }); // Clear URL if file is being used
                        }}
                        className="cursor-pointer"
                      />
                      {imageFile && (
                        <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded">
                          <div className="flex items-start gap-3">
                            <img 
                              src={URL.createObjectURL(imageFile)} 
                              alt="Preview" 
                              className="w-24 h-24 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="text-sm text-white font-medium">{imageFile.name}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {(imageFile.size / 1024).toFixed(1)} KB
                              </p>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setImageFile(null)}
                                className="mt-2 text-red-400 hover:text-red-300"
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Current Image Preview (when editing) */}
                    {editing && formData.image && !imageFile && (
                      <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded">
                        <Label className="text-sm text-gray-400 mb-2">Current Image</Label>
                        <img 
                          src={formData.image} 
                          alt="Current" 
                          className="w-32 h-32 object-cover rounded mt-2"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <Label htmlFor="cookingTemp">Cooking Temp</Label>
                  <Input
                    id="cookingTemp"
                    value={formData.cookingTemp}
                    onChange={(e) => setFormData({ ...formData, cookingTemp: e.target.value })}
                    placeholder="Medium-Rare (130-135°F)"
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="badge">Badge</Label>
                  <Input
                    id="badge"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="Best Seller"
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="badgeColor">Badge Color</Label>
                  <Select
                    value={formData.badgeColor}
                    onValueChange={(value) => setFormData({ ...formData, badgeColor: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select badge color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gold">🟡 Gold</SelectItem>
                      <SelectItem value="platinum">⚪ Platinum</SelectItem>
                      <SelectItem value="red">🔴 Red</SelectItem>
                      <SelectItem value="green">🟢 Green</SelectItem>
                      <SelectItem value="bronze">🟤 Bronze</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="form-group">
                  <Label htmlFor="weight_unit">Weight Unit *</Label>
                  <Select 
                    value={formData.weight_unit} 
                    onValueChange={(value) => setFormData({ ...formData, weight_unit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oz">Ounces (oz)</SelectItem>
                      <SelectItem value="lb">Pounds (lb)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="form-actions">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : (editing ? 'Update' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="products-grid">
        {products.map((product) => (
          <Card key={product.id || product._id} className="product-item">
            <img src={product.image} alt={product.name} className="product-img" />
            <div className="product-details">
              <div className="product-grade">{product.grade}</div>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="product-price-row">
                {product.originalPrice && <span className="original">{product.originalPrice}</span>}
                <span className="price">{product.price}</span>
              </div>
              <div className="product-actions">
                <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                  <Edit size={16} />
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id || product._id)}>
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductsManager;
