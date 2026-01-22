import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Components
import ClientHeader from '../../components/client/ClientHeader';
import ClientStats from '../../components/client/ClientStats';
import ClientTabs from '../../components/client/ClientTabs';
import ClientInvoiceList from '../../components/client/ClientInvoiceList';
import ClientPaymentHistory from '../../components/client/ClientPaymentHistory';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import RiskScoreCard from '../../components/risk/RiskScoreCard';
import RiskFactorsList from '../../components/risk/RiskFactorsList';
import RiskTrendChart from '../../components/risk/RiskTrendChart';
import RiskRecommendations from '../../components/risk/RiskRecommendations';
import RiskAlerts from '../../components/risk/RiskAlerts';

// Hooks & Services
import { useToast } from '../../hooks/useToast';
import { getClientProfile, deleteClient, getClientRiskAssessment } from '../../services/clientService';
import { getAllInvoices } from '../../services/invoiceService';

const ClientDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [clientProfile, setClientProfile] = useState(null);

  // Risk & Invoices Data State
  const [riskData, setRiskData] = useState(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [allInvoices, setAllInvoices] = useState(null);
  const [invoicesLoading, setInvoicesLoading] = useState(false);

  // Fetch Client Profile
  useEffect(() => {
    const fetchClientProfile = async () => {
      try {
        setLoading(true);
        const res = await getClientProfile(id);
        if (res.success) {
          setClientProfile(res.data);
        }
      } catch (error) {
        console.error("Error fetching client profile:", error);
        showToast('Failed to load client details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchClientProfile();
  }, [id, showToast]);



  // Fetch Risk Data when tab is active
  const fetchRiskData = useCallback(async () => {
    try {
      setRiskLoading(true);
      const res = await getClientRiskAssessment(id);
      if (res.success) {
        setRiskData(res.data);
      }
    } catch (error) {
      console.error("Error fetching risk assessment:", error);
      showToast('Failed to load risk assessment', 'error');
    } finally {
      setRiskLoading(false);
    }
  }, [id, showToast]);

  // Fetch All Invoices when tab is active
  const fetchInvoices = useCallback(async () => {
    try {
      setInvoicesLoading(true);
      // Pass clientId to filter
      const res = await getAllInvoices({ clientId: id });
      if (res.success) {
        setAllInvoices(res.data);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      showToast('Failed to load invoices', 'error');
    } finally {
      setInvoicesLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    if (activeTab === 'risk' && !riskData) {
      fetchRiskData();
    }
    if (activeTab === 'invoices' && !allInvoices) {
      fetchInvoices();
    }
  }, [activeTab, riskData, fetchRiskData, allInvoices, fetchInvoices]);

  const handleEdit = () => {
    navigate(`/clients/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      await deleteClient(id);
      showToast('Client deleted successfully', 'success');
      setIsDeleteOpen(false);
      navigate('/clients');
    } catch (error) {
      showToast('Failed to delete client', 'error');
      console.error("Error deleting client:", error);
    }
  };

  const handleRecalculateRisk = () => {
    fetchRiskData();
    showToast('Recalculating risk profile...', 'info');
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!clientProfile) return <div className="p-8 text-center">Client not found</div>;

  // Adapt backend data structure to components
  // ClientHeader expects: name, email, phone, companyName, address, status, id
  const clientForHeader = {
    id: clientProfile.basicInfo._id,
    name: `${clientProfile.basicInfo.firstName} ${clientProfile.basicInfo.lastName}`,
    email: clientProfile.context?.email || clientProfile.basicInfo.email,
    phone: clientProfile.basicInfo.phone,
    companyName: clientProfile.basicInfo.companyName,
    address: `${clientProfile.contactInfo.address.street}, ${clientProfile.contactInfo.address.city}`,
    status: clientProfile.basicInfo.status
  };

  // ClientStats expects: totalRevenue, outstandingAmount, totalInvoices, paymentRate
  const clientStats = {
    totalRevenue: clientProfile.paymentStats.totalAmount,
    outstandingAmount: clientProfile.paymentStats.totalUnpaid, // or invoiceSummary.unpaidAmount
    totalInvoices: clientProfile.paymentStats.totalInvoices,
    paymentRate: clientProfile.summaryMetrics.collectionRate // or calculate from paid/total
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* 1. Header Section */}
      <ClientHeader
        client={clientForHeader}
        onEdit={handleEdit}
        onDelete={() => setIsDeleteOpen(true)}
      />

      {/* 2. Stats Section (Visible on Overview) */}
      {activeTab === 'overview' && (
        <ClientStats stats={clientStats} />
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
              <ClientInvoiceList
                invoices={clientProfile.recentInvoices.invoices}
                onView={() => { }}
                onDownload={() => { }}
              />
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">All Invoices</h3>
              <button onClick={() => navigate('/invoices/new')} className="text-blue-600 text-sm hover:underline">Create New</button>
            </div>
            {invoicesLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <ClientInvoiceList
                  invoices={allInvoices || []}
                  onView={(id) => navigate(`/invoices/${id}`)}
                // onDownload={() => { }} // Implement if download service exists
                />
                {(!allInvoices || allInvoices.length === 0) && (
                  <p className="text-center text-gray-500 mt-8">No invoices found for this client.</p>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <ClientPaymentHistory payments={clientProfile.paymentHistory.payments} />
        )}

        {activeTab === 'risk' && (
          <div className="space-y-6">
            {riskLoading ? (
              <LoadingSpinner />
            ) : riskData ? (
              <>
                <div className="flex justify-end">
                  <button
                    onClick={handleRecalculateRisk}
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    Refresh Analysis
                  </button>
                </div>

                <RiskAlerts alerts={riskData.alerts} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <RiskScoreCard score={riskData.riskSummary.riskScore} level={riskData.riskSummary.riskLevel} />
                  </div>
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    <RiskTrendChart history={riskData.trendAnalysis.recentPerformance} /> {/* Check exact prop requirement */}
                    <RiskFactorsList factors={[
                      // Transform factors object into array if needed or use specific props
                      { description: 'Payment Reliability', impact: riskData.factors.paymentReliabilityScore.impact === 'High' ? 'positive' : 'negative', category: 'Score' },
                      { description: `Average Days Overdue: ${riskData.factors.averageDaysOverdue.days}`, impact: riskData.factors.averageDaysOverdue.days > 0 ? 'negative' : 'positive', category: 'Payment' }
                    ]} />
                  </div>
                </div>

                <RiskRecommendations recommendations={riskData.recommendations} />
              </>
            ) : (
              <div className="text-center p-8 text-gray-500">Unable to load risk assessment.</div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Client?"
        message={`Are you sure you want to delete ${clientForHeader.name}? This will also remove all associated invoices and payment records.`}
        isDangerous={true}
        confirmText="Yes, Delete Client"
      />

    </div>
  );
};

export default ClientDetailsPage;