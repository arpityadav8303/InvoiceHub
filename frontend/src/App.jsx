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
import CreateClientPage from './pages/dashboard/CreateClientPage';
import EditClientPage from './pages/dashboard/EditClientPage';
import ClientForm from './components/client/ClientForm';
import InvoiceDetailsPage from './pages/dashboard/InvoiceDetailsPage';
import EditInvoicePage from './pages/dashboard/EditInvoicePage';
import CreateInvoicePage from './pages/dashboard/CreateInvoicePage';
import ClientRiskDetailsPage from './pages/dashboard/ClientRiskDetailsPage';
import PaymentDetailsPage from './pages/dashboard/PaymentDetailsPage';
import PaymentsPage from './pages/dashboard/PaymentsPage';
import InvoicesPage from './pages/dashboard/InvoicesPage';

import RiskPage from './pages/dashboard/RiskPage';

import ClientDashboardLayout from './components/layout/ClientDashboardLayout';
import ClientDashboardPage from './pages/client/ClientDashboardPage';
import ClientInvoicesPage from './pages/client/ClientInvoicesPage';
import ClientPaymentsPage from './pages/client/ClientPaymentsPage';
import ClientProfilePage from './pages/client/ClientProfilePage';

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

              {/* Protected Routes - Main App (Business Owner) */}
              <Route path="/" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                {/* Default Redirect */}
                <Route index element={<Navigate to="/dashboard/user" replace />} />

                <Route path="dashboard/user" element={<DashboardOverview />} />

                {/* Business Modules */}
                <Route path="clients" element={<ClientsPage />} />
                <Route path="clients/new" element={<CreateClientPage />} />
                <Route path="clients/:id" element={<ClientDetailsPage />} />
                <Route path="clients/edit/:id" element={<EditClientPage />} />
                <Route path="clients/:id/risk" element={<ClientRiskDetailsPage />} />

                <Route path="risk" element={<RiskPage />} />

                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="invoices/new" element={<CreateInvoicePage />} />
                <Route path="invoices/:id" element={<InvoiceDetailsPage />} />
                <Route path="invoices/edit/:id" element={<EditInvoicePage />} />

                <Route path="payments" element={<PaymentsPage />} />
                <Route path="payments/:id" element={<PaymentDetailsPage />} />
              </Route>

              {/* Protected Routes - Client Portal */}
              <Route path="/portal" element={
                <ProtectedRoute>
                  <ClientDashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/portal/dashboard" replace />} />
                <Route path="dashboard" element={<ClientDashboardPage />} />
                <Route path="invoices" element={<ClientInvoicesPage />} />
                <Route path="payments" element={<ClientPaymentsPage />} />
                <Route path="profile" element={<ClientProfilePage />} />

                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Global 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider >
    </ErrorBoundary >
  );
}

export default App;