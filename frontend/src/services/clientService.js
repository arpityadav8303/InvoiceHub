import api from './api';

export const getAllClients = async (filters = {}) => {
    try {
        const response = await api.get('/client', { params: filters });
        return {
            success: true,
            data: response.data.clients || []
        };
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getClientById = async (id) => {
    try {
        const response = await api.get(`/client/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createClient = async (clientData) => {
    try {
        const response = await api.post('/client', clientData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateClient = async (id, clientData) => {
    try {
        const response = await api.put(`/client/${id}`, clientData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteClient = async (id) => {
    try {
        const response = await api.delete(`/client/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getClientRiskAssessment = async (id) => {
    try {
        const response = await api.get(`/dashboard/risk-assessment/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};


export const getClientProfile = async (id) => {
    try {
        const response = await api.get(`/dashboard/client-profile/${id}`);
        return response.data; // Returns { success: true, data: { ... } }
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// ==========================================
// CLIENT PORTAL API CALLS
// ==========================================

export const getClientDashboardOverview = async () => {
    try {
        const response = await api.get('/clientDashboard/client');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getMyProfile = async () => {
    try {
        const response = await api.get('/clientDashboard/clientProfile');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getMyInvoices = async (filters = {}) => {
    try {
        const response = await api.get('/clientDashboard/clientInvoices', { params: filters });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getMyPayments = async () => {
    try {
        const response = await api.get('/clientDashboard/clientPayments');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updatePassword = async (currentPassword, newPassword) => {
    try {
        const response = await api.put('/clientDashboard/updateClientPassword', { currentPassword, newPassword });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
