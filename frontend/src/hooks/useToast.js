import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

// Usage: 
// const { showToast } = useToast();
// showToast('Invoice Saved!', 'success');

export default function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
