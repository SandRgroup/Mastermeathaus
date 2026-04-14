import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import ProductsManager from '../../components/admin/ProductsManager';
import MembershipsManager from '../../components/admin/MembershipsManager';
import { LogOut, Package, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import '../../styles/Admin.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-brand">
          <img 
            src="https://customer-assets.emergentagent.com/job_wagyu-vault/artifacts/ebh2rfed_IMG_2421.PNG"
            alt="Mastermeatbox"
            className="admin-logo"
          />
          <div>
            <h1>CMS Dashboard</h1>
            <p>Welcome, {user?.name || user?.email}</p>
          </div>
        </div>
        <Button onClick={handleLogout} className="logout-btn">
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
            <TabsTrigger value="memberships" className="tab-trigger">
              <CreditCard size={18} />
              Memberships
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <ProductsManager />
          </TabsContent>
          
          <TabsContent value="memberships">
            <MembershipsManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
