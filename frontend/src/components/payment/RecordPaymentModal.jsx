import React from 'react';
import Modal from '../common/Modal';
import RecordPaymentForm from './RecordPaymentForm';

const RecordPaymentModal = ({ 
  isOpen, 
  onClose, 
  invoice, // Optional pre-selected invoice
  invoices, // List of invoices if user needs to select one
  onSubmit, 
  isLoading 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment"
      size="lg"
    >
      <div className="p-1">
        <p className="text-sm text-gray-500 mb-6">
          Log a payment received from a client. This will update the invoice status and revenue stats.
        </p>
        
        <RecordPaymentForm 
          invoice={invoice}
          invoices={invoices}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </div>
    </Modal>
  );
};

export default RecordPaymentModal;
