import React, { useState } from 'react';
import { DollarSign, Calendar, FileText, CreditCard } from 'lucide-react';
import Input from '../forms/Input';
import Select from '../forms/Select';
import TextArea from '../forms/TextArea';
import DatePicker from '../forms/DatePicker';
import Button from '../common/Button';
import { validateField } from '../../utils/validators';
import { paymentSchema } from '../../schemas/paymentSchema';

const RecordPaymentForm = ({ 
  invoice, // Optional: If passed, pre-fills the invoice field and locks it
  invoices = [], // List of all open invoices (for the dropdown)
  onSubmit, 
  onCancel,
  isLoading 
}) => {
  const [formData, setFormData] = useState({
    invoiceId: invoice ? invoice.id : '',
    amount: invoice ? invoice.amountRemaining || invoice.total : '',
    date: new Date().toISOString().split('T')[0],
    method: 'Bank Transfer',
    transactionId: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    let isValid = true;
    Object.keys(paymentSchema).forEach(key => {
      const error = validateField(formData[key], paymentSchema[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    if (!isValid) return;

    onSubmit(formData);
  };

  // Prepare invoice options for the dropdown
  const invoiceOptions = invoices.map(inv => ({
    value: inv.id,
    label: `INV-${inv.invoiceNumber} (${inv.clientName}) - Due: $${inv.amountRemaining || inv.total}`
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      
      {/* 1. Invoice Selection (Disabled if pre-filled) */}
      <Select
        label="Link to Invoice"
        name="invoiceId"
        value={formData.invoiceId}
        onChange={handleChange}
        options={invoiceOptions}
        disabled={!!invoice} // Lock if recording payment from specific invoice
        error={errors.invoiceId}
        placeholder="Select an invoice..."
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 2. Amount */}
        <Input
          label="Amount Received"
          name="amount"
          type="number"
          icon={DollarSign}
          value={formData.amount}
          onChange={handleChange}
          error={errors.amount}
          placeholder="0.00"
          required
        />

        {/* 3. Date */}
        <DatePicker
          label="Payment Date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          error={errors.date}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 4. Payment Method */}
        <Select
          label="Payment Method"
          name="method"
          value={formData.method}
          onChange={handleChange}
          options={[
            { value: 'Bank Transfer', label: 'Bank Transfer' },
            { value: 'Credit Card', label: 'Credit Card' },
            { value: 'Cash', label: 'Cash' },
            { value: 'UPI', label: 'UPI' },
            { value: 'Cheque', label: 'Cheque' },
            { value: 'Other', label: 'Other' }
          ]}
          error={errors.method}
          required
        />

        {/* 5. Transaction ID */}
        <Input
          label="Transaction / Reference ID"
          name="transactionId"
          icon={FileText}
          value={formData.transactionId}
          onChange={handleChange}
          error={errors.transactionId}
          placeholder="e.g. TXN-123456789"
        />
      </div>

      {/* 6. Notes */}
      <TextArea
        label="Internal Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        placeholder="Any additional details..."
        rows={2}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading} icon={CreditCard}>
          Record Payment
        </Button>
      </div>
    </form>
  );
};

export default RecordPaymentForm;