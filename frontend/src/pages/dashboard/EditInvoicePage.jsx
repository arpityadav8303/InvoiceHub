import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InvoiceForm from '../../components/invoice/InvoiceForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';

const EditInvoicePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    // 1. Fetch Invoice Data AND Clients
    setTimeout(() => {
      // Mock Client List
      setClients([
        { id: 'c1', name: 'Acme Corp', companyName: 'Acme International', address: '123 Wall St', email: 'billing@acme.com' },
        { id: 'c2', name: 'John Doe', companyName: '', address: '45 Main St', email: 'john@gmail.com' },
      ]);

      // Mock Invoice Data (matches the format InvoiceForm expects)
      setInitialData({
        clientId: 'c1',
        invoiceNumber: 'INV-2024-001',
        date: '2024-03-10',
        dueDate: '2024-03-25',
        items: [
          { description: 'Web Development Services', quantity: 1, price: 1000 }
        ],
        notes: 'Payment due within 15 days.',
        taxRate: 10,
        discount: 0,
        subtotal: 1000,
        total: 1100
      });
      
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleUpdate = (formData) => {
    console.log('Updating invoice:', formData);
    showToast('Invoice updated successfully', 'success');
    navigate(`/invoices/${id}`);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <InvoiceForm 
        initialData={initialData}
        clients={clients}
        onSubmit={handleUpdate}
        isLoading={false}
      />
    </div>
  );
};

export default EditInvoicePage;
