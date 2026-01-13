import api from './axiosConfig';

export const getAllPayments = async (filters = {}) => {
    try {
        const response = await api.get('/payment', { params: filters });
        return {
            success: true,
            data: response.data.payments || []
        };
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const recordPayment = async (paymentData) => {
    try {
        const response = await api.post('/payment', paymentData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getPaymentById = async (id) => {
    try {
        const response = await api.get(`/payment/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
