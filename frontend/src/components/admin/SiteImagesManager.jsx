import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import axios from 'axios';
import { Image as ImageIcon, Upload, Trash2, Eye, RefreshCw, Save } from 'lucide-react';

const SiteImagesManager = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [images, setImages] = useState({});
  const [slots, setSlots] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [altText, setAltText] = useState('');

  useEffect(() => {
    fetchImages();
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/site-images/slots`);
      setSlots(response.data.slots || {});
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const fetchImages = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/site-images/`);
      const imagesMap = {};
      response.data.forEach(img => {
        imagesMap[img.slot] = img;
      });
      setImages(imagesMap);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching images:', error);
      setLoading(false);
    }
  };

  const handleFileUpload = async (slot, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/site-images/upload/${slot}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      toast.success(`Image uploaded for ${slots[slot]}`);
      fetchImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!selectedSlot || !urlInput) {
      toast.error('Please select a slot and enter an image URL');
      return;
    }

    try {
      await axios.post(`${backendUrl}/api/site-images/`, {
        slot: selectedSlot,
        url: urlInput,
        alt_text: altText || slots[selectedSlot]
      });
      toast.success(`Image URL saved for ${slots[selectedSlot]}`);
      fetchImages();
      setUrlInput('');
      setAltText('');
      setSelectedSlot('');
    } catch (error) {
      console.error('Error saving image URL:', error);
      toast.error('Failed to save image URL');
    }
  };

  const handleDelete = async (slot) => {
    if (!window.confirm(`Delete image for ${slots[slot]}? This will revert to default.`)) {
      return;
    }

    try {
      await axios.delete(`${backendUrl}/api/site-images/${slot}`);
      toast.success(`Image deleted for ${slots[slot]}`);
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <RefreshCw className="animate-spin" size={32} />
        <p>Loading images...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.875rem', 
          fontWeight: '700', 
          color: '#C8A96A',
          marginBottom: '0.5rem'
        }}>
          Site Images Manager
        </h2>
        <p style={{ color: '#A89F8F', fontSize: '0.875rem' }}>
          Upload or replace images used throughout the website
        </p>
      </div>

      {/* URL Input Section */}
      <Card style={{ padding: '1.5rem', marginBottom: '2rem', background: '#1a1a1a', border: '1px solid #C8A96A20' }}>
        <Label style={{ 
          display: 'block', 
          marginBottom: '1rem', 
          fontWeight: '600',
          color: '#C8A96A',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.1em'
        }}>
          Add Image by URL
        </Label>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: '1rem', marginBottom: '1rem' }}>
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            style={{
              background: '#0e0e0e',
              border: '1px solid #C8A96A40',
              color: '#F5F1E8',
              padding: '0.5rem',
              borderRadius: '0.25rem'
            }}
          >
            <option value="">Select Slot</option>
            {Object.entries(slots).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <Input
            placeholder="Image URL (https://...)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            style={{ background: '#0e0e0e', border: '1px solid #C8A96A40', color: '#F5F1E8' }}
          />

          <Input
            placeholder="Alt text (optional)"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            style={{ background: '#0e0e0e', border: '1px solid #C8A96A40', color: '#F5F1E8' }}
          />

          <Button
            onClick={handleUrlSubmit}
            style={{ background: '#C8A96A', color: '#000', fontWeight: '600' }}
          >
            <Save size={16} style={{ marginRight: '0.5rem' }} />
            Save
          </Button>
        </div>
      </Card>

      {/* Images Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {Object.entries(slots).map(([slot, label]) => {
          const currentImage = images[slot];
          
          return (
            <Card 
              key={slot}
              style={{ 
                padding: '1.5rem',
                background: '#1a1a1a',
                border: currentImage ? '1px solid #C8A96A40' : '1px solid #333'
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <Label style={{ 
                  display: 'block',
                  fontWeight: '600',
                  color: '#C8A96A',
                  fontSize: '0.875rem',
                  marginBottom: '0.25rem'
                }}>
                  {label}
                </Label>
                <div style={{ fontSize: '0.75rem', color: '#A89F8F' }}>
                  Slot: <code style={{ color: '#C8A96A' }}>{slot}</code>
                </div>
              </div>

              {/* Image Preview */}
              {currentImage ? (
                <div style={{ 
                  marginBottom: '1rem',
                  position: 'relative',
                  paddingTop: '56.25%', // 16:9 aspect ratio
                  background: '#0e0e0e',
                  borderRadius: '0.25rem',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={currentImage.url} 
                    alt={currentImage.alt_text || label}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #666;">Failed to load image</div>';
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  height: '150px',
                  background: '#0e0e0e',
                  border: '2px dashed #333',
                  borderRadius: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  color: '#666'
                }}>
                  <ImageIcon size={32} />
                </div>
              )}

              {/* Upload Button */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <label style={{ flex: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileUpload(slot, e.target.files[0])}
                    disabled={uploading}
                  />
                  <Button
                    as="span"
                    style={{ 
                      width: '100%',
                      background: '#C8A96A',
                      color: '#000',
                      cursor: uploading ? 'not-allowed' : 'pointer'
                    }}
                    disabled={uploading}
                  >
                    <Upload size={16} style={{ marginRight: '0.5rem' }} />
                    {uploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </label>

                {currentImage && (
                  <>
                    <Button
                      onClick={() => window.open(currentImage.url, '_blank')}
                      style={{ background: '#333', color: '#F5F1E8' }}
                    >
                      <Eye size={16} />
                    </Button>
                    <Button
                      onClick={() => handleDelete(slot)}
                      style={{ background: '#6A1A21', color: '#F5F1E8' }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </>
                )}
              </div>

              {currentImage && (
                <div style={{ 
                  marginTop: '0.75rem', 
                  fontSize: '0.75rem', 
                  color: '#666',
                  borderTop: '1px solid #333',
                  paddingTop: '0.75rem'
                }}>
                  <div>Uploaded: {new Date(currentImage.uploaded_at).toLocaleDateString()}</div>
                  {currentImage.file_size && (
                    <div>Size: {(currentImage.file_size / 1024).toFixed(1)} KB</div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SiteImagesManager;
