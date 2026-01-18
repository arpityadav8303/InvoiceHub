import React from 'react';
import { Calendar, ArrowUpRight } from 'lucide-react';
import Card from '../common/Card';
import PaymentMethodBadge from './PaymentMethodBadge';
import Badge from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PaymentCard = ({ payment, onClick }) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={() => onClick(payment)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
            <ArrowUpRight size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              {formatCurrency(payment.amount)}
            </h3>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Received</p>
          </div>
        </div>
        <Badge variant={payment.status === 'Completed' ? 'success' : 'warning'}>
          {payment.status}
        </Badge>
      </div>

      <div className="space-y-3 border-t border-gray-100 dark:border-gray-700 pt-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Invoice</span>
          <span className="font-medium text-blue-600">#{payment.invoiceNumber}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Date</span>
          <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
            <Calendar size={12} className="text-gray-400" />
            {formatDate(payment.date)}
          </span>
        </div>

        <div className="flex justify-between text-sm items-center">
          <span className="text-gray-500">Method</span>
          <PaymentMethodBadge method={payment.method} />
        </div>
      </div>
    </Card>
  );
};

export default PaymentCard;
