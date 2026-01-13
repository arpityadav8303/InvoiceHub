import api from './axiosConfig';

export const getAllInvoices = async (filters = {}) => {
    try {
        const response = await api.get('/invoice', { params: filters });
        return {
            success: true,
            data: response.data.invoices || []
        };
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getInvoiceById = async (id) => {
    try {
        const response = await api.get(`/invoice/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const createInvoice = async (invoiceData) => {
    try {
        const response = await api.post('/invoice', invoiceData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateInvoice = async (id, invoiceData) => {
    try {
        const response = await api.put(`/invoice/${id}`, invoiceData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const deleteInvoice = async (id) => {
    try {
        const response = await api.delete(`/invoice/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
