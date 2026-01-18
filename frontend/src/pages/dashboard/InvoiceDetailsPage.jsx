import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Components
import InvoicePreview from '../../components/invoice/InvoicePreview';
import InvoiceActions from '../../components/invoice/InvoiceActions';
import InvoiceTimeline from '../../components/invoice/InvoiceTimeline';
import InvoiceStatusBadge from '../../components/invoice/InvoiceStatusBadge';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useToast } from '../../hooks/useToast';

const InvoiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // MOCK FETCH (Replace with real API)
  useEffect(() => {
    setTimeout(() => {
      setInvoice({
        id: id,
        invoiceNumber: 'INV-2024-001',
        status: 'Pending',
        date: '2024-03-10',
        dueDate: '2024-03-25',
        subtotal: 1000,
        taxRate: 10,
        discount: 0,
        total: 1100,
        client: {
          name: 'Acme Corp',
          companyName: 'Acme International Ltd.',
          address: '123 Business Rd, New York, USA',
          email: 'accounts@acme.com'
        },
        items: [
          { description: 'Web Development Services', quantity: 1, price: 1000 }
        ],
        history: [
          { type: 'created', description: 'Invoice Created', date: '2024-03-10T10:00:00Z', user: 'Arpit Yadav' },
          { type: 'sent', description: 'Sent to accounts@acme.com', date: '2024-03-10T10:05:00Z', user: 'System' }
        ]
      });
      setLoading(false);
    }, 800);
  }, [id]);

  // Handlers
  const handleEdit = () => navigate(`/invoices/edit/${id}`);
  
  const handleDelete = () => {
    showToast('Invoice deleted successfully', 'success');
    setIsDeleteOpen(false);
    navigate('/invoices');
  };

  const handleMarkPaid = () => {
    setInvoice(prev => ({
      ...prev,
      status: 'Paid',
      history: [{ type: 'paid', description: 'Marked as Paid', date: new Date().toISOString(), user: 'You' }, ...prev.history]
    }));
    showToast('Invoice marked as Paid', 'success');
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 1. Header Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/invoices')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Invoice #{invoice.invoiceNumber}
              </h1>
              <InvoiceStatusBadge status={invoice.status} />
            </div>
            <p className="text-sm text-gray-500">Created on {new Date(invoice.date).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Actions Toolbar */}
        <InvoiceActions 
          invoice={invoice}
          onEdit={handleEdit}
          onDelete={() => setIsDeleteOpen(true)}
          onMarkPaid={handleMarkPaid}
          onDownload={() => showToast('Downloading PDF...', 'info')}
          onSendEmail={() => showToast('Email sent successfully', 'success')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Main Content (The Invoice Paper) */}
        <div className="lg:col-span-2">
          <InvoicePreview data={invoice} client={invoice.client} />
        </div>

        {/* 3. Sidebar (Timeline & Meta) */}
        <div className="space-y-6">
          <InvoiceTimeline history={invoice.history} />
          
          {/* Quick Payment Link Box (Optional) */}
          {invoice.status !== 'Paid' && (
             <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900">
               <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-1">Payment Link</h4>
               <p className="text-xs text-blue-600 dark:text-blue-400 mb-3 break-all">
                 https://invoicehub.com/pay/{invoice.id}
               </p>
               <Button size="sm" variant="secondary" className="w-full">
                 Copy Link
               </Button>
             </div>
          )}
        </div>
      </div>

      <ConfirmDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Invoice?"
        message="Are you sure? This action cannot be undone."
        isDangerous={true}
      />
    </div>
  );
};

export default InvoiceDetailsPage;
