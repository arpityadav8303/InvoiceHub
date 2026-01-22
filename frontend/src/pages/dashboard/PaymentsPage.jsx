import React, { useEffect, useState } from 'react';
import { getAllPayments } from '../../services/paymentService';
import { CreditCard, Plus, Calendar } from 'lucide-react';

const PaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const res = await getAllPayments();
            if (res.success) {
                setPayments(res.data);
            }
        } catch (error) {
            console.error("Error fetching payments:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading Payments...</div>;

    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-900 h-full">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <CreditCard className="text-blue-600" /> Payments
                </h1>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition">
                    <Plus size={20} /> Record Payment
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Date</th>
                            <th className="p-4 font-semibold text-gray-600">Client</th>
                            <th className="p-4 font-semibold text-gray-600">Invoice #</th>
                            <th className="p-4 font-semibold text-gray-600">Amount</th>
                            <th className="p-4 font-semibold text-gray-600">Method</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {payments.length > 0 ? (
                            payments.map((payment) => (
                                <tr key={payment._id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 text-gray-600 flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-400" />
                                        {new Date(payment.date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 font-medium text-gray-900">{payment.client?.name || 'N/A'}</td>
                                    <td className="p-4 text-gray-600">{payment.invoiceNumber || '-'}</td>
                                    <td className="p-4 font-bold text-green-600">+${payment.amount}</td>
                                    <td className="p-4 text-gray-600 capitalize">{payment.method}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-gray-500">
                                    No payments recorded yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentsPage;
