import React, { useEffect, useState } from 'react';
import { getDashboardStats, getDashboardCharts, getDashboardActivity } from '../../services/dashboardService';
import StatCard from '../../components/dashboard/StatCard';
import { Wallet, Clock, AlertTriangle, Users } from 'lucide-react';

import RevenueChart from '../../components/dashboard/RevenueChart';
import ClientGrowthChart from '../../components/dashboard/ClientGrowthChart';
import PaymentStatusChart from '../../components/dashboard/PaymentStatusChart';
import RecentActivity from '../../components/dashboard/RecentActivity';
import UpcomingInvoices from '../../components/dashboard/UpcomingInvoices';

const DashboardOverview = () => {
  // Independent States for Progressive Loading
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activity, setActivity] = useState(null);

  const [statsLoading, setStatsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Stats (Fastest)
    getDashboardStats()
      .then(res => {
        if (res.success) setStats(res.data);
      })
      .catch(err => console.error("Stats error:", err))
      .finally(() => setStatsLoading(false));

    // 2. Fetch Charts (Slower)
    getDashboardCharts()
      .then(res => {
        if (res.success) setCharts(res.data);
      })
      .catch(err => console.error("Charts error:", err))
      .finally(() => setChartsLoading(false));

    // 3. Fetch Activity (Medium)
    getDashboardActivity()
      .then(res => {
        if (res.success) setActivity(res.data);
      })
      .catch(err => console.error("Activity error:", err))
      .finally(() => setActivityLoading(false));
  }, []);

  return (
    <div className="ml-0 p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Business Overview</h1>
        <p className="text-gray-500">Welcome back! Here is what's happening today.</p>
      </header>

      {/* Top Stats Row - Skeleton or Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-lg shadow-sm animate-pulse"></div>
          ))
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          {chartsLoading ? (
            <div className="h-96 bg-white rounded-lg shadow-sm animate-pulse"></div>
          ) : (
            <RevenueChart data={charts?.revenueData} />
          )}
        </div>
        <div>
          {statsLoading ? (
            <div className="h-96 bg-white rounded-lg shadow-sm animate-pulse"></div>
          ) : (
            <PaymentStatusChart stats={stats?.invoiceStats} />
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {chartsLoading ? (
          <div className="h-80 bg-white rounded-lg shadow-sm animate-pulse"></div>
        ) : (
          <ClientGrowthChart data={charts?.clientGrowthData} />
        )}

        {activityLoading ? (
          <div className="h-80 bg-white rounded-lg shadow-sm animate-pulse"></div>
        ) : (
          <RecentActivity data={activity?.recentActivity} />
        )}

        {activityLoading ? (
          <div className="h-80 bg-white rounded-lg shadow-sm animate-pulse"></div>
        ) : (
          <UpcomingInvoices data={activity?.upcomingInvoices} />
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;