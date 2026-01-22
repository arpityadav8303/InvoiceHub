import api from './api';

export const getAllInvoices = async (filters = {}) => {
    try {
        console.log('Fetching invoices with filters:', filters);
        const response = await api.get('/invoice', { params: filters });
        console.log('Invoice API Response:', response.data);

        return {
            success: true,
            data: response.data.invoices || [],
            totalCount: response.data.totalCount || 0,
            currentPage: response.data.currentPage || 1,
            totalPages: response.data.totalPages || 1
        };
    } catch (error) {
        console.error('Invoice Service Error:', error);
        throw {
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to fetch invoices'
        };
    }
};

export const getInvoiceById = async (id) => {
    try {
        const response = await api.get(`/invoice/${id}`);
        return {
            success: true,
            data: response.data.invoice
        };
    } catch (error) {
        throw {
            success: false,
            message: error.response?.data?.message || error.message
        };
    }
};

export const createInvoice = async (invoiceData) => {
    try {
        console.log('Creating invoice with data:', invoiceData);
        const response = await api.post('/invoice', invoiceData);
        return {
            success: true,
            data: response.data.invoice,
            message: response.data.message || 'Invoice created successfully'
        };
    } catch (error) {
        console.error('Create Invoice Error:', error.response?.data);
        throw {
            success: false,
            message: error.response?.data?.message || error.message,
            errors: error.response?.data?.details || []
        };
    }
};

export const updateInvoice = async (id, invoiceData) => {
    try {
        const response = await api.put(`/invoice/${id}`, invoiceData);
        return {
            success: true,
            data: response.data.invoice,
            message: response.data.message || 'Invoice updated successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: error.response?.data?.message || error.message
        };
    }
};

export const deleteInvoice = async (id) => {
    try {
        const response = await api.delete(`/invoice/${id}`);
        return {
            success: true,
            message: response.data.message || 'Invoice deleted successfully'
        };
    } catch (error) {
        throw {
            success: false,
            message: error.response?.data?.message || error.message
        };
    }
};