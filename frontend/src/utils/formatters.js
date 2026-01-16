import { APP_CONFIG } from './constants';

// 1. Format Money (e.g., ₹ 1,20,000.00)
export const formatCurrency = (amount, currency = APP_CONFIG.CURRENCY) => {
  if (amount === undefined || amount === null) return '-';
  
  return new Intl.NumberFormat(APP_CONFIG.LOCALE, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

// 2. Format Date (e.g., "12 Jan, 2024")
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid Date';

  return new Intl.DateTimeFormat(APP_CONFIG.LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

// 3. Format DateTime (e.g., "12 Jan, 2024 at 10:30 AM")
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';

  return new Intl.DateTimeFormat(APP_CONFIG.LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// 4. Shorten Text (e.g., "Very long client na...")
export const truncateText = (text, maxLength = 20) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

// 5. Format Status (e.g., "payment_pending" -> "Payment Pending")
export const formatStatusKey = (key) => {
  if (!key) return '';
  return key.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};