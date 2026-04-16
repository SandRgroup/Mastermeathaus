import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, Save, Menu, ExternalLink, GripVertical } from 'lucide-react';

const MenuManager = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/menu-items`);
      setMenuItems(response.data);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Save all items with current order
      for (let i = 0; i < menuItems.length; i++) {
        const item = menuItems[i];
        await axios.put(`${backendUrl}/api/menu-items/${item.id}`, {
          ...item,
          order: i
        }, { withCredentials: true });
      }
      toast.success('Menu items saved successfully!');
      fetchMenuItems();
    } catch (error) {
      console.error('Failed to save menu items:', error);
      toast.error('Failed to save changes');
    }
  };

  const addMenuItem = () => {
    const newItem = {
      id: `temp-${Date.now()}`,
      label: '',
      link: '',
      position: 'header',
      order: menuItems.length,
      enabled: true,
      isNew: true
    };
    setMenuItems([...menuItems, newItem]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...menuItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setMenuItems(newItems);
  };

  const deleteItem = async (index) => {
    const item = menuItems[index];
    
    if (item.isNew) {
      // Just remove from state if not saved yet
      const newItems = menuItems.filter((_, i) => i !== index);
      setMenuItems(newItems);
    } else {
      // Delete from backend
      if (!window.confirm(`Delete "${item.label}"?`)) return;
      
      try {
        await axios.delete(`${backendUrl}/api/menu-items/${item.id}`, {
          withCredentials: true
        });
        toast.success('Menu item deleted');
        fetchMenuItems();
      } catch (error) {
        console.error('Failed to delete:', error);
        toast.error('Failed to delete item');
      }
    }
  };

  const createNewItem = async (item) => {
    try {
      await axios.post(`${backendUrl}/api/menu-items`, {
        label: item.label,
        link: item.link,
        position: item.position,
        order: item.order,
        enabled: item.enabled
      }, { withCredentials: true });
      return true;
    } catch (error) {
      console.error('Failed to create item:', error);
      return false;
    }
  };

  const handleSaveAll = async () => {
    // First create new items
    const newItems = menuItems.filter(item => item.isNew);
    const existingItems = menuItems.filter(item => !item.isNew);

    for (const item of newItems) {
      if (!item.label || !item.link) {
        toast.error(`Please fill in label and link for all items`);
        return;
      }
      const success = await createNewItem(item);
      if (!success) {
        toast.error('Failed to save new items');
        return;
      }
    }

    // Then update existing items
    try {
      for (let i = 0; i < existingItems.length; i++) {
        const item = existingItems[i];
        await axios.put(`${backendUrl}/api/menu-items/${item.id}`, {
          label: item.label,
          link: item.link,
          position: item.position,
          order: i,
          enabled: item.enabled
        }, { withCredentials: true });
      }
      
      toast.success('All menu items saved!');
      fetchMenuItems();
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save changes');
    }
  };

  const presetLinks = [
    { label: 'Shop', link: '/' },
    { label: 'Membership', link: '/membership' },
    { label: 'Delivery', link: '/delivery' },
    { label: 'Reviews', link: '/reviews' },
    { label: 'Shop Boxes', link: '/shop-boxes' },
    { label: 'Build Your Box', link: '/build-box' }
  ];

  const applyPreset = (index, preset) => {
    updateItem(index, 'label', preset.label);
    updateItem(index, 'link', preset.link);
  };

  const groupedItems = {
    header: menuItems.filter(item => item.position === 'header'),
    hero: menuItems.filter(item => item.position === 'hero'),
    footer: menuItems.filter(item => item.position === 'footer')
  };

  if (loading) return <div className="p-8">Loading menu items...</div>;

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Menu & CTA Manager</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={addMenuItem} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
          <Button onClick={handleSaveAll}>
            <Save className="w-4 h-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Header Items */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          Header Navigation
        </h3>
        {groupedItems.header.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No header items yet. Click "Add Item" to start.
          </div>
        ) : (
          <div className="space-y-3">
            {groupedItems.header.map((item, idx) => {
              const globalIndex = menuItems.findIndex(i => i.id === item.id);
              return (
                <div key={item.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center text-gray-400">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="flex-1 grid grid-cols-5 gap-3">
                    <div className="col-span-2">
                      <Label className="text-xs">Label</Label>
                      <Input
                        placeholder="Shop"
                        value={item.label}
                        onChange={(e) => updateItem(globalIndex, 'label', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Link</Label>
                      <div className="flex gap-1">
                        <Input
                          placeholder="/shop or https://..."
                          value={item.link}
                          onChange={(e) => updateItem(globalIndex, 'link', e.target.value)}
                        />
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-gray-700">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Status</Label>
                      <Select
                        value={item.enabled ? 'enabled' : 'disabled'}
                        onValueChange={(value) => updateItem(globalIndex, 'enabled', value === 'enabled')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enabled">✓ Enabled</SelectItem>
                          <SelectItem value="disabled">✗ Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteItem(globalIndex)}
                    className="self-end"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Quick Presets for Header */}
        <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
          <p className="text-xs font-medium text-gray-700 mb-2">Quick Add Presets:</p>
          <div className="flex flex-wrap gap-2">
            {presetLinks.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const headerItem = {
                    id: `temp-${Date.now()}-${idx}`,
                    label: preset.label,
                    link: preset.link,
                    position: 'header',
                    order: menuItems.length,
                    enabled: true,
                    isNew: true
                  };
                  setMenuItems([...menuItems, headerItem]);
                }}
                className="px-3 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero CTA Items */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500"></span>
          Hero Call-to-Action Buttons
        </h3>
        {groupedItems.hero.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hero CTAs yet. Add items and set position to "hero".
          </div>
        ) : (
          <div className="space-y-3">
            {groupedItems.hero.map((item) => {
              const globalIndex = menuItems.findIndex(i => i.id === item.id);
              return (
                <div key={item.id} className="flex gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex-1 grid grid-cols-5 gap-3">
                    <div className="col-span-2">
                      <Label className="text-xs">CTA Text</Label>
                      <Input
                        placeholder="Get Started"
                        value={item.label}
                        onChange={(e) => updateItem(globalIndex, 'label', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Action Link</Label>
                      <Input
                        placeholder="/signup"
                        value={item.link}
                        onChange={(e) => updateItem(globalIndex, 'link', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Status</Label>
                      <Select
                        value={item.enabled ? 'enabled' : 'disabled'}
                        onValueChange={(value) => updateItem(globalIndex, 'enabled', value === 'enabled')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enabled">✓ Show</SelectItem>
                          <SelectItem value="disabled">✗ Hide</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteItem(globalIndex)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Items */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-500"></span>
          Footer Links
        </h3>
        {groupedItems.footer.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No footer links yet. Add items and set position to "footer".
          </div>
        ) : (
          <div className="space-y-3">
            {groupedItems.footer.map((item) => {
              const globalIndex = menuItems.findIndex(i => i.id === item.id);
              return (
                <div key={item.id} className="flex gap-3 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex-1 grid grid-cols-5 gap-3">
                    <div className="col-span-2">
                      <Label className="text-xs">Label</Label>
                      <Input
                        placeholder="Privacy Policy"
                        value={item.label}
                        onChange={(e) => updateItem(globalIndex, 'label', e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs">Link</Label>
                      <Input
                        placeholder="/privacy"
                        value={item.link}
                        onChange={(e) => updateItem(globalIndex, 'link', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Status</Label>
                      <Select
                        value={item.enabled ? 'enabled' : 'disabled'}
                        onValueChange={(value) => updateItem(globalIndex, 'enabled', value === 'enabled')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enabled">✓ Show</SelectItem>
                          <SelectItem value="disabled">✗ Hide</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteItem(globalIndex)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Position Selector for New Items */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
        <p className="text-sm text-gray-700 mb-2">
          <strong>Tip:</strong> When adding new items, they default to "Header Navigation". Change the position dropdown in each item to move them to Hero or Footer sections.
        </p>
        <div className="flex gap-4 text-xs text-gray-600 mt-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
            <span>Header = Top navigation bar</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span>Hero = Call-to-action buttons in hero section</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-500"></span>
            <span>Footer = Bottom page links</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManager;
