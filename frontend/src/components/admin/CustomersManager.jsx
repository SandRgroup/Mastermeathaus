import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { Search, Download, Trash2, User, Mail, Phone, MapPin } from 'lucide-react';
import axios from 'axios';

const CustomersManager = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = customers.filter(customer =>
        customer.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${backendUrl}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${backendUrl}/api/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      console.error('Failed to delete customer:', error);
      toast.error('Failed to delete customer');
    }
  };

  const exportToCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Address', 'City', 'State', 'ZIP', 'Source', 'Created At'];
    const csvData = filteredCustomers.map(c => [
      c.first_name || '',
      c.last_name || '',
      c.email || '',
      c.phone || '',
      c.address || '',
      c.city || '',
      c.state || '',
      c.zip || '',
      c.source || '',
      c.created_at || ''
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Customer data exported');
  };

  if (loading) {
    return <div className="loading">Loading customers...</div>;
  }

  return (
    <div className="customers-manager">
      <div className="manager-header">
        <h2 className="manager-title">
          <User size={24} />
          CRM - Customer Database
        </h2>
        <div className="manager-actions">
          <div className="search-box">
            <Search size={18} />
            <Input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <Button onClick={exportToCSV} className="export-btn">
            <Download size={18} />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="stats-row">
        <Card className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{customers.length}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Filtered Results</div>
          <div className="stat-value">{filteredCustomers.length}</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-label">Checkout Submissions</div>
          <div className="stat-value">{customers.filter(c => c.source === 'checkout').length}</div>
        </Card>
      </div>

      {filteredCustomers.length === 0 ? (
        <Card className="empty-state">
          <User size={48} style={{ opacity: 0.3 }} />
          <p>No customers found</p>
          <small>Customer data will appear here when users submit checkout forms</small>
        </Card>
      ) : (
        <div className="customers-grid">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="customer-card">
              <div className="customer-header">
                <div className="customer-avatar">
                  {(customer.first_name?.[0] || 'U').toUpperCase()}
                </div>
                <div className="customer-info">
                  <h3 className="customer-name">
                    {customer.first_name} {customer.last_name}
                  </h3>
                  <span className="customer-source">{customer.source || 'checkout'}</span>
                </div>
                <Button
                  onClick={() => handleDelete(customer.id)}
                  className="delete-btn-icon"
                  variant="ghost"
                >
                  <Trash2 size={18} />
                </Button>
              </div>

              <div className="customer-details">
                <div className="detail-row">
                  <Mail size={16} />
                  <span>{customer.email}</span>
                </div>
                {customer.phone && (
                  <div className="detail-row">
                    <Phone size={16} />
                    <span>{customer.phone}</span>
                  </div>
                )}
                {(customer.address || customer.city) && (
                  <div className="detail-row">
                    <MapPin size={16} />
                    <span>
                      {customer.address && `${customer.address}, `}
                      {customer.city && `${customer.city}, `}
                      {customer.state && `${customer.state} `}
                      {customer.zip}
                    </span>
                  </div>
                )}
                {customer.notes && (
                  <div className="customer-notes">
                    <strong>Notes:</strong> {customer.notes}
                  </div>
                )}
                <div className="customer-meta">
                  <small>Added: {new Date(customer.created_at).toLocaleDateString()}</small>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <style jsx>{`
        .customers-manager {
          padding: 2rem;
        }

        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .manager-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .manager-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .search-box {
          position: relative;
          width: 300px;
        }

        .search-box svg {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #8B0000;
          color: white;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1.5rem;
          text-align: center;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 0.5rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #8B0000;
        }

        .customers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .customer-card {
          padding: 1.5rem;
          transition: all 0.3s;
        }

        .customer-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .customer-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e5e5;
        }

        .customer-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8B0000, #C8A96A);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          font-weight: 700;
        }

        .customer-info {
          flex: 1;
        }

        .customer-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.25rem;
        }

        .customer-source {
          font-size: 0.75rem;
          color: #666;
          background: #f0f0f0;
          padding: 0.2rem 0.5rem;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .delete-btn-icon {
          color: #dc2626;
        }

        .customer-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: #444;
        }

        .detail-row svg {
          color: #8B0000;
          flex-shrink: 0;
        }

        .customer-notes {
          margin-top: 0.5rem;
          padding: 0.75rem;
          background: #f9f9f9;
          border-radius: 4px;
          font-size: 0.85rem;
        }

        .customer-meta {
          margin-top: 0.5rem;
          padding-top: 0.75rem;
          border-top: 1px solid #e5e5e5;
          color: #999;
          font-size: 0.8rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #666;
        }

        .empty-state p {
          margin: 1rem 0 0.5rem;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .loading {
          text-align: center;
          padding: 3rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default CustomersManager;
