import api from './api';

/**
 * Request Interceptor
 * - Adds JWT token to every request header
 * - Runs before request is sent to backend
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('authToken');

    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Handles responses from backend
 * - If 401 (Unauthorized), clear token and redirect to login
 */
api.interceptors.response.use(
  (response) => {
    // Successful response - just return it
    return response;
  },
  (error) => {
    // Check if error status is 401 (Unauthorized)
    if (error.response?.status === 401) {
      // Clear token from localStorage
      localStorage.removeItem('authToken');

      // Redirect to login page
      window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  }
);

export default api;