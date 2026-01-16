import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-50 backdrop-blur-sm'
    : 'flex items-center justify-center p-4';

  return (
    <div className={containerClasses}>
      <Loader2 
        className={`${sizeClasses[size]} text-blue-600 animate-spin`} 
      />
    </div>
  );
};

export default LoadingSpinner;
