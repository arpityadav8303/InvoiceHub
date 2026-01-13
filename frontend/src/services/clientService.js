import api from './axiosConfig';

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
