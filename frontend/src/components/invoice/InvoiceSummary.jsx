import React from 'react';
import Card from '../common/Card';
import Input from '../forms/Input';
import { formatCurrency } from '../../utils/formatters';

const InvoiceSummary = ({ 
  subtotal, 
  taxRate, 
  discount, 
  onUpdate, // Function to update tax/discount
  total 
}) => {
  return (
    <Card className="bg-gray-50 dark:bg-gray-800/50 h-fit sticky top-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Summary</h3>
      
      <div className="space-y-3 text-sm">
        {/* Subtotal */}
        <div className="flex justify-between text-gray-600 dark:text-gray-400">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>

        {/* Tax Rate Input */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-600 dark:text-gray-400">Tax Rate (%)</span>
          <div className="w-20">
            <Input
              type="number"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => onUpdate('taxRate', parseFloat(e.target.value) || 0)}
              className="text-right py-1 h-8"
            />
          </div>
        </div>

        {/* Discount Input */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-gray-600 dark:text-gray-400">Discount</span>
          <div className="w-24">
            <Input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => onUpdate('discount', parseFloat(e.target.value) || 0)}
              className="text-right py-1 h-8"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          <div className="flex justify-between items-center font-bold text-lg text-gray-900 dark:text-white">
            <span>Total</span>
            <span className="text-blue-600 dark:text-blue-400">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InvoiceSummary;
