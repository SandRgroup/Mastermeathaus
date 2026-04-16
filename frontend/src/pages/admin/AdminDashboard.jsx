import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import ProductsManager from '../../components/admin/ProductsManager';
import UnifiedProductsManager from '../../components/admin/UnifiedProductsManager';
import MembershipsManager from '../../components/admin/MembershipsManager';
import DiscountsManager from '../../components/admin/DiscountsManager';
import BoxesManager from '../../components/admin/BoxesManager';
import MenuManager from '../../components/admin/MenuManager';
import CustomersManager from '../../components/admin/CustomersManager';
import SiteSettingsManager from '../../components/admin/SiteSettingsManager';
import BBQSettingsManager from '../../components/admin/BBQSettingsManager';
import BBQProductsManager from '../../components/admin/BBQProductsManager';
import { LogOut, Package, CreditCard, Tag, Box, Menu, Users, Settings, Flame, Beef } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/Admin.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <Button onClick={handleLogout} variant="outline" className="logout-btn">
          <LogOut size={18} />
          Logout
        </Button>
      </div>

      <div className="admin-content">
        <Tabs defaultValue="products" className="admin-tabs">
          <TabsList className="tabs-list">
            <TabsTrigger value="products" className="tab-trigger">
              <Package size={18} />
              Products
            </TabsTrigger>
            <TabsTrigger value="boxes" className="tab-trigger">
              <Box size={18} />
              Steak Boxes
            </TabsTrigger>
            <TabsTrigger value="memberships" className="tab-trigger">
              <CreditCard size={18} />
              Memberships
            </TabsTrigger>
            <TabsTrigger value="discounts" className="tab-trigger">
              <Tag size={18} />
              Discounts
            </TabsTrigger>
            <TabsTrigger value="menu" className="tab-trigger">
              <Menu size={18} />
              Menu/CTAs
            </TabsTrigger>
            <TabsTrigger value="customers" className="tab-trigger">
              <Users size={18} />
              CRM
            </TabsTrigger>
            <TabsTrigger value="settings" className="tab-trigger">
              <Settings size={18} />
              Website
            </TabsTrigger>
            <TabsTrigger value="bbq" className="tab-trigger">
              <Flame size={18} />
              BBQ Calculator
            </TabsTrigger>
            <TabsTrigger value="bbq-products" className="tab-trigger">
              <Beef size={18} />
              BBQ Meats
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <UnifiedProductsManager />
          </TabsContent>
          
          <TabsContent value="boxes">
            <BoxesManager />
          </TabsContent>
          
          <TabsContent value="memberships">
            <MembershipsManager />
          </TabsContent>
          
          <TabsContent value="discounts">
            <DiscountsManager />
          </TabsContent>
          
          <TabsContent value="menu">
            <MenuManager />
          </TabsContent>
          
          <TabsContent value="customers">
            <CustomersManager />
          </TabsContent>
          
          <TabsContent value="settings">
            <SiteSettingsManager />
          </TabsContent>
          
          <TabsContent value="bbq">
            <BBQSettingsManager />
          </TabsContent>
          
          <TabsContent value="bbq-products">
            <BBQProductsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
