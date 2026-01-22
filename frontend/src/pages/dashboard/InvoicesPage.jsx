import React, { useEffect, useState } from 'react';
import { getAllInvoices } from '../../services/invoiceService';
import { FileText, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InvoicesPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await getAllInvoices();

            if (res.success) {
                setInvoices(res.data || []);
            } else {
                setError(res.message || 'Failed to fetch invoices');
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
            setError(error.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-600">Loading Invoices...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Error Display */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    <p className="font-semibold">Error loading invoices</p>
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={fetchInvoices}
                        className="mt-2 text-sm underline hover:no-underline"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="text-blue-600" /> Invoices
                </h1>
                <button
                    onClick={() => navigate('/invoices/new')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <Plus size={20} /> Create Invoice
                </button>
            </div>

            {/* Content */}
            {invoices.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No invoices found</h3>
                    <p className="text-sm text-gray-500 mb-6">Create your first invoice to get started!</p>
                    <button
                        onClick={() => navigate('/invoices/new')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition mx-auto"
                    >
                        <Plus size={20} /> Create Invoice
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Invoice #</th>
                                <th className="p-4 font-semibold text-gray-600">Client</th>
                                <th className="p-4 font-semibold text-gray-600">Date</th>
                                <th className="p-4 font-semibold text-gray-600">Amount</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {invoices.map((invoice) => (
                                <tr
                                    key={invoice._id}
                                    className="hover:bg-gray-50 transition cursor-pointer"
                                    onClick={() => navigate(`/invoices/${invoice._id}`)}
                                >
                                    <td className="p-4 font-medium text-blue-600">
                                        {invoice.invoiceNumber}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {invoice.clientId?.firstName && invoice.clientId?.lastName
                                            ? `${invoice.clientId.firstName} ${invoice.clientId.lastName}`
                                            : invoice.clientId?.companyName || 'N/A'
                                        }
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {new Date(invoice.invoiceDate).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">
                                        ₹{invoice.total?.toLocaleString() || '0'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                invoice.status === 'sent' ? 'bg-yellow-100 text-yellow-700' :
                                                    invoice.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-700'
                                            }`}>
                                            {invoice.status?.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InvoicesPage;