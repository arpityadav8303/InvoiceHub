import React, { useEffect, useState } from 'react';
import { getMyInvoices } from '../../services/clientService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Eye, Download } from 'lucide-react';
import api from '../../services/api';

const ClientInvoicesPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchInvoices();
    }, [filterStatus]);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await getMyInvoices({ status: filterStatus });
            if (res.success) {
                setInvoices(res.data.invoices);
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to load invoices', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async (invoice) => {
        try {
            // Using axios to get blob for authenticated download
            const response = await api.get(`/clientDashboard/downloadInvoicePDF/${invoice._id}`, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${invoice.invoiceNumber}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error(error);
            showToast('Failed to download PDF. It might not be ready yet.', 'error');
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">My Invoices</h1>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
                >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="overdue">Overdue</option>
                </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Invoice #</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoices.length > 0 ? (
                                invoices.map((inv) => (
                                    <tr key={inv._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{inv.invoiceNumber}</td>
                                        <td className="px-6 py-4 text-gray-600">{new Date(inv.invoiceDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">${inv.total}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    inv.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                                        inv.status === 'partially_paid' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {inv.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <button
                                                onClick={() => handleDownloadPDF(inv)}
                                                className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                                                title="Download PDF"
                                            >
                                                <Download size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No invoices found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClientInvoicesPage;
