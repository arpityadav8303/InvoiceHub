import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, CreditCard, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ClientSidebar = ({ className = '', onClose }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/portal/dashboard' },
        { name: 'My Invoices', icon: FileText, path: '/portal/invoices' },
        { name: 'Payments', icon: CreditCard, path: '/portal/payments' },
        { name: 'My Profile', icon: User, path: '/portal/profile' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={`w-full h-full bg-gray-900 text-white flex flex-col p-4 ${className}`}>
            <div className="mb-8 px-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center font-bold text-white">
                    C
                </div>
                <h1 className="text-xl font-bold text-green-400">Client Portal</h1>
            </div>
            <nav className="space-y-2 flex-1">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={onClose} // Close sidebar on mobile when link is clicked
                        className={({ isActive }) =>
                            `flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800'
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

export default ClientSidebar;
