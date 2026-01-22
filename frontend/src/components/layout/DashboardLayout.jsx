import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom'; // Renders the current page
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileSidebar from './MobileSidebar';

const DashboardLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Close mobile sidebar automatically when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">

      {/* 1. Desktop Sidebar (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <Sidebar className="" />
      </div>

      {/* 2. Mobile Sidebar (Hidden on desktop) */}
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* 3. Main Content Area */}
      <div className="flex flex-col flex-1 lg:pl-64 w-full transition-all duration-300">

        {/* Top Navigation */}
        <TopBar onMobileMenuClick={() => setIsMobileSidebarOpen(true)} />

        {/* Page Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet /> {/* This is where ClientList, InvoiceForm, etc. will appear */}
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
