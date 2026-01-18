import api from './api';

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Login failed' };
  }
};

export const loginClient = async (email, password) => {
  try {
    const response = await api.post('/auth/loginClient', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Login failed' };
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Registration failed' };
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post('/auth/logout');
    // Clear token from localStorage
    localStorage.removeItem('authToken');
    return response.data;
  } catch (error) {
    // Even if logout fails on backend, clear token locally
    localStorage.removeItem('authToken');
    throw error.response?.data || { success: false, message: 'Logout failed' };
  }
};

/**
 * Save Token to localStorage
 * @param {string} token - JWT token from backend
 */
export const saveToken = (token) => {
  localStorage.setItem('authToken', token);
};

/**
 * Get Token from localStorage
 * @returns {string} - JWT token or null
 */
export const getToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Remove Token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem('authToken');
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Failed to fetch user' };
  }
};