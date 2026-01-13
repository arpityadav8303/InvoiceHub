import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import InvoicesPage from './pages/dashboard/InvoicesPage';
import ClientsPage from './pages/dashboard/ClientsPage';
import PaymentsPage from './pages/dashboard/PaymentsPage';
import RiskPage from './pages/dashboard/RiskPage';
import Sidebar from './components/layout/Sidebar';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route
          path="/dashboard/user"
          element={
            <>
              <Sidebar />
              <DashboardOverview />
            </>
          }
        />
        <Route
          path="/invoices"
          element={
            <>
              <Sidebar />
              <InvoicesPage />
            </>
          }
        />
        <Route
          path="/clients"
          element={
            <>
              <Sidebar />
              <ClientsPage />
            </>
          }
        />
        <Route
          path="/payments"
          element={
            <>
              <Sidebar />
              <PaymentsPage />
            </>
          }
        />
        <Route
          path="/risk"
          element={
            <>
              <Sidebar />
              <RiskPage />
            </>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;



