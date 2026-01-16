import { PATTERNS } from './constants';

export const validators = {
  // Check if field is empty
  required: (value) => {
    return value && value.toString().trim() !== '' ? null : 'This field is required';
  },

  // Check Email format
  email: (value) => {
    if (!value) return null; // Allow empty (use required if needed)
    return PATTERNS.EMAIL.test(value) ? null : 'Please enter a valid email address';
  },

  // Check Phone format
  phone: (value) => {
    if (!value) return null;
    return PATTERNS.PHONE.test(value) ? null : 'Please enter a valid 10-digit phone number';
  },

  // Check Password strength
  password: (value) => {
    if (!value) return null;
    if (value.length < 6) return 'Password must be at least 6 characters';
    // You can uncomment strict check if needed:
    // return PATTERNS.PASSWORD.test(value) ? null : 'Password must contain letters and numbers';
    return null;
  },

  // Check for valid numbers
  number: (value) => {
    if (value === '' || value === null) return null;
    return !isNaN(value) && Number(value) >= 0 ? null : 'Please enter a valid positive number';
  }
};

// Helper to run multiple validators on one field
export const validateField = (value, rules = []) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
};
