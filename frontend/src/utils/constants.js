export const APP_CONFIG = {
  CURRENCY: 'INR',
  LOCALE: 'en-IN',
};

export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\d{10}$/,
};

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  LOGIN_CLIENT: '/auth/loginClient',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
};

// ERROR MESSAGES
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
  INVALID_EMAIL: 'Please enter a valid email address',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  FIRSTNAME_REQUIRED: 'First name is required',
  LASTNAME_REQUIRED: 'Last name is required',
  BUSINESS_NAME_REQUIRED: 'Business name is required',
  PHONE_REQUIRED: 'Phone number is required',
  BUSINESS_TYPE_REQUIRED: 'Business type is required',
  PHONE_INVALID: 'Please enter a valid 10-digit phone number',
};

// SUCCESS MESSAGES
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  SIGNUP_SUCCESS: 'Registration successful!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
};

// USER TYPES
export const USER_TYPES = {
  USER: 'user',
  CLIENT: 'client',
};

// BUSINESS TYPES
export const BUSINESS_TYPES = [
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'agency', label: 'Agency' },
  { value: 'startup', label: 'Startup' },
  { value: 'service', label: 'Service Provider' },
];

// LOCAL STORAGE KEYS
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_DATA: 'userData',
  USER_TYPE: 'userType',
};

// API BASE URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';