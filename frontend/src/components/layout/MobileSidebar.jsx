import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar'; // Reusing your existing desktop Sidebar content

const MobileSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  // Close sidebar automatically when route changes (user clicks a link)
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* 1. Backdrop Overlay */}
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* 2. Sidebar Panel */}
      <div className="fixed inset-y-0 left-0 w-64 bg-slate-900 shadow-xl transform transition-transform duration-300 ease-in-out">
        
        {/* Mobile Header (Close Button) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <span className="text-white font-bold text-xl">InvoiceHub</span>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
        </div>

        {/* Content - We reuse the Sidebar logic here, 
            assuming Sidebar.jsx exports the nav links logic or we manually render links here */}
        <div className="h-full overflow-y-auto">
            {/* Ideally, your Sidebar.jsx should accept a prop to hide its logo if rendered here,
                or you can import the NavigationLinks component directly.
                For now, we render the Sidebar component which handles the links. */}
            <Sidebar isMobile={true} />
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
