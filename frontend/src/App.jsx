import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import InvoicesPage from './pages/dashboard/InvoicesPage';
import CreateInvoicePage from './pages/dashboard/CreateInvoicePage'; // New Page
import ClientsPage from './pages/dashboard/ClientsPage';
import PaymentsPage from './pages/dashboard/PaymentsPage';
import RiskPage from './pages/dashboard/RiskPage';
import Sidebar from './components/layout/Sidebar';

// Layout component to reduce repetition
const DashboardLayout = ({ children }) => (
  <>
    <Sidebar />
    {children}
  </>
);

function App() {
  return (
    <Router>
      <Routes>
       
        <Route path="/" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />

        
        <Route path="/dashboard/user" element={<DashboardLayout><DashboardOverview /></DashboardLayout>} />
        <Route path="/clients" element={<DashboardLayout><ClientsPage /></DashboardLayout>} />
        <Route path="/payments" element={<DashboardLayout><PaymentsPage /></DashboardLayout>} />
        <Route path="/risk" element={<DashboardLayout><RiskPage /></DashboardLayout>} />
        
        
        <Route path="/invoices" element={<DashboardLayout><InvoicesPage /></DashboardLayout>} />
        <Route path="/invoices/create" element={<DashboardLayout><CreateInvoicePage /></DashboardLayout>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;