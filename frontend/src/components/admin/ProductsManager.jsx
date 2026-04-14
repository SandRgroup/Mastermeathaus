import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
    badge: ''
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
      if (!payload.originalPrice) delete payload.originalPrice;
      if (!payload.cookingTemp) delete payload.cookingTemp;
      if (!payload.badge) delete payload.badge;

      if (editing) {
        await updateProduct(editing._id, payload);
        toast.success('Product updated');
      } else {
        await createProduct(payload);
        toast.success('Product created');
      }
      setDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error('Failed to save product');
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
      badge: product.badge || ''
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
      badge: ''
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
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    required
                  />
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
                  <Label htmlFor="image">Image URL or Upload</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    disabled={!!imageFile}
                  />
                  <div className="image-upload-section">
                    <span>OR</span>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setImageFile(e.target.files[0]);
                        setFormData({ ...formData, image: '' });
                      }}
                    />
                    {imageFile && (
                      <div className="image-preview">
                        <img src={URL.createObjectURL(imageFile)} alt="Preview" />
                        <button type="button" onClick={() => setImageFile(null)}>Remove</button>
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
                    placeholder="Sale"
                  />
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
          <Card key={product._id} className="product-item">
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
                <Button size="sm" variant="destructive" onClick={() => handleDelete(product._id)}>
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
