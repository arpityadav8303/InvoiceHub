import api from './api';

export const getDashboardOverview = async () => {
  try {
    const response = await api.get('/dashboard/overview');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDashboardCharts = async () => {
  try {
    const response = await api.get('/dashboard/charts');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getDashboardActivity = async () => {
  try {
    const response = await api.get('/dashboard/activity');
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