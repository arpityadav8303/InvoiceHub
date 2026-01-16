import React, { useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { ToastContext } from './ToastContext';

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // Add a new toast
    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    }, []);

    // Remove a toast manually
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container (Fixed to top-right) */}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
              flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border min-w-[300px] animate-in slide-in-from-right
              ${toast.type === 'success' ? 'bg-white border-green-200 text-green-800 dark:bg-gray-800 dark:border-green-900 dark:text-green-400' : ''}
              ${toast.type === 'error' ? 'bg-white border-red-200 text-red-800 dark:bg-gray-800 dark:border-red-900 dark:text-red-400' : ''}
              ${toast.type === 'info' ? 'bg-white border-blue-200 text-blue-800 dark:bg-gray-800 dark:border-blue-900 dark:text-blue-400' : ''}
              ${toast.type === 'warning' ? 'bg-white border-yellow-200 text-yellow-800 dark:bg-gray-800 dark:border-yellow-900 dark:text-yellow-400' : ''}
            `}
                    >
                        {/* Icon based on type */}
                        {toast.type === 'success' && <CheckCircle size={18} />}
                        {toast.type === 'error' && <AlertCircle size={18} />}
                        {toast.type === 'warning' && <AlertTriangle size={18} />}
                        {toast.type === 'info' && <Info size={18} />}

                        <p className="text-sm font-medium flex-1">{toast.message}</p>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
