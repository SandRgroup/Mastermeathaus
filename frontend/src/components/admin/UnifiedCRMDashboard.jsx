import React, { useEffect, useState } from 'react';
import { Card } from '../ui/card';
import { Users, Sparkles, TrendingUp, DollarSign, Flame } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const UnifiedCRMDashboard = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalBbqPlans: 0,
    newBbqPlans: 0,
    totalBbqRevenue: 0,
    avgBbqPlanValue: 0,
    recentBbqPlans: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch customers
      const customersRes = await axios.get(`${backendUrl}/api/customers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch BBQ plans
      const bbqPlansRes = await axios.get(`${backendUrl}/api/bbq-plans`, {
        withCredentials: true
      });
      
      const bbqPlans = bbqPlansRes.data || [];
      const newPlans = bbqPlans.filter(p => p.status === 'new' || !p.status);
      const totalRevenue = bbqPlans.reduce((sum, p) => sum + (p.total_price || 0), 0);
      const avgValue = bbqPlans.length > 0 ? totalRevenue / bbqPlans.length : 0;
      
      setStats({
        totalCustomers: customersRes.data?.length || 0,
        totalBbqPlans: bbqPlans.length,
        newBbqPlans: newPlans.length,
        totalBbqRevenue: totalRevenue,
        avgBbqPlanValue: avgValue,
        recentBbqPlans: bbqPlans.slice(0, 5)
      });
    } catch (error) {
      console.error('Failed to fetch CRM stats:', error);
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="unified-crm-dashboard">
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">
            <Users size={24} />
            CRM & Lead Management Dashboard
          </h2>
          <p className="dashboard-subtitle">
            Comprehensive view of your customer database and BBQ plan leads
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <Card className="stat-card customers">
          <div className="stat-icon">
            <Users size={28} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCustomers}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </Card>

        <Card className="stat-card bbq-plans">
          <div className="stat-icon">
            <Sparkles size={28} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalBbqPlans}</div>
            <div className="stat-label">BBQ Plan Leads</div>
            {stats.newBbqPlans > 0 && (
              <div className="stat-badge">{stats.newBbqPlans} new</div>
            )}
          </div>
        </Card>

        <Card className="stat-card revenue">
          <div className="stat-icon">
            <DollarSign size={28} />
          </div>
          <div className="stat-content">
            <div className="stat-value">${stats.totalBbqRevenue.toFixed(0)}</div>
            <div className="stat-label">Total BBQ Pipeline</div>
          </div>
        </Card>

        <Card className="stat-card avg-value">
          <div className="stat-icon">
            <TrendingUp size={28} />
          </div>
          <div className="stat-content">
            <div className="stat-value">${stats.avgBbqPlanValue.toFixed(0)}</div>
            <div className="stat-label">Avg BBQ Plan Value</div>
          </div>
        </Card>
      </div>

      {/* Recent BBQ Plans */}
      {stats.recentBbqPlans.length > 0 && (
        <Card className="recent-section">
          <div className="section-header">
            <div className="section-title">
              <Flame size={20} />
              <h3>Recent BBQ Plan Leads</h3>
            </div>
            <span className="section-action">View All in BBQ Plans tab →</span>
          </div>
          
          <div className="recent-list">
            {stats.recentBbqPlans.map((plan) => (
              <div key={plan.id} className="recent-item">
                <div className="recent-avatar">
                  {(plan.lead?.first_name?.[0] || 'U').toUpperCase()}
                </div>
                <div className="recent-info">
                  <div className="recent-name">{plan.lead?.first_name}</div>
                  <div className="recent-details">
                    {plan.people} people · {plan.event_type}
                  </div>
                </div>
                <div className="recent-meta">
                  <div className="recent-price">${plan.total_price.toFixed(0)}</div>
                  <div className="recent-status status-new">
                    {plan.status || 'new'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Info Cards */}
      <div className="info-grid">
        <Card className="info-card">
          <div className="info-icon customers-icon">
            <Users size={24} />
          </div>
          <h4>Customer Database</h4>
          <p>
            View and manage all customers from checkout submissions. 
            Export data, search records, and track customer sources.
          </p>
          <div className="info-action">Go to CRM tab</div>
        </Card>

        <Card className="info-card">
          <div className="info-icon bbq-icon">
            <Sparkles size={24} />
          </div>
          <h4>BBQ Plan Leads</h4>
          <p>
            Manage AI-generated BBQ plans from the landing page. 
            Update status, add notes, and convert leads to bookings.
          </p>
          <div className="info-action">Go to BBQ Plans tab</div>
        </Card>
      </div>

      <style jsx>{`
        .unified-crm-dashboard {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: 2rem;
        }

        .dashboard-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        .dashboard-subtitle {
          color: #666;
          font-size: 0.95rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1.75rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
          color: #666;
        }

        .stat-card.customers .stat-icon {
          background: linear-gradient(135deg, #8B0000, #C8A96A);
          color: white;
        }

        .stat-card.bbq-plans .stat-icon {
          background: linear-gradient(135deg, #C8A96A, #8B0000);
          color: white;
        }

        .stat-card.revenue .stat-icon {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .stat-card.avg-value .stat-icon {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #666;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-badge {
          display: inline-block;
          margin-top: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: #fef3c7;
          color: #92400e;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 12px;
        }

        .recent-section {
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f0f0f0;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .section-title h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .section-title svg {
          color: #C8A96A;
        }

        .section-action {
          font-size: 0.85rem;
          color: #8B0000;
          font-weight: 600;
          cursor: pointer;
        }

        .section-action:hover {
          text-decoration: underline;
        }

        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .recent-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f9f9f9;
          border-radius: 8px;
          transition: background 0.2s;
        }

        .recent-item:hover {
          background: #f0f0f0;
        }

        .recent-avatar {
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

        .recent-info {
          flex: 1;
        }

        .recent-name {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 0.25rem;
        }

        .recent-details {
          font-size: 0.85rem;
          color: #666;
        }

        .recent-meta {
          text-align: right;
        }

        .recent-price {
          font-size: 1.25rem;
          font-weight: 700;
          color: #C8A96A;
          margin-bottom: 0.25rem;
        }

        .recent-status {
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .status-new {
          background: #fef3c7;
          color: #92400e;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .info-card {
          padding: 2rem;
          text-align: center;
        }

        .info-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .customers-icon {
          background: linear-gradient(135deg, #8B0000, #C8A96A);
          color: white;
        }

        .bbq-icon {
          background: linear-gradient(135deg, #C8A96A, #8B0000);
          color: white;
        }

        .info-card h4 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 1rem;
        }

        .info-card p {
          color: #666;
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .info-action {
          color: #8B0000;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
        }

        .info-action:hover {
          text-decoration: underline;
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

export default UnifiedCRMDashboard;
