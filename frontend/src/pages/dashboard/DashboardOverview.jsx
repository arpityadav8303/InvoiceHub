import React, { useEffect, useState } from 'react';
import { getDashboardOverview } from '../../services/dashboardService';
import StatCard from '../../components/dashboard/StatCard';
import { Wallet, Clock, AlertTriangle, Users } from 'lucide-react';

import RevenueChart from '../../components/dashboard/RevenueChart';
import ClientGrowthChart from '../../components/dashboard/ClientGrowthChart';
import PaymentStatusChart from '../../components/dashboard/PaymentStatusChart';
import RecentActivity from '../../components/dashboard/RecentActivity';
import UpcomingInvoices from '../../components/dashboard/UpcomingInvoices';

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
    <div className="ml-0 p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Business Overview</h1>
        <p className="text-gray-500">Welcome back! Here is what's happening today.</p>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <RevenueChart data={stats?.revenueData} />
        </div>
        <div>
          <PaymentStatusChart stats={stats?.invoiceStats} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ClientGrowthChart data={stats?.clientGrowthData} />
        <RecentActivity data={stats?.recentActivity} />
        <UpcomingInvoices data={stats?.upcomingInvoices} />
      </div>
    </div>
  );
};

export default DashboardOverview;