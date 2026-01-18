import React from 'react';
import { DollarSign, FileText, AlertCircle, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const ClientStats = ({ stats }) => {
  // Default values to prevent crashes if stats aren't loaded yet
  const safeStats = stats || {
    totalRevenue: 0,
    outstandingAmount: 0,
    totalInvoices: 0,
    paymentRate: 0
  };

  const statItems = [
    {
      label: 'Total Revenue',
      value: formatCurrency(safeStats.totalRevenue),
      icon: DollarSign,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      desc: 'Lifetime earnings'
    },
    {
      label: 'Outstanding',
      value: formatCurrency(safeStats.outstandingAmount),
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
      desc: 'Unpaid invoices'
    },
    {
      label: 'Total Invoices',
      value: safeStats.totalInvoices,
      icon: FileText,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      desc: 'Sent to date'
    },
    {
      label: 'Payment Rate',
      value: `${safeStats.paymentRate}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
      desc: 'On-time payments'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((item, index) => (
        <div 
          key={index} 
          className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2.5 rounded-lg ${item.bg}`}>
              <item.icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-full">
              {item.desc}
            </span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {item.value}
            </h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
              {item.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ClientStats;