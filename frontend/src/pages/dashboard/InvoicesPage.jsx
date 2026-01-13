import React, { useEffect, useState } from 'react';
import { getAllInvoices } from '../../services/invoiceService';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';

const InvoicesPage = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const res = await getAllInvoices();
            if (res.success) {
                setInvoices(res.data);
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading Invoices...</div>;

    return (
        <div className="ml-64 p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="text-blue-600" /> Invoices
                </h1>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
                    <Plus size={20} /> Create Invoice
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Invoice #</th>
                            <th className="p-4 font-semibold text-gray-600">Client</th>
                            <th className="p-4 font-semibold text-gray-600">Date</th>
                            <th className="p-4 font-semibold text-gray-600">Amount</th>
                            <th className="p-4 font-semibold text-gray-600">Status</th>
                            <th className="p-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {invoices.length > 0 ? (
                            invoices.map((invoice) => (
                                <tr key={invoice._id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-900">{invoice.invoiceNumber}</td>
                                    <td className="p-4 text-gray-600">{invoice.client?.name || 'N/A'}</td>
                                    <td className="p-4 text-gray-600">{new Date(invoice.date).toLocaleDateString()}</td>
                                    <td className="p-4 font-medium text-gray-900">${invoice.totalAmount}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                            {invoice.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button className="text-gray-400 hover:text-blue-600"><Edit size={18} /></button>
                                        <button className="text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500">
                                    No invoices found. Create your first invoice!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InvoicesPage;
