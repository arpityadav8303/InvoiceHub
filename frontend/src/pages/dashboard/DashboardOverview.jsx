import React, { useEffect, useState } from 'react';
import { getDashboardOverview } from '../../services/dashboardService';
import StatCard from '../../components/dashboard/StatCard';
import { Wallet, Clock, AlertTriangle, Users } from 'lucide-react';

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardOverview();
        if (res.success) setStats(res.data);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8">Loading Dashboard...</div>;

  return (
    <div className="ml-64 p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Business Overview</h1>
        <p className="text-gray-500">Welcome back! Here is what's happening today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={stats?.totalRevenue} 
          icon={Wallet} 
          colorClass="bg-green-500" 
          subtitle={`Collection Rate: ${stats?.paymentRate}%`}
        />
        <StatCard 
          title="Outstanding" 
          value={stats?.outstandingAmount} 
          icon={Clock} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title="Overdue Amount" 
          value={stats?.overdueAmount} 
          icon={AlertTriangle} 
          colorClass="bg-red-500" 
        />
        <StatCard 
          title="Active Clients" 
          value={stats?.totalClients?.active} 
          icon={Users} 
          colorClass="bg-purple-500" 
          subtitle={`${stats?.totalClients?.inactive} inactive clients`}
        />
      </div>

      <div className="mt-12 p-12 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400">
        Phase 2: Analytics and Charts Coming Soon
      </div>
    </div>
  );
};

export default DashboardOverview;