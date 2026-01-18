import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastProvider';

// Layouts & Common
import DashboardLayout from './components/layout/DashboardLayout';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotFound from './components/common/NotFound';

// Pages - Dashboard
//import DashboardHome from './pages/dashboard/DashboardHome'; // You need to create this simple file (see below)

// Pages - Clients
import ClientList from './components/client/ClientList'; // Adjust if you have a specific Page wrapper
import ClientDetailsPage from './pages/dashboard/ClientDetailsPage';
import ClientForm from './components/client/ClientForm'; // For Add/Edit

// Pages - Invoices
import InvoiceDetailsPage from './pages/dashboard/InvoiceDetailsPage';
import EditInvoicePage from './pages/dashboard/EditInvoicePage';
// Note: You might want to create an InvoiceListPage similar to ClientList

// Pages - Risk
import ClientRiskDetailsPage from './pages/dashboard/ClientRiskDetailsPage';

// Pages - Payments
import PaymentDetailsPage from './pages/dashboard/PaymentDetailsPage';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>

              {/* Public Routes (Login/Register would go here) */}
              <Route path="/login" element={<div>Login Page Placeholder</div>} />

              {/* Protected Dashboard Routes */}
              <Route path="/" element={<DashboardLayout />}>

                {/* Dashboard Home */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<div>Dashboard Home Component Here</div>} />

                {/* Clients Module */}
                <Route path="clients" element={<div className="p-4">Client List Component</div>} />
                <Route path="clients/new" element={<ClientForm onSubmit={console.log} isLoading={false} />} />
                <Route path="clients/:id" element={<ClientDetailsPage />} />
                <Route path="clients/:id/risk" element={<ClientRiskDetailsPage />} />

                {/* Invoices Module */}
                <Route path="invoices" element={<div className="p-4">Invoice List Component</div>} />
                <Route path="invoices/new" element={<EditInvoicePage />} /> {/* Reusing Edit page for New */}
                <Route path="invoices/:id" element={<InvoiceDetailsPage />} />
                <Route path="invoices/edit/:id" element={<EditInvoicePage />} />

                {/* Payments Module */}
                <Route path="payments/:id" element={<PaymentDetailsPage />} />

                {/* 404 Catch-All */}
                <Route path="*" element={<NotFound />} />

              </Route>

            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;