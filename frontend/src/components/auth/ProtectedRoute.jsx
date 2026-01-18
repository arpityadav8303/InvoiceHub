import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 1. While checking if user is logged in, show a spinner
  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  // 2. If not logged in, kick them to /login
  // We save "state={{ from: location }}" so we can send them back 
  // to the page they tried to visit after they login.
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. If logged in, let them pass
  return children;
};

export default ProtectedRoute;