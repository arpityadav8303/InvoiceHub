import React from 'react';
import { Mail, CheckCircle, User, AlertCircle } from 'lucide-react';
import Card from '../common/Card';
import { formatDateTime } from '../../utils/formatters';

const RecentActivity = ({ data }) => {
  // Use props or fallback to empty
  const activities = data || [];

  const getStyles = (type) => {
    switch (type) {
      case 'payment': return { icon: CheckCircle, color: 'text-green-600 bg-green-100' };
      case 'invoice': return { icon: Mail, color: 'text-blue-600 bg-blue-100' };
      case 'client': return { icon: User, color: 'text-purple-600 bg-purple-100' };
      case 'alert': return { icon: AlertCircle, color: 'text-red-600 bg-red-100' };
      default: return { icon: AlertCircle, color: 'text-gray-600 bg-gray-100' };
    }
  };

  return (
    <Card title="Recent Activity">
      <div className="space-y-6">
        {activities.map((item) => {
          const { icon: Icon, color } = getStyles(item.type);
          return (
            <div key={item.id} className="flex gap-4">
              {/* Icon Column */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${color} dark:bg-opacity-20`}>
                <Icon size={18} />
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
          );
        })}
      </div>
    </Card>
  );
};

export default RecentActivity;
