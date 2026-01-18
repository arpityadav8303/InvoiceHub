import React, { useState, useEffect, useCallback } from 'react';
import { Save, Eye, ArrowLeft } from 'lucide-react';
import Button from '../common/Button';
import Card from '../common/Card';
import DatePicker from '../forms/DatePicker';
import TextArea from '../forms/TextArea';
import Modal from '../common/Modal';

// Sub-components
import InvoiceClientSelect from './InvoiceClientSelect';
import InvoiceLineItems from './InvoiceLineItems';
import InvoiceSummary from './InvoiceSummary';
import InvoicePreview from './InvoicePreview';

// Utils
import { useToast } from '../../hooks/useToast';
import { invoiceSchema } from '../../schemas/invoiceSchema';
import { validateField } from '../../utils/validators';

const InvoiceForm = ({ 
  initialData, 
  clients = [], // List of available clients
  onSubmit, 
  isLoading 
}) => {
  const { showToast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});

  // 1. Initial State
  const [formData, setFormData] = useState({
    clientId: '',
    invoiceNumber: '', // Backend handles generation usually, but needed for edit
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0], // Default +15 days
    items: [{ description: '', quantity: 1, price: 0 }],
    notes: '',
    taxRate: 0,
    discount: 0,
    subtotal: 0,
    total: 0
  });

  // Load initial data if editing
  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  // 2. Auto-Calculate Totals whenever items/tax/discount change
  const calculateTotals = useCallback((currentData) => {
    const subtotal = currentData.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const taxAmount = subtotal * (currentData.taxRate / 100);
    const total = Math.max(0, subtotal + taxAmount - currentData.discount);
    
    return { subtotal, total };
  }, []);

  // Update state helper
  const updateState = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      // If we changed items/tax/discount, recalc totals
      if (['items', 'taxRate', 'discount'].includes(field)) {
        const { subtotal, total } = calculateTotals(updated);
        updated.subtotal = subtotal;
        updated.total = total;
      }
      return updated;
    });
    // Clear error
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  // 3. Handlers
  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    updateState('items', newItems);
  };

  const handleAddItem = () => {
    updateState('items', [...formData.items, { description: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length === 1) return; // Prevent deleting last item
    const newItems = formData.items.filter((_, i) => i !== index);
    updateState('items', newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    let isValid = true;
    
    Object.keys(invoiceSchema).forEach(key => {
      const rules = invoiceSchema[key];
      const error = validateField(formData[key], rules);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (!isValid) {
      showToast('Please check the form for errors', 'error');
      return;
    }

    onSubmit(formData);
  };

  const selectedClient = clients.find(c => c.id === formData.clientId);

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
      
      {/* HEADER: Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {initialData ? 'Edit Invoice' : 'Create New Invoice'}
          </h1>
          <p className="text-gray-500">Fill in the details below.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            type="button"
            icon={Eye} 
            onClick={() => setShowPreview(true)}
            disabled={!selectedClient} // Cannot preview without client
          >
            Preview
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            icon={Save}
            isLoading={isLoading}
          >
            Save Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Client & Dates Card */}
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <InvoiceClientSelect 
                  clients={clients}
                  selectedClientId={formData.clientId}
                  onChange={(e) => updateState('clientId', e.target.value)}
                  error={errors.clientId}
                />
              </div>
              <DatePicker 
                label="Invoice Date"
                name="date"
                value={formData.date}
                onChange={(e) => updateState('date', e.target.value)}
                error={errors.date}
              />
              <DatePicker 
                label="Due Date"
                name="dueDate"
                value={formData.dueDate}
                onChange={(e) => updateState('dueDate', e.target.value)}
                error={errors.dueDate}
              />
            </div>
          </Card>

          {/* 2. Items Card */}
          <Card>
            <InvoiceLineItems 
              items={formData.items}
              onChange={handleItemChange}
              onAdd={handleAddItem}
              onRemove={handleRemoveItem}
              error={errors.items}
            />
          </Card>

          {/* 3. Notes */}
          <Card>
            <TextArea 
              label="Notes / Terms"
              placeholder="e.g. Payment due within 15 days. Thank you for your business!"
              value={formData.notes}
              onChange={(e) => updateState('notes', e.target.value)}
            />
          </Card>
        </div>

        {/* RIGHT COLUMN: Summary */}
        <div className="lg:col-span-1">
          <InvoiceSummary 
            subtotal={formData.subtotal}
            taxRate={formData.taxRate}
            discount={formData.discount}
            total={formData.total}
            onUpdate={updateState}
          />
        </div>
      </div>

      {/* PREVIEW MODAL */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Invoice Preview"
        size="2xl"
        footer={
          <Button onClick={() => setShowPreview(false)}>Close Preview</Button>
        }
      >
        <InvoicePreview data={formData} client={selectedClient} />
      </Modal>

    </form>
  );
};

export default InvoiceForm;
