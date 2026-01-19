import React, { useState, useEffect, useContext } from 'react';
import { loginUser, loginClient, logoutUser, getCurrentUser, registerUser, saveToken, getToken, removeToken } from '../services/authService';
import { AuthContext } from './AuthContextType';

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(localStorage.getItem('userType') || 'user');

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken();
        if (token) {
          // Ideally, verify token with backend here
          const userData = await getCurrentUser(); // Ensure this works for both types or adjust API
          if (userData && userData.data) {
            setUser(userData.data);
            setIsAuthenticated(true);
          } else if (userData) {
            // Fallback if structure is different
            setUser(userData);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("Session expired or invalid", error);
        removeToken();
        localStorage.removeItem('userType');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Updated Login Action to handle both types
  const login = async (credentials, type) => {
    let data;
    if (type === 'client') {
      data = await loginClient(credentials.email, credentials.password);
    } else {
      data = await loginUser(credentials.email, credentials.password);
    }

    if (data.success) {
      saveToken(data.token);
      localStorage.setItem('userType', type);
      setUserType(type);
      setUser(type === 'client' ? data.client : data.user);
      setIsAuthenticated(true);
    }
    return data;
  };

  const register = async (userData) => {
    // Registration is usually only for Business Owners (users)
    const data = await registerUser(userData); // Use existing service
    saveToken(data.token);
    localStorage.setItem('userType', 'user');
    setUserType('user');
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  const logout = () => {
    logoutUser();
    removeToken();
    localStorage.removeItem('userType');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    userType,
    loading,
    isAuthenticated,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};