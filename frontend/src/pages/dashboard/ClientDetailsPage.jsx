import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Components
import ClientHeader from '../../components/client/ClientHeader';
import ClientStats from '../../components/client/ClientStats';
import ClientTabs from '../../components/client/ClientTabs';
import ClientInvoiceList from '../../components/client/ClientInvoiceList';
import ClientPaymentHistory from '../../components/client/ClientPaymentHistory';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState'; // For Risk Tab placeholder

// Hooks & Services
import useFetch from '../../hooks/useFetch';
import { useToast } from '../../hooks/useToast';
// NOTE: You would import actual service functions here once created
// import { getClientById, deleteClient } from '../../services/clientService';

const ClientDetailsPage = () => {
  const { id } = useParams(); // Get Client ID from URL
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // MOCK DATA FETCHING (Replace with actual API calls)
  // In real app: const { data: client, loading, error } = useFetch(() => getClientById(id));
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);

  useEffect(() => {
    // Simulating API Call
    setTimeout(() => {
      setClient({
        id: id,
        name: 'Tech Solutions Inc.',
        email: 'billing@techsolutions.com',
        phone: '+91 98765 43210',
        companyName: 'Tech Solutions Private Limited',
        address: '123, Cyber City, Gurugram, India',
        status: 'Active',
        stats: {
          totalRevenue: 150000,
          outstandingAmount: 25000,
          totalInvoices: 12,
          paymentRate: 92
        },
        invoices: [
          { id: 1, invoiceNumber: 'INV-001', date: '2023-12-01', amount: 50000, dueDate: '2023-12-15', status: 'Paid' },
          { id: 2, invoiceNumber: 'INV-002', date: '2024-01-05', amount: 25000, dueDate: '2024-01-20', status: 'Pending' }
        ],
        payments: [
          { id: 'PAY-123', date: '2023-12-14', invoiceNumber: 'INV-001', method: 'Bank Transfer', amount: 50000, status: 'Completed' }
        ]
      });
      setLoading(false);
    }, 800);
  }, [id]);


  // Handlers
  const handleEdit = () => {
    // Navigate to edit page
    // navigate(`/clients/edit/${id}`);
    showToast('Edit functionality coming soon!', 'info');
  };

  const handleDelete = () => {
    // Logic to delete client via API
    showToast('Client deleted successfully', 'success');
    setIsDeleteOpen(false);
    navigate('/clients');
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!client) return <div>Client not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 1. Header Section */}
      <ClientHeader 
        client={client} 
        onEdit={handleEdit} 
        onDelete={() => setIsDeleteOpen(true)} 
      />

      {/* 2. Stats Section (Visible on Overview) */}
      {activeTab === 'overview' && (
        <ClientStats stats={client.stats} />
      )}

      {/* 3. Navigation Tabs */}
      <ClientTabs 
        activeTab={activeTab} 
        onChange={setActiveTab} 
      />

      {/* 4. Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 min-h-[400px]">
        
        {activeTab === 'overview' && (
           <div className="space-y-8">
             <div>
               <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Invoices</h3>
               <ClientInvoiceList invoices={client.invoices.slice(0, 5)} onView={() => {}} onDownload={() => {}} />
             </div>
           </div>
        )}

        {activeTab === 'invoices' && (
          <ClientInvoiceList invoices={client.invoices} onView={() => {}} onDownload={() => {}} />
        )}

        {activeTab === 'payments' && (
          <ClientPaymentHistory payments={client.payments} />
        )}

        {activeTab === 'risk' && (
          <EmptyState 
            title="Risk Assessment" 
            description="AI-powered risk analysis for this client is being generated."
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog 
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Client?"
        message={`Are you sure you want to delete ${client.name}? This will also remove all associated invoices and payment records.`}
        isDangerous={true}
        confirmText="Yes, Delete Client"
      />

    </div>
  );
};

export default ClientDetailsPage;