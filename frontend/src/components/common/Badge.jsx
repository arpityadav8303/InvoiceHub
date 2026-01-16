import React from 'react';

const Badge = ({ 
  children, 
  variant = 'neutral',  
  size = 'md',         
  className = ''       
}) => {

  const variants = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800',
    
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800',
    
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800',
    
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
    
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs', 
    md: 'px-2.5 py-0.5 text-sm', 
  };

  const baseClasses = 'inline-flex items-center justify-center rounded-full font-medium transition-colors';

  return (
    <span 
      className={`
        ${baseClasses} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;