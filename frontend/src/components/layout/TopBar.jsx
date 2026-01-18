import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';
import Button from '../common/Button';
import SearchBar from '../common/SearchBar'; // Reusing generic search
import Dropdown from '../common/Dropdown';
import { useAuth } from '../../context/AuthContext'; // Assuming you have auth context
import { getInitials } from '../../utils/helpers';

const TopBar = ({ onMobileMenuClick, pageTitle = "Dashboard" }) => {
  const { user, logout } = useAuth();

  // Dropdown items for User Profile
  const userMenuItems = [
    { label: 'Profile', onClick: () => console.log('Profile'), icon: <User size={16}/> },
    { label: 'Logout', onClick: logout, variant: 'danger' }
  ];

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-full gap-4">
        
        {/* LEFT: Mobile Menu & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMobileMenuClick}
            className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Menu size={24} />
          </button>
          
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white hidden sm:block">
            {pageTitle}
          </h1>
        </div>

        {/* CENTER: Global Search (Hidden on small mobile) */}
        <div className="hidden md:block flex-1 max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search anything..." 
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
            </div>
        </div>

        {/* RIGHT: Actions & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Notifications */}
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-800"></span>
            </button>

            {/* User Dropdown */}
            <div className="border-l border-gray-200 dark:border-gray-700 pl-4">
                <Dropdown
                    align="right"
                    items={userMenuItems}
                    trigger={
                        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user?.name || 'Guest User'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user?.role || 'Admin'}
                                </p>
                            </div>
                            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                                {getInitials(user?.name || 'Guest')}
                            </div>
                        </div>
                    }
                />
            </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
