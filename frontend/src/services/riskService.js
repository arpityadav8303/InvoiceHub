import api from './api';

export const getRiskAssessment = async (clientId) => {
    try {
        const response = await api.get(`/dashboard/risk-assessment/${clientId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getClientRiskProfile = async (clientId) => {
    try {
        const response = await api.get(`/dashboard/client-profile/${clientId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
