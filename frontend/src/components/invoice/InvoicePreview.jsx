import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const InvoicePreview = ({ data, client }) => {
  if (!data || !client) return <div className="p-8 text-center text-gray-500">Incomplete Data</div>;

  return (
    <div className="bg-white text-gray-900 p-8 rounded-lg shadow-lg border border-gray-200 max-w-2xl mx-auto text-sm print:shadow-none print:border-none">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-blue-600 uppercase tracking-wide">Invoice</h1>
          <p className="font-semibold text-gray-500 mt-1">#{data.invoiceNumber || 'DRAFT'}</p>
        </div>
        <div className="text-right">
          <h2 className="font-bold text-lg">Your Company Name</h2>
          <p className="text-gray-500">123 Business Rd</p>
          <p className="text-gray-500">City, State, 12345</p>
        </div>
      </div>

      {/* Bill To & Dates */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-gray-500 font-bold uppercase text-xs mb-2">Bill To</h3>
          <p className="font-bold text-base">{client.name}</p>
          {client.companyName && <p>{client.companyName}</p>}
          <p className="whitespace-pre-line text-gray-600">{client.address}</p>
          <p className="text-gray-600">{client.email}</p>
        </div>
        <div className="text-right">
          <div className="mb-2">
            <span className="text-gray-500 font-bold uppercase text-xs mr-4">Date</span>
            <span className="font-medium">{formatDate(data.date)}</span>
          </div>
          <div className="mb-2">
            <span className="text-gray-500 font-bold uppercase text-xs mr-4">Due Date</span>
            <span className="font-medium">{formatDate(data.dueDate)}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8">
        <thead>
          <tr className="border-b-2 border-gray-100">
            <th className="text-left py-2 font-bold text-gray-500 uppercase text-xs">Description</th>
            <th className="text-right py-2 font-bold text-gray-500 uppercase text-xs">Qty</th>
            <th className="text-right py-2 font-bold text-gray-500 uppercase text-xs">Price</th>
            <th className="text-right py-2 font-bold text-gray-500 uppercase text-xs">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index} className="border-b border-gray-50">
              <td className="py-3">{item.description}</td>
              <td className="text-right py-3">{item.quantity}</td>
              <td className="text-right py-3">{formatCurrency(item.price)}</td>
              <td className="text-right py-3 font-medium">{formatCurrency(item.quantity * item.price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-1/2 space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatCurrency(data.subtotal)}</span>
          </div>
          {data.taxRate > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Tax ({data.taxRate}%)</span>
              <span>{formatCurrency(data.subtotal * (data.taxRate / 100))}</span>
            </div>
          )}
          {data.discount > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Discount</span>
              <span>- {formatCurrency(data.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2 mt-2">
            <span>Total</span>
            <span className="text-blue-600">{formatCurrency(data.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer Notes */}
      {data.notes && (
        <div className="mt-8 pt-8 border-t border-gray-100 text-gray-500 text-xs">
          <p className="font-bold uppercase mb-1">Notes</p>
          <p>{data.notes}</p>
        </div>
      )}
    </div>
  );
};

export default InvoicePreview;