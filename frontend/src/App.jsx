import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastProvider';
import DashboardLayout from './components/layout/DashboardLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotFound from './components/common/NotFound';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import ClientsPage from './pages/dashboard/ClientsPage';
import InvoicesPage from './pages/dashboard/InvoicesPage';
import CreateInvoicePage from './pages/dashboard/CreateInvoicePage';
import PaymentsPage from './pages/dashboard/PaymentsPage';
import RiskPage from './pages/dashboard/RiskPage';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard/user" replace />;
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicRoute><div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700"><div className="bg-white p-10 rounded-xl shadow-lg border border-gray-200 w-full max-w-md"><h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Login</h1><LoginForm /></div></div></PublicRoute>} />
              <Route path="/auth/login" element={<PublicRoute><div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700"><div className="bg-white p-10 rounded-xl shadow-lg border border-gray-200 w-full max-w-md"><h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Login</h1><LoginForm /></div></div></PublicRoute>} />
              <Route path="/auth/signup" element={<PublicRoute><div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="bg-white p-10 rounded-xl shadow-lg border border-gray-200 w-full max-w-md"><h1 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Sign Up</h1><SignupForm /></div></div></PublicRoute>} />

              {/* Protected Dashboard Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/dashboard/user" replace />} />
                <Route path="user" element={<DashboardOverview />} />
                <Route path="client" element={<div className="p-8">Client Dashboard Coming Soon</div>} />
              </Route>

              {/* Clients Module */}
              <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />

              {/* Invoices Module */}
              <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
              <Route path="/invoices/create" element={<ProtectedRoute><CreateInvoicePage /></ProtectedRoute>} />

              {/* Payments Module */}
              <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />

              {/* Risk Module */}
              <Route path="/risk" element={<ProtectedRoute><RiskPage /></ProtectedRoute>} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;