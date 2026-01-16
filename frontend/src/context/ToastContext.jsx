import React, { createContext, useContext } from 'react';
const ToastContext = createContext();
export const ToastProvider = ({ children }) => <ToastContext.Provider value={{}}>{children}</ToastContext.Provider>;
export const useToast = () => useContext(ToastContext);
