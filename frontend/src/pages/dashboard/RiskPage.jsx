import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllClients } from '../../services/clientService';

// Placeholder for now as Risk requires client selection to show data
const RiskPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [riskFilter, setRiskFilter] = useState('all'); // all, low, medium, high
    const [loading, setLoading] = useState(true);
    const [allClients, setAllClients] = useState([]);

    // Fetch all clients initially
    useEffect(() => {
        const fetchClients = async () => {
            try {
                setLoading(true);
                const res = await getAllClients();
                if (res.success) {
                    setAllClients(res.data);
                }
            } catch (error) {
                console.error("Error loading clients:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, []);

    // Filter Logic
    const filteredClients = React.useMemo(() => {
        return allClients.filter(client => {
            const matchesSearch =
                `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.companyName?.toLowerCase().includes(searchTerm.toLowerCase());

            // Score Logic: High Score = Good (Low Risk)
            // paymentReliabilityScore is 0-100
            const score = client.paymentStats?.paymentReliabilityScore || 0;
            let riskLevel = 'medium';
            if (score >= 80) riskLevel = 'low';
            else if (score < 50) riskLevel = 'high';

            const matchesFilter = riskFilter === 'all' || riskFilter === riskLevel;

            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, riskFilter, allClients]);

    // Stats Calculation
    const stats = React.useMemo(() => {
        const total = allClients.length;
        const avgScore = total > 0
            ? Math.round(allClients.reduce((acc, c) => acc + (c.paymentStats?.paymentReliabilityScore || 0), 0) / total)
            : 0;
        const highRiskCount = allClients.filter(c => (c.paymentStats?.paymentReliabilityScore || 0) < 50).length;

        return { total, avgScore, highRiskCount };
    }, [allClients]);

    // Helper to get color based on score (Credit Score style)
    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
        if (score >= 50) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
    };

    const getProgressBarColor = (score) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="p-8 bg-gray-50 dark:bg-gray-900 h-full min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <ShieldAlert className="text-blue-600" /> Risk Assessment Portal
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Monitor client creditworthiness and payment reliability scores.
                    </p>
                </div>

                {/* Stats Cards Small */}
                <div className="flex gap-4">
                    <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 uppercase">Avg Credit Score</p>
                        <p className={`text-lg font-bold ${getScoreColor(stats.avgScore).split(' ')[0]}`}>{stats.avgScore}/100</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 uppercase">High Risk Clients</p>
                        <p className="text-lg font-bold text-red-600">{stats.highRiskCount}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search clients..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    {['all', 'low', 'medium', 'high'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setRiskFilter(filter)}
                            className={`px-4 py-2 rounded-lg capitalize text-sm font-medium transition-colors ${riskFilter === filter
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {filter === 'all' ? 'All Clients' : `${filter} Risk`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Client Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : filteredClients.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map(client => {
                        const score = client.paymentStats?.paymentReliabilityScore || 0;
                        // Determine label based on score logic
                        let riskLabel = 'Medium Risk';
                        if (score >= 80) riskLabel = 'Low Risk';
                        else if (score < 50) riskLabel = 'High Risk';

                        return (
                            <div key={client._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow p-6 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                                                {client.firstName} {client.lastName}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {client.companyName || 'Individual'}
                                            </p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${getScoreColor(score)}`}>
                                            {riskLabel}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-500">Credit Score</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{score}/100</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full ${getProgressBarColor(score)}`}
                                                style={{ width: `${score}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2">
                                            Based on {client.paymentStats?.totalInvoices || 0} invoices
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/clients/${client._id}/risk`)}
                                    className="w-full py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    View Full Report <ShieldAlert size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Search className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No clients found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters.</p>
                </div>
            )}
        </div>
    );
};

export default RiskPage;
