import React, { useEffect, useState } from 'react';
import { getAllClients } from '../../services/clientService';
import { Users, Plus, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientsPage = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const res = await getAllClients();
            console.log("Clients API Response:", res);
            if (res.success) {
                setClients(res.data);
            }
        } catch (error) {
            console.error("Error fetching clients:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading Clients...</div>;

    return (
        <div className="ml-0 p-8 bg-gray-50 min-h-screen ">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Users className="text-blue-600" /> Clients
                </h1>
                <button
                    onClick={() => navigate('/clients/new')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <Plus size={20} /> Add Client
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
                {clients.length > 0 ? (
                    clients.map((client) => (
                        <div key={client._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{client.firstName} {client.lastName}</h3>
                                    <p className="text-sm text-gray-500">{client.companyName || 'Freelancer'}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                  ${client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {client.status}
                                </span>
                            </div>

                            <div className="space-y-2 text-gray-600 text-sm">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-gray-400" /> {client.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={16} className="text-gray-400" /> {client.phone}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <button
                                    onClick={() => navigate(`/clients/${client._id}`)}
                                    className="text-blue-600 text-sm font-medium hover:underline"
                                >
                                    View Profile
                                </button>
                                <button className="text-gray-400 hover:text-blue-600">Edit</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-3 p-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                        No clients found. Add your first client!
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientsPage;
