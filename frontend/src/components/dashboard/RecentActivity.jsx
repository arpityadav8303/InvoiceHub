import React from 'react';
import { Mail, CheckCircle, User, AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import { formatDateTime } from '../../utils/formatters';

const RecentActivity = () => {
  // Mock Data
  const activities = [
    { id: 1, type: 'payment', message: 'Payment of ₹5,000 received from Acme Corp', time: '2024-01-15T10:30:00', icon: CheckCircle, color: 'text-green-600 bg-green-100' },
    { id: 2, type: 'invoice', message: 'Invoice #002 sent to John Doe', time: '2024-01-14T14:20:00', icon: Mail, color: 'text-blue-600 bg-blue-100' },
    { id: 3, type: 'client', message: 'New client "TechStart" added', time: '2024-01-13T09:15:00', icon: User, color: 'text-purple-600 bg-purple-100' },
    { id: 4, type: 'alert', message: 'Invoice #001 is now Overdue', time: '2024-01-12T08:00:00', icon: AlertCircle, color: 'text-red-600 bg-red-100' },
  ];

  return (
    <Card title="Recent Activity">
      <div className="space-y-6">
        {activities.map((item) => (
          <div key={item.id} className="flex gap-4">
            {/* Icon Column */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${item.color} dark:bg-opacity-20`}>
              <item.icon size={18} />
            </div>
            
            {/* Content Column */}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {item.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDateTime(item.time)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentActivity;
