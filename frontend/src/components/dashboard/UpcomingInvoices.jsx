import React from 'react';
import { ChevronRight } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

const UpcomingInvoices = () => {
  const invoices = [
    { id: 'INV-005', client: 'Alpha Industries', amount: 12000, dueDate: '2024-01-20' },
    { id: 'INV-006', client: 'Beta Corp', amount: 8500, dueDate: '2024-01-22' },
    { id: 'INV-007', client: 'Gamma Ltd', amount: 3400, dueDate: '2024-01-25' },
  ];

  return (
    <Card 
      title="Upcoming Due" 
      action={
        <button className="text-xs text-blue-600 font-medium hover:underline flex items-center">
          View All <ChevronRight size={12} />
        </button>
      }
    >
      <div className="space-y-3">
        {invoices.map((inv) => (
          <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border border-transparent hover:border-gray-100">
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">{inv.client}</p>
              <p className="text-xs text-gray-500">Due: {formatDate(inv.dueDate)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{formatCurrency(inv.amount)}</p>
              <span className="text-[10px] text-orange-600 font-medium bg-orange-50 px-1.5 py-0.5 rounded">Due Soon</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default UpcomingInvoices;
