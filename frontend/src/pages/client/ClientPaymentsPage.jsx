import React, { useEffect, useState } from 'react';
import { getMyInvoices, getMyPayments } from '../../services/clientService';
import { recordPayment } from '../../services/paymentService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CreditCard, History, DollarSign, Calendar, CheckCircle, AlertCircle, X, Check } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const ClientPaymentsPage = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [invoices, setInvoices] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Payment Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            // FIXED: Try fetching without filter first to see all invoices


            const [invoicesRes, paymentsRes] = await Promise.all([
                // Try without status filter first, then we'll filter on frontend
                getMyInvoices({ limit: 100 }),
                getMyPayments()
            ]);



            if (invoicesRes.success) {
                const allInvoices = invoicesRes.data.invoices || [];


                // Filter on frontend for unpaid/partially paid invoices
                const unpaidInvoices = allInvoices.filter(inv => {
                    const status = inv.status?.toLowerCase();
                    const hasBalance = inv.remainingAmount > 0;


                    return hasBalance && (
                        status === 'sent' ||
                        status === 'partially_paid' ||
                        status === 'overdue' ||
                        status === 'draft'
                    );
                });


                setInvoices(unpaidInvoices);
            } else {
                console.error('❌ Failed to fetch invoices:', invoicesRes.message);
                showToast('Failed to load invoices', 'error');
            }

            if (paymentsRes.success) {
                setPayments(paymentsRes.data.payments || []);
            }
        } catch (err) {
            console.error('❌ Fetch error:', err);
            showToast('Failed to load payment data', 'error');
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePayClick = (invoice) => {

        setSelectedInvoice(invoice);
        setPaymentAmount(invoice.remainingAmount);
        setPaymentMethod('bank_transfer');
        setIsModalOpen(true);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();

        if (!selectedInvoice) return;

        const amount = parseFloat(paymentAmount);
        const maxAmount = parseFloat(selectedInvoice.remainingAmount);



        if (amount <= 0 || amount > maxAmount + 0.01) {
            showToast('Invalid payment amount', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                invoiceId: selectedInvoice._id,
                amount: amount,
                paymentMethod: paymentMethod,
                paymentDate: new Date(),
                notes: 'Client Portal Payment',
                referenceNumber: `PAY-${Date.now()}`
            };



            const res = await recordPayment(payload);

            if (res.success) {
                showToast('Payment successful! Receipt sent to email.', 'success');
                setIsModalOpen(false);
                fetchData(); // Refresh data
            } else {
                showToast(res.message || 'Payment failed', 'error');
            }
        } catch (err) {
            console.error('❌ Payment error:', err);
            showToast(err.message || 'Payment failed', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
                <p className="text-gray-500">Manage your payments and view history</p>
            </div>



            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'pending' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Pending Invoices ({invoices.length})
                    {activeTab === 'pending' && (
                        <Motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'history' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Payment History
                    {activeTab === 'history' && (
                        <Motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'pending' ? (
                    <div className="space-y-4">
                        {invoices.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                                <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3">
                                    <CheckCircle size={24} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">All caught up!</h3>
                                <p className="text-gray-500">You have no pending invoices to pay.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {invoices.map((inv) => (
                                    <div key={inv._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Invoice #</p>
                                                <p className="font-semibold text-gray-900">{inv.invoiceNumber}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${inv.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                                inv.status === 'partially_paid' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {inv.status.replace('_', ' ')}
                                            </span>
                                        </div>

                                        <div className="space-y-2 mb-6">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Due Date</span>
                                                <span className="font-medium">{new Date(inv.dueDate).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Remaining</span>
                                                <span className="font-bold text-gray-900">₹{inv.remainingAmount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Total</span>
                                                <span>₹{inv.total.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handlePayClick(inv)}
                                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CreditCard size={18} />
                                            Pay Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {payments.length === 0 ? (
                            <div className="text-center py-12">
                                <History className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                <p className="text-gray-500">No payment history found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Amount</th>
                                            <th className="px-6 py-4">Method</th>
                                            <th className="px-6 py-4">Transaction ID</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {payments.map((pay, index) => (
                                            <tr key={pay.id || index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 text-gray-600">
                                                    {new Date(pay.paymentDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900">
                                                    ₹{pay.amount.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 capitalize text-gray-600">
                                                    {pay.paymentMethod.replace('_', ' ')}
                                                </td>
                                                <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                                    {pay.transactionId || '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                        {pay.status || 'Completed'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {isModalOpen && selectedInvoice && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <Motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900">Make Payment</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium">Invoice #{selectedInvoice.invoiceNumber}</p>
                                        <p>Remaining Balance: <span className="font-bold">₹{selectedInvoice.remainingAmount.toFixed(2)}</span></p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Amount
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                                        <input
                                            type="number"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            max={selectedInvoice.remainingAmount}
                                            step="0.01"
                                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Payment will be processed and receipt sent via email.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Method
                                    </label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    >
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="card">Credit/Debit Card</option>
                                        <option value="upi">UPI</option>
                                        <option value="cheque">Cheque</option>
                                    </select>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-200 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>Processing...</>
                                        ) : (
                                            <>
                                                <Check size={18} />
                                                Confirm Payment
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ClientPaymentsPage;