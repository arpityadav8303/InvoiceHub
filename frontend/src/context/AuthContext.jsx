import React, { useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, getCurrentUser } from '../services/authService';
import { AuthContext } from './AuthContextType';



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Initial loading check
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 1. Check for existing session on Mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token and get user data
          // Note: If you don't have a /me endpoint yet, you can decode the JWT
          // For now, we'll try to fetch the user if a token exists
          const userData = await getCurrentUser();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("Session expired or invalid", error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 2. Login Action
  const login = async (credentials) => {
    const data = await loginUser(credentials);
    localStorage.setItem('token', data.token); // Save token
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  // 3. Register Action
  const register = async (userData) => {
    const data = await registerUser(userData);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    return data;
  };

  // 4. Logout Action
  const logout = () => {
    logoutUser(); // Call API to clear cookies if needed
    localStorage.removeItem('token'); // Clear local storage
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
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
