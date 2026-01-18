import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../common/Button';
import Input from '../forms/Input';
import { formatCurrency } from '../../utils/formatters';

const InvoiceLineItems = ({ items, onChange, onRemove, onAdd, error }) => {
  
  // Handle changing a specific field in a specific row
  const handleItemChange = (index, field, value) => {
    onChange(index, field, value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Items</h3>
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header Row (Hidden on mobile) */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-4 p-3 bg-gray-50 dark:bg-gray-900/50 text-xs font-medium text-gray-500 uppercase">
          <div className="col-span-6">Description</div>
          <div className="col-span-2">Qty</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-2 text-right">Total</div>
        </div>

        {/* Item Rows */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {items.map((item, index) => (
            <div key={index} className="p-3 sm:grid sm:grid-cols-12 gap-4 items-start group">
              
              {/* Description Input */}
              <div className="col-span-6 mb-2 sm:mb-0">
                <Input
                  placeholder="Item name or description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="mb-0" // Override default margin
                />
              </div>

              {/* Quantity Input */}
              <div className="col-span-2 flex items-center gap-2 mb-2 sm:mb-0">
                <span className="sm:hidden text-xs text-gray-500">Qty:</span>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="mb-0"
                />
              </div>

              {/* Price Input */}
              <div className="col-span-2 flex items-center gap-2 mb-2 sm:mb-0">
                <span className="sm:hidden text-xs text-gray-500">Price:</span>
                <Input
                  type="number"
                  min="0"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                  className="mb-0"
                />
              </div>

              {/* Row Total & Delete Action */}
              <div className="col-span-2 flex items-center justify-between sm:justify-end gap-3 mt-1">
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(item.quantity * item.price)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Item Button */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50">
          <Button 
            variant="ghost" 
            size="sm" 
            icon={Plus} 
            onClick={onAdd}
            className="text-blue-600"
          >
            Add Line Item
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceLineItems;