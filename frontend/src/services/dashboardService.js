import api from './api';

export const getDashboardOverview = async () => {
  try {
    const response = await api.get('/dashboard/overview');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getRevenueSummary = async (timeRange = 'month') => {
  try {
    const response = await api.get(`/dashboard/revenue-summary?timeRange=${timeRange}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};