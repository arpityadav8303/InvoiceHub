import React, { useEffect, useState } from 'react';
import { getClientDashboardOverview } from '../../services/clientService';
import StatCard from '../../components/dashboard/StatCard';
import { Wallet, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ClientDashboardPage = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getClientDashboardOverview();
                if (response.success) {
                    setData(response.data);
                } else {
                    setError(response.message);
                }
            } catch (err) {
                setError(err.message || "Failed to load dashboard");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <LoadingSpinner fullScreen />;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
    if (!data) return null;

    const { summaryCards, recentInvoices } = data;

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome to your client portal.</p>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={summaryCards.totalInvoices.label}
                    value={summaryCards.totalInvoices.value}
                    icon={FileText}
                    colorClass="bg-blue-500"
                />
                <StatCard
                    title={summaryCards.totalAmount.label}
                    value={summaryCards.totalAmount.value}
                    icon={Wallet}
                    colorClass="bg-purple-500"
                />
                <StatCard
                    title={summaryCards.amountPaid.label}
                    value={summaryCards.amountPaid.value}
                    icon={CheckCircle}
                    colorClass="bg-green-500"
                />
                <StatCard
                    title={summaryCards.amountOutstanding.label}
                    value={summaryCards.amountOutstanding.value}
                    icon={AlertCircle}
                    colorClass="bg-red-500"
                />
            </div>

            {/* Recent Invoices Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Recent Invoices</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 font-medium border-b border-gray-100 dark:border-gray-700">
                            <tr>
                                <th className="px-6 py-4">Invoice #</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Items</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {recentInvoices.invoices.length > 0 ? (
                                recentInvoices.invoices.map((inv) => (
                                    <tr key={inv.invoiceNumber} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">{inv.invoiceNumber}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-200">${inv.amount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    inv.status === 'overdue' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{inv.items ? inv.items.length : 0} items</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No recent invoices found.
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

export default ClientDashboardPage;
