import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen,       
  onClose,      
  title,        
  children,     
  footer,       
  size = 'md'   
}) => {

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',      
    md: 'max-w-md',      
    lg: 'max-w-lg',      
    xl: 'max-w-xl',      
    full: 'w-full h-full m-4' 
  };

  return (
    // OVERLAY: Added 'backdrop-blur-sm' for modern glass effect
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 transition-opacity"
      onClick={onClose} 
    >
      
      {/* MODAL CONTAINER */}
      <div 
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full flex flex-col max-h-[90vh] ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()} 
      >
        
        {/* HEADER: Clean border with subtle colors */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY: Custom scrollbar support */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* FOOTER: Distinct background for action area */}
        {footer && (
          <div className="p-4 px-6 border-t border-gray-100 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 rounded-b-xl flex justify-end gap-3">
            {footer}
          </div>
        )}

      </div>
    </div>
  );
};

export default Modal;