import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientForm from '../../components/client/ClientForm';
import { createClient } from '../../services/clientService';
import { useToast } from '../../hooks/useToast';

const CreateClientPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateClient = async (clientData) => {
        setIsLoading(true);
        try {
            // Transform data to match backend schema
            const nameParts = clientData.name.trim().split(' ');
            let firstName = nameParts[0];
            let lastName = nameParts.slice(1).join(' ');

            // Validation fixes
            if (firstName.length < 2) firstName += "_User"; // Ensure min length
            if (!lastName || lastName.length < 2) lastName = "Unknown"; // Ensure min length and presence

            // Phone formatting (strip non-digits)
            const phone = clientData.phone.replace(/\D/g, '').slice(-10);

            const payload = {
                firstName,
                lastName,
                email: clientData.email,
                phone: phone,
                companyName: clientData.companyName || undefined, // Send undefined if empty to avoid validation errors if schema prevents empty strings
                address: {
                    street: clientData.address,
                    city: 'Unknown', // Provide defaults as these fields might be validated if address object exists
                    state: 'Unknown',
                    zipCode: '000000'
                },
                gstNumber: clientData.gstIn || undefined,
                password: clientData.password, // Optional password from form
            };

            console.log('Sending payload:', payload);
            await createClient(payload);
            showToast('Client created successfully', 'success');
            navigate('/clients');
        } catch (error) {
            console.error('Error creating client:', error);
            // Log the specific validation details if available
            if (error.details) {
                console.error('Validation Details:', error.details);
                const errorMessages = error.details.map(d => d.message).join(', ');
                showToast(`Validation Failed: ${errorMessages}`, 'error');
            } else {
                showToast(error.message || 'Failed to create client', 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Client</h1>
            <ClientForm
                onSubmit={handleCreateClient}
                isLoading={isLoading}
            />
        </div>
    );
};

export default CreateClientPage;
