import React from 'react';
import { Check, Circle, Clock, Mail, Eye, FilePlus } from 'lucide-react';
import Card from '../common/Card';
import { formatDateTime } from '../../utils/formatters';

const InvoiceTimeline = ({ history = [] }) => {
  
  // Icon mapping for different event types
  const getIcon = (type) => {
    switch (type) {
      case 'created': return FilePlus;
      case 'sent': return Mail;
      case 'viewed': return Eye;
      case 'paid': return Check;
      case 'overdue': return Clock;
      default: return Circle;
    }
  };

  const getColor = (type) => {
    switch (type) {
      case 'created': return 'bg-blue-100 text-blue-600';
      case 'sent': return 'bg-purple-100 text-purple-600';
      case 'viewed': return 'bg-yellow-100 text-yellow-600';
      case 'paid': return 'bg-green-100 text-green-600';
      case 'overdue': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <Card title="History">
      <div className="relative pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-8 my-2">
        {history.map((event, index) => {
          const Icon = getIcon(event.type);
          const colorClass = getColor(event.type);

          return (
            <div key={index} className="relative">
              {/* Dot / Icon on the line */}
              <div className={`absolute -left-[25px] p-1.5 rounded-full border-2 border-white dark:border-gray-800 ${colorClass}`}>
                <Icon size={14} />
              </div>

              {/* Event Content */}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {event.description}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatDateTime(event.date)} • by {event.user || 'System'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default InvoiceTimeline;
