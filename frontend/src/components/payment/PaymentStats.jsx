import React from 'react';
import { TrendingUp, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const PaymentStats = ({ stats }) => {
  // Default values
  const safeStats = stats || { totalReceived: 0, pendingProcessing: 0, failedCount: 0, successRate: 100 };

  const items = [
    {
      label: 'Total Received',
      value: formatCurrency(safeStats.totalReceived),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      label: 'Success Rate',
      value: `${safeStats.successRate}%`,
      icon: CheckCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: 'Processing',
      value: formatCurrency(safeStats.pendingProcessing),
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      label: 'Failed / Refunded',
      value: safeStats.failedCount,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {items.map((item, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-lg ${item.bg}`}>
            <item.icon className={`w-6 h-6 ${item.color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentStats;
