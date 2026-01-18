import React from 'react';
import { Plus, UserPlus, FileText, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { label: 'Create Invoice', icon: Plus, path: '/invoices/new', color: 'bg-blue-600' },
    { label: 'Add Client', icon: UserPlus, path: '/clients/new', color: 'bg-indigo-600' },
    { label: 'Record Payment', icon: FileText, path: '/payments', color: 'bg-green-600' }, // Usually opens a modal
    { label: 'Send Reminder', icon: Send, path: '/invoices', color: 'bg-orange-600' },
  ];

  return (
    <Card title="Quick Actions">
      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all bg-white dark:bg-gray-800 dark:border-gray-700"
          >
            <div className={`p-3 rounded-full ${action.color} text-white mb-2 shadow-sm`}>
              <action.icon size={20} />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default QuickActions;
