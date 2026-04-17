import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Plus, Save, X, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/cms';
import { toast } from 'sonner';
import axios from 'axios';

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

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

      // Use withCredentials: true to send httpOnly cookies for authentication
      // The backend uses httpOnly cookies (access_token) for auth, not localStorage
      const response = await axios.post(
        `${backendUrl}/api/upload/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );

      if (response.data && response.data.url) {
        return response.data.url;
      } else {
        console.error('Invalid response:', response.data);
        toast.error('Upload failed: Invalid server response');
        return null;
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        // Optionally redirect to login
        window.location.href = '/admin/login';
      } else {
        toast.error(`Upload failed: ${error.response?.data?.detail || error.message}`);
      }
      return null;
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (product) => {
    setEditingId(product.id || product._id);
    setEditForm({
      name: product.name || '',
      grade: product.grade || '',
      description: product.description || '',
      price: product.price || '',
      image: product.image || ''
    });
    setImagePreview(null);
    setImageFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setImageFile(null);
    setImagePreview(null);
  };

  const saveEdit = async (productId) => {
    try {
      let payload = { ...editForm };

      // Upload image if file selected
      if (imageFile) {
        toast.info('Uploading image...');
        const uploadedUrl = await handleImageUpload(imageFile);
        if (uploadedUrl) {
          payload.image = uploadedUrl;
          toast.success('Image uploaded!');
        } else {
          toast.error('Image upload failed. Saving without new image.');
        }
      }

      await updateProduct(productId, payload);
      toast.success('✓ Product updated successfully!');
      
      setEditingId(null);
      setEditForm({});
      setImageFile(null);
      setImagePreview(null);
      fetchProducts();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleFileSelect = (file) => {
    if (file) {
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setEditForm({ ...editForm, image: '' }); // Clear URL input when file is selected
    }
  };

  const handleDelete = async (productId, productName) => {
    if (!window.confirm(`⚠️ Delete "${productName}"?\n\nThis cannot be undone.`)) {
      return;
    }

    try {
      await deleteProduct(productId);
      toast.success(`✓ "${productName}" deleted`);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-white text-center py-12">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="products-manager p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          Products Manager
        </h2>
        <p className="text-sm text-gray-400">
          Click Edit to change product details inline
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => {
          const isEditing = editingId === (product.id || product._id);
          const productId = product.id || product._id;

          return (
            <Card
              key={productId}
              data-testid={`product-card-${productId}`}
              className={`
                bg-white/5 border-white/10 p-4 transition-all
                ${isEditing ? 'ring-2 ring-[#C8A96A] shadow-lg shadow-[#C8A96A]/20' : ''}
              `}
            >
              {/* Product Image */}
              <div className="relative mb-3">
                {isEditing ? (
                  <div className="space-y-2">
                    {/* Image Preview */}
                    <div className="aspect-square bg-black/40 rounded overflow-hidden border-2 border-white/20">
                      <img
                        src={imagePreview || editForm.image || product.image || 'https://images.unsplash.com/photo-1588347818036-4c0b583d9da5?w=300'}
                        alt={editForm.name || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1588347818036-4c0b583d9da5?w=300';
                        }}
                      />
                    </div>
                    
                    {/* Image URL Input */}
                    <div>
                      <Label className="text-xs text-gray-400 mb-1">Image URL</Label>
                      <Input
                        value={editForm.image}
                        onChange={(e) => {
                          setEditForm({ ...editForm, image: e.target.value });
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        placeholder="Paste image URL or upload below"
                        disabled={!!imageFile}
                        className="bg-black/40 border-white/20 text-white text-xs h-8"
                      />
                    </div>
                    
                    {/* OR Separator */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 border-t border-gray-600"></div>
                      <span className="text-xs text-gray-500">OR</span>
                      <div className="flex-1 border-t border-gray-600"></div>
                    </div>
                    
                    {/* File Upload */}
                    <div>
                      <Label className="text-xs text-gray-400 mb-1">Upload from Computer</Label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e.target.files[0])}
                        className="w-full text-xs text-gray-400 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-[#C8A96A] file:text-black file:cursor-pointer file:font-semibold hover:file:bg-[#B8996A]"
                      />
                      {imageFile && (
                        <div className="mt-2 p-2 bg-green-500/10 border border-green-500/30 rounded">
                          <p className="text-xs text-green-400 flex items-center gap-1">
                            <span>✓</span>
                            <span className="font-semibold">{imageFile.name}</span>
                            <span className="text-gray-500">({(imageFile.size / 1024).toFixed(1)} KB)</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square bg-black/40 rounded overflow-hidden">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1588347818036-4c0b583d9da5?w=300'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1588347818036-4c0b583d9da5?w=300';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Product Badge */}
              <div className="mb-2">
                {isEditing ? (
                  <Input
                    value={editForm.grade}
                    onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                    placeholder="Grade (e.g., CERTIFIED ANGUS BEEF)"
                    className="bg-black/40 border-white/20 text-[#C8A96A] text-xs h-7"
                  />
                ) : (
                  <span className="text-xs text-[#C8A96A] uppercase tracking-wider">
                    {product.grade}
                  </span>
                )}
              </div>

              {/* Product Name */}
              <div className="mb-2">
                {isEditing ? (
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Product Name"
                    className="bg-black/40 border-white/20 text-white font-semibold h-9"
                  />
                ) : (
                  <h3 className="text-white font-semibold text-lg">{product.name}</h3>
                )}
              </div>

              {/* Description */}
              <div className="mb-3">
                {isEditing ? (
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Description"
                    className="bg-black/40 border-white/20 text-gray-300 text-sm min-h-[60px]"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="mb-4">
                {isEditing ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    placeholder="Price"
                    className="bg-black/40 border-white/20 text-white font-bold h-9"
                  />
                ) : (
                  <p className="text-white font-bold text-xl">
                    ${parseFloat(product.price).toFixed(2)}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={() => saveEdit(productId)}
                      disabled={uploading}
                      data-testid={`product-save-btn-${productId}`}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white h-9"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {uploading ? 'Uploading...' : 'Save'}
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      variant="ghost"
                      data-testid={`product-cancel-btn-${productId}`}
                      className="text-gray-400 hover:text-white hover:bg-white/10 h-9"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => startEdit(product)}
                      variant="ghost"
                      data-testid={`product-edit-btn-${productId}`}
                      className="flex-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-9"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(productId, product.name)}
                      variant="ghost"
                      data-testid={`product-delete-btn-${productId}`}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-9"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>No products yet. Add your first product!</p>
        </div>
      )}
    </div>
  );
};

export default ProductsManager;
