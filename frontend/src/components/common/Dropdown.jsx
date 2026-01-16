import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

const Dropdown = ({ 
  trigger, // Optional custom trigger icon/button
  items = [], // Array of { label, onClick, variant }
  align = 'right' // 'left' or 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700 transition-colors focus:outline-none"
      >
        {trigger || <MoreVertical size={20} />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`
            absolute z-10 w-48 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 focus:outline-none
            ${align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}
          `}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={`
                  flex w-full items-center px-4 py-2 text-sm text-left
                  ${item.variant === 'danger' 
                    ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
