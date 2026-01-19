import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastProvider';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute'; 
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage'; 
import ErrorBoundary from './components/common/ErrorBoundary';
import NotFound from './components/common/NotFound';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import ClientsPage from './pages/dashboard/ClientsPage';
import ClientDetailsPage from './pages/dashboard/ClientDetailsPage';
import ClientForm from './components/client/ClientForm';
import InvoiceDetailsPage from './pages/dashboard/InvoiceDetailsPage';
import EditInvoicePage from './pages/dashboard/EditInvoicePage';
import ClientRiskDetailsPage from './pages/dashboard/ClientRiskDetailsPage';
import PaymentDetailsPage from './pages/dashboard/PaymentDetailsPage';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Protected Routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                {/* Default Redirect */}
                <Route index element={<Navigate to="/dashboard" replace />} />

                {/* Main Dashboards */}
                <Route path="dashboard/user" element={<DashboardOverview />} />
                <Route path="dashboard/client" element={<div>Client View (Coming Soon)</div>} />

                {/* Modules */}
                <Route path="clients" element={<ClientsPage />} /> {/* Wrapped in layout, remove div padding if needed */}
                <Route path="clients/new" element={<ClientForm onSubmit={console.log} isLoading={false} />} />
                <Route path="clients/:id" element={<ClientDetailsPage />} />
                <Route path="clients/:id/risk" element={<ClientRiskDetailsPage />} />

                <Route path="invoices" element={<div className="p-4">Invoice List Component</div>} />
                <Route path="invoices/new" element={<EditInvoicePage />} />
                <Route path="invoices/:id" element={<InvoiceDetailsPage />} />
                <Route path="invoices/edit/:id" element={<EditInvoicePage />} />

                <Route path="payments/:id" element={<PaymentDetailsPage />} />

                {/* 404 for inner dashboard routes */}
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Global 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;