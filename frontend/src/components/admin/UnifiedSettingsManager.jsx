import React, { useState } from 'react';
import { Settings as SettingsIcon, Image, Menu, Sliders, Flame } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import MediaLibraryManager from './MediaLibraryManager';
import SiteImagesManager from './SiteImagesManager';
import MenuManager from './MenuManager';
import SiteSettingsManager from './SiteSettingsManager';
import BBQEventPortionsManager from './BBQEventPortionsManager';

const UnifiedSettingsManager = () => {
  const [activeTab, setActiveTab] = useState('media');

  const tabs = [
    { id: 'media', label: 'Media Library', icon: Image, component: MediaLibraryManager },
    { id: 'site-images', label: 'Site Images', icon: Image, component: SiteImagesManager },
    { id: 'menu', label: 'Menu & CTAs', icon: Menu, component: MenuManager },
    { id: 'bbq-portions', label: 'BBQ Portions', icon: Flame, component: BBQEventPortionsManager },
    { id: 'general', label: 'General Settings', icon: Sliders, component: SiteSettingsManager },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="unified-settings p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-[#C8A96A]" />
          Settings & Media
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Manage all website settings, images, and content in one place
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              className={`
                flex items-center gap-2 whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-gradient-to-r from-[#C8A96A] to-[#B8996A] text-black font-semibold' 
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="bg-[#0a0a0a] rounded-lg">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default UnifiedSettingsManager;
