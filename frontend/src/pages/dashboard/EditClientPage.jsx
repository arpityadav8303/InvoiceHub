import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ClientForm from '../../components/client/ClientForm';
import { getClientById, updateClient } from '../../services/clientService';
import { useToast } from '../../hooks/useToast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditClientPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        const fetchClient = async () => {
            try {
                // Determine if we need to implement a full getClientById or if getClientProfile is better.
                // clientService has getClientById which calls /client/:id. Let's start with that.
                const res = await getClientById(id);
                // response structure from backend controller 'getClient': res.status(200).json(client)
                // or if it returns { success: true, data: client } (need to verify backend standard)
                // getClientById returns response.data directly.
                // Let's assume the response is the client object.

                // Transform backend data to form key names if needed
                // Backend: firstName, lastName, email, phone, companyName, address:{street...}, gstNumber
                // Form: name, email, phone, companyName, address, gstIn
                const client = res; // Adjust based on api response structure inspection if needed.

                setInitialData({
                    name: `${client.firstName} ${client.lastName}`,
                    email: client.email,
                    phone: client.phone,
                    companyName: client.companyName || '',
                    address: client.address?.street || '', // Form expects string for address, maybe flat street?
                    gstIn: client.gstNumber || '',
                });

            } catch (error) {
                console.error("Error loading client:", error);
                showToast('Failed to load client details', 'error');
                navigate('/clients');
            } finally {
                setIsFetching(false);
            }
        };
        fetchClient();
    }, [id, navigate, showToast]);

    const handleUpdateClient = async (clientData) => {
        setIsLoading(true);
        try {
            // Transform form data back to backend schema
            const nameParts = clientData.name.trim().split(' ');
            let firstName = nameParts[0];
            let lastName = nameParts.slice(1).join(' ') || 'Unknown';

            const payload = {
                firstName,
                lastName,
                email: clientData.email,
                phone: clientData.phone,
                companyName: clientData.companyName,
                address: {
                    street: clientData.address,
                    // Preserve existing city/state/zip if possible, or send defaults.
                    // For now, simpler update.
                    city: 'Unknown',
                    state: 'Unknown',
                    zipCode: '000000'
                },
                gstNumber: clientData.gstIn,
            };

            await updateClient(id, payload);
            showToast('Client updated successfully', 'success');
            navigate(`/clients/${id}`);
        } catch (error) {
            console.error('Error updating client:', error);
            showToast(error.message || 'Failed to update client', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) return <div className="p-8"><LoadingSpinner /></div>;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Edit Client</h1>
            </div>
            {initialData && (
                <ClientForm
                    initialData={initialData}
                    onSubmit={handleUpdateClient}
                    isLoading={isLoading}
                />
            )}
        </div>
    );
};

export default EditClientPage;
