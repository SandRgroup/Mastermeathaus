import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, 
  Users, UserCog, LogOut, Flame, Box, Tag,
  CreditCard, Sliders, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ProductsManager from '../../components/admin/ProductsManager';
import UnifiedProductsManager from '../../components/admin/UnifiedProductsManager';
import PackagesManager from '../../components/admin/PackagesManager';
import MembershipsManager from '../../components/admin/MembershipsManager';
import DiscountsManager from '../../components/admin/DiscountsManager';
import BoxesManager from '../../components/admin/BoxesManager';
import MenuManager from '../../components/admin/MenuManager';
import CustomersManager from '../../components/admin/CustomersManager';
import CustomersManagerCRM from '../../components/admin/CustomersManagerCRM';
import UnifiedSettingsManager from '../../components/admin/UnifiedSettingsManager';
import UnifiedCRMDashboard from '../../components/admin/UnifiedCRMDashboard';
import BbqPlansManager from '../../components/admin/BbqPlansManager';
import UnifiedBBQBuilderSettings from '../../components/admin/UnifiedBBQBuilderSettings';
import '../../styles/Admin.css';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'settings', label: '⚙️ Settings & Media', icon: UserCog },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'bundles', label: 'Bundles', icon: Package },
    { id: 'boxes', label: 'Steak Boxes', icon: Box },
    { id: 'packages', label: 'Cow Packages', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'customers-crm', label: '🛡️ CRM God Mode', icon: Shield },
    { id: 'bbq-plans', label: 'BBQ Plans', icon: Flame },
    { id: 'memberships', label: 'Memberships', icon: CreditCard },
    { id: 'discounts', label: 'Discounts', icon: Tag },
    { id: 'bbq-builder', label: 'BBQ Builder', icon: Sliders },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <UnifiedCRMDashboard />;
      case 'settings':
        return <UnifiedSettingsManager />;
      case 'products':
        return <ProductsManager />;
      case 'bundles':
        return <UnifiedProductsManager />;
      case 'boxes':
        return <BoxesManager />;
      case 'packages':
        return <PackagesManager />;
      case 'customers':
        return <CustomersManager />;
      case 'customers-crm':
        return <CustomersManagerCRM />;
      case 'bbq-plans':
        return <BbqPlansManager />;
      case 'memberships':
        return <MembershipsManager />;
      case 'discounts':
        return <DiscountsManager />;
      case 'menu':
        return <MenuManager />;
      case 'bbq-builder':
        return <UnifiedBBQBuilderSettings />;
      default:
        return <UnifiedCRMDashboard />;
    }
  };

  return (
    <div className="admin-container-sidebar">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <h1 className="brand-name">Masters Meat Haus</h1>
          <p className="brand-subtitle">CRM · CONSOLE</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-name">{user?.name || 'Admin'}</div>
            <div className="user-role">ADMIN</div>
          </div>
          <button onClick={handleLogout} className="logout-btn-sidebar">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main-content">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;
