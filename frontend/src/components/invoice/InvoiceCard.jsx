import React from 'react';
import { Calendar, DollarSign, User } from 'lucide-react';
import Card from '../common/Card';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import Button from '../common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';

const InvoiceCard = ({ invoice, onClick }) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 group"
      onClick={() => onClick(invoice)}
    >
      {/* Header: ID and Status */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Invoice
          </span>
          <h3 className="text-lg font-bold text-blue-600 group-hover:text-blue-700">
            #{invoice.invoiceNumber}
          </h3>
        </div>
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      {/* Content: Client and Amount */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <User size={16} className="text-gray-400" />
          <span className="font-medium truncate">{invoice.clientName}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Calendar size={16} className="text-gray-400" />
          <span className="text-sm">Due: {formatDate(invoice.dueDate)}</span>
        </div>
      </div>

      {/* Footer: Total and Action */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Total Amount</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatCurrency(invoice.total)}
          </p>
        </div>
        <Button size="sm" variant="ghost" className="text-blue-600">
          View Details
        </Button>
      </div>
    </Card>
  );
};

export default InvoiceCard;
