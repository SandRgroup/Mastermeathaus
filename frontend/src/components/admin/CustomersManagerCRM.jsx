import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Shield, UserCog, Crown, Key, Ban, CheckCircle, History, Edit } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const CustomersManagerCRM = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(''); // 'override', 'upgrade', 'reset-password'
  const [auditLogs, setAuditLogs] = useState([]);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  const [overrideForm, setOverrideForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    membership_tier: null
  });

  const [newTier, setNewTier] = useState(0);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Failed to load customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const openOverrideDialog = (customer, action) => {
    setSelectedCustomer(customer);
    setActionType(action);
    
    if (action === 'override') {
      setOverrideForm({
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zip_code: customer.zip_code || '',
        membership_tier: customer.membership_tier
      });
    } else if (action === 'upgrade') {
      setNewTier(customer.membership_tier || 0);
    }
    
    setDialogOpen(true);
  };

  const handleAdminOverride = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${backendUrl}/api/admin/customers/${selectedCustomer.id}/override`,
        overrideForm,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success(`✓ Customer ${selectedCustomer.email} updated by admin`);
      setDialogOpen(false);
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update customer');
    }
  };

  const handleAdminUpgrade = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${backendUrl}/api/admin/customers/${selectedCustomer.id}/upgrade-membership`,
        null,
        {
          params: { new_tier: newTier },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const tierNames = ['Free', 'Select', 'Prime', 'Premium'];
      toast.success(`✓ Customer upgraded to ${tierNames[newTier]} tier`);
      setDialogOpen(false);
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upgrade membership');
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${backendUrl}/api/admin/customers/${selectedCustomer.id}/reset-password`,
        { new_password: newPassword },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success(`✓ Password reset for ${selectedCustomer.email}`);
      setDialogOpen(false);
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reset password');
    }
  };

  const handleRevokeAccess = async (customerId, customerEmail) => {
    if (!window.confirm(`⚠️ Are you sure you want to REVOKE access for ${customerEmail}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${backendUrl}/api/admin/customers/${customerId}/revoke-access`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success(`✓ Access revoked for ${customerEmail}`);
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to revoke access');
    }
  };

  const handleRestoreAccess = async (customerId, customerEmail) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${backendUrl}/api/admin/customers/${customerId}/restore-access`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success(`✓ Access restored for ${customerEmail}`);
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to restore access');
    }
  };

  const viewAuditLog = async (customerId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${backendUrl}/api/admin/customers/${customerId}/audit-log`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setAuditLogs(response.data.actions || []);
      setActionType('audit');
      setDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load audit log');
    }
  };

  const tierNames = ['Free', 'Select', 'Prime', 'Premium'];
  const tierColors = ['gray', 'blue', 'amber', 'red'];

  return (
    <div className="customers-crm-manager p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#C8A96A]" />
            CRM God Mode - Customers
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Full admin control over customer accounts
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-white text-center py-12">Loading customers...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {customers.map((customer) => (
            <Card key={customer.id} className="bg-white/5 border-white/10 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {customer.first_name} {customer.last_name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${tierColors[customer.membership_tier || 0]}-500/20 text-${tierColors[customer.membership_tier || 0]}-400 border border-${tierColors[customer.membership_tier || 0]}-500/30`}>
                      {tierNames[customer.membership_tier || 0]}
                    </span>
                    {customer.account_disabled && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
                        DISABLED
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">{customer.email}</p>
                  {customer.phone && <p className="text-gray-500 text-sm">{customer.phone}</p>}
                  {customer.address && (
                    <p className="text-gray-500 text-sm mt-1">
                      {customer.address}, {customer.city}, {customer.state} {customer.zip_code}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    onClick={() => openOverrideDialog(customer, 'override')}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Override
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                    onClick={() => openOverrideDialog(customer, 'upgrade')}
                  >
                    <Crown className="w-4 h-4 mr-1" />
                    Upgrade
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                    onClick={() => openOverrideDialog(customer, 'reset-password')}
                  >
                    <Key className="w-4 h-4 mr-1" />
                    Reset PW
                  </Button>

                  {customer.account_disabled ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                      onClick={() => handleRestoreAccess(customer.id, customer.email)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Restore
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => handleRevokeAccess(customer.id, customer.email)}
                    >
                      <Ban className="w-4 h-4 mr-1" />
                      Revoke
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-gray-300 hover:bg-gray-500/10"
                    onClick={() => viewAuditLog(customer.id)}
                  >
                    <History className="w-4 h-4 mr-1" />
                    Audit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Admin Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'override' && '🛡️ Admin Override Customer Data'}
              {actionType === 'upgrade' && '👑 Force Membership Upgrade'}
              {actionType === 'reset-password' && '🔑 Reset Customer Password'}
              {actionType === 'audit' && '📋 Audit Log'}
            </DialogTitle>
          </DialogHeader>

          {actionType === 'override' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">First Name</Label>
                  <Input
                    value={overrideForm.first_name}
                    onChange={(e) => setOverrideForm({ ...overrideForm, first_name: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Last Name</Label>
                  <Input
                    value={overrideForm.last_name}
                    onChange={(e) => setOverrideForm({ ...overrideForm, last_name: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-gray-300">Phone</Label>
                <Input
                  value={overrideForm.phone}
                  onChange={(e) => setOverrideForm({ ...overrideForm, phone: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-300">Address</Label>
                <Input
                  value={overrideForm.address}
                  onChange={(e) => setOverrideForm({ ...overrideForm, address: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">City</Label>
                  <Input
                    value={overrideForm.city}
                    onChange={(e) => setOverrideForm({ ...overrideForm, city: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">State</Label>
                  <Input
                    value={overrideForm.state}
                    onChange={(e) => setOverrideForm({ ...overrideForm, state: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">ZIP</Label>
                  <Input
                    value={overrideForm.zip_code}
                    onChange={(e) => setOverrideForm({ ...overrideForm, zip_code: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>

              <Button onClick={handleAdminOverride} className="w-full bg-blue-600 hover:bg-blue-500">
                Save Admin Override
              </Button>
            </div>
          )}

          {actionType === 'upgrade' && (
            <div className="space-y-4">
              <p className="text-gray-400">
                Current Tier: <span className="text-white font-semibold">{tierNames[selectedCustomer?.membership_tier || 0]}</span>
              </p>
              
              <div>
                <Label className="text-gray-300 mb-2">New Tier</Label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(parseInt(e.target.value))}
                  className="w-full p-2 bg-white/5 border border-white/20 rounded text-white"
                >
                  <option value={0}>Free</option>
                  <option value={1}>Select</option>
                  <option value={2}>Prime</option>
                  <option value={3}>Premium</option>
                </select>
              </div>

              <Button onClick={handleAdminUpgrade} className="w-full bg-amber-600 hover:bg-amber-500">
                Force Upgrade (Bypass Payment)
              </Button>
            </div>
          )}

          {actionType === 'reset-password' && (
            <div className="space-y-4">
              <p className="text-gray-400">
                Resetting password for: <span className="text-white font-semibold">{selectedCustomer?.email}</span>
              </p>
              
              <div>
                <Label className="text-gray-300">New Temporary Password</Label>
                <Input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter temporary password"
                  className="bg-white/5 border-white/20 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Customer will be required to change this on next login
                </p>
              </div>

              <Button onClick={handlePasswordReset} className="w-full bg-purple-600 hover:bg-purple-500">
                Reset Password
              </Button>
            </div>
          )}

          {actionType === 'audit' && (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {auditLogs.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No admin actions recorded yet</p>
              ) : (
                auditLogs.map((log, idx) => (
                  <Card key={idx} className="bg-white/5 border-white/10 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-white font-semibold">{log.action}</p>
                        <p className="text-gray-400 text-sm">by {log.admin_email}</p>
                        <p className="text-gray-500 text-xs">{new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        {Object.keys(log.changes).map((key) => (
                          <p key={key} className="text-xs text-gray-400">
                            {key}: {JSON.stringify(log.changes[key].from)} → {JSON.stringify(log.changes[key].to)}
                          </p>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomersManagerCRM;
