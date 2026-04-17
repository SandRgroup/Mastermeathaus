import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Upload, Trash2, Search, Image as ImageIcon, HardDrive, X, Copy, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import axios from 'axios';

const MediaLibraryManager = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchMedia();
    fetchStats();
  }, []);

  const fetchMedia = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/media/library`, {
        withCredentials: true
      });
      setMedia(response.data.files || []);
    } catch (error) {
      console.error('Failed to load media:', error);
      toast.error('Failed to load media library');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/media/stats`, {
        withCredentials: true
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        await axios.post(`${backendUrl}/api/media/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true
        });
      }

      toast.success(`✓ ${files.length} file(s) uploaded successfully!`);
      fetchMedia();
      fetchStats();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload files');
    } finally {
      setUploading(false);
      event.target.value = ''; // Reset input
    }
  };

  const handleDelete = async (mediaId, filename) => {
    if (!window.confirm(`⚠️ Delete "${filename}"?\n\nThis cannot be undone.`)) {
      return;
    }

    try {
      const response = await axios.delete(`${backendUrl}/api/media/library/${mediaId}`, {
        withCredentials: true
      });

      if (response.data.warning) {
        // File is being used
        const forceDelete = window.confirm(
          `⚠️ WARNING!\n\nThis image is used in ${response.data.used_in.length} places:\n${response.data.used_in.join('\n')}\n\nForce delete anyway? (May break images on website)`
        );

        if (forceDelete) {
          await axios.delete(`${backendUrl}/api/media/library/${mediaId}/force`, {
            withCredentials: true
          });
          toast.success('✓ Image force deleted');
        } else {
          return;
        }
      } else {
        toast.success('✓ Image deleted');
      }

      fetchMedia();
      fetchStats();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete file');
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success('✓ URL copied to clipboard!');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const filteredMedia = media.filter(file =>
    file.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="media-library-manager p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-[#C8A96A]" />
            Media Library
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Centralized image storage for products and website
          </p>
        </div>

        {/* Upload Button */}
        <div>
          <input
            type="file"
            id="media-upload"
            multiple
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <label htmlFor="media-upload">
            <Button 
              as="span" 
              className="bg-gradient-to-r from-[#C8A96A] to-[#B8996A] hover:from-[#B8996A] hover:to-[#A8896A] text-black font-semibold cursor-pointer"
              disabled={uploading}
            >
              {uploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Images
                </>
              )}
            </Button>
          </label>
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/5 border-white/10 p-4">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.total_files}</p>
                <p className="text-xs text-gray-400">Total Images</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-4">
            <div className="flex items-center gap-3">
              <HardDrive className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.total_size_mb} MB</p>
                <p className="text-xs text-gray-400">Storage Used</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-4">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-8 h-8 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.unused_files}</p>
                <p className="text-xs text-gray-400">Unused</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 p-4">
            <div className="flex items-center gap-3">
              <ImageIcon className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-white">{stats.total_files - stats.unused_files}</p>
                <p className="text-xs text-gray-400">In Use</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by filename..."
            className="pl-10 bg-white/5 border-white/20 text-white"
          />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="text-white text-center py-12">Loading media...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((file) => (
            <Card
              key={file.id}
              className="bg-white/5 border-white/10 p-0 overflow-hidden group hover:ring-2 hover:ring-[#C8A96A] transition-all cursor-pointer"
              onClick={() => setSelectedImage(file)}
            >
              {/* Image */}
              <div className="aspect-square bg-black/40 relative">
                <img
                  src={file.url}
                  alt={file.original_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300?text=Error';
                  }}
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyUrl(file.url);
                    }}
                  >
                    {copiedUrl === file.url ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file.id, file.original_name);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Info */}
              <div className="p-2">
                <p className="text-white text-xs truncate" title={file.original_name}>
                  {file.original_name}
                </p>
                <p className="text-gray-500 text-xs">
                  {(file.file_size / 1024).toFixed(1)} KB
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredMedia.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-400">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-2">No images in library</p>
          <p className="text-sm">Upload your first image to get started!</p>
        </div>
      )}

      {/* Image Detail Dialog */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Image Details</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Preview */}
              <div className="bg-black/40 rounded p-4">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.original_name}
                  className="w-full max-h-96 object-contain rounded"
                />
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400 mb-1">Filename</p>
                  <p className="text-white font-mono">{selectedImage.original_name}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Size</p>
                  <p className="text-white">{(selectedImage.file_size / 1024).toFixed(2)} KB</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Uploaded By</p>
                  <p className="text-white">{selectedImage.uploaded_by}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Uploaded</p>
                  <p className="text-white">{new Date(selectedImage.uploaded_at).toLocaleDateString()}</p>
                </div>
              </div>

              {/* URL */}
              <div>
                <p className="text-gray-400 mb-2">Image URL</p>
                <div className="flex gap-2">
                  <Input
                    value={selectedImage.url}
                    readOnly
                    className="bg-black/40 border-white/20 text-white font-mono text-sm"
                  />
                  <Button
                    onClick={() => copyUrl(selectedImage.url)}
                    className="bg-blue-600 hover:bg-blue-500"
                  >
                    {copiedUrl === selectedImage.url ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Used In */}
              {selectedImage.used_in && selectedImage.used_in.length > 0 && (
                <div>
                  <p className="text-gray-400 mb-2">Used In</p>
                  <div className="bg-black/40 rounded p-3">
                    {selectedImage.used_in.map((location, idx) => (
                      <p key={idx} className="text-sm text-white">{location}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <Button
                  onClick={() => {
                    copyUrl(selectedImage.url);
                    toast.success('URL copied! You can now paste it into products or site images.');
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-500"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </Button>
                <Button
                  onClick={() => {
                    handleDelete(selectedImage.id, selectedImage.original_name);
                    setSelectedImage(null);
                  }}
                  className="bg-red-600 hover:bg-red-500"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MediaLibraryManager;
