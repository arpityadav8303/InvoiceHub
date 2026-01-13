import React, { useState } from 'react';
import { ShieldAlert, Search, AlertTriangle } from 'lucide-react';

// Placeholder for now as Risk requires client selection to show data
const RiskPage = () => {
    const [selectedClient, setSelectedClient] = useState(null);

    return (
        <div className="ml-64 p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <ShieldAlert className="text-blue-600" /> Risk Assessment
                </h1>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
                <div className="max-w-md mx-auto">
                    <div className="bg-blue-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Search className="text-blue-600" size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Select a Client</h2>
                    <p className="text-gray-500 mb-6">
                        Search for a client to generate a comprehensive risk assessment report based on their payment history and behavior.
                    </p>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search client by name..."
                            className="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled
                        />
                        <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                    </div>
                    <p className="text-xs text-gray-400 mt-4">Module currently in development mode.</p>
                </div>
            </div>
        </div>
    );
};

export default RiskPage;
