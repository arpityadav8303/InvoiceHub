import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, CreditCard, ShieldAlert, LogOut } from 'lucide-react';
import { logoutUser } from '../../services/authService';

const Sidebar = ({ className = '' }) => {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard/user' },
    { name: 'Invoices', icon: FileText, path: '/invoices' },
    { name: 'Clients', icon: Users, path: '/clients' },
    { name: 'Payments', icon: CreditCard, path: '/payments' },
    { name: 'Risk Reports', icon: ShieldAlert, path: '/risk' },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force navigation to login even if API fails
      navigate('/login');
    }
  };

  return (
    <div className={`w-full h-full bg-gray-900 text-white flex flex-col p-4 ${className}`}>
      <div className="mb-8 px-2 flex items-center gap-2">
        {/* Simple Logo Placeholder */}
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">
          I
        </div>
        <h1 className="text-xl font-bold text-blue-400">InvoiceHub</h1>
      </div>
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-800 pt-4 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-400 hover:bg-gray-800 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;