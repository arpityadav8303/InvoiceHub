import React from 'react';
import { Loader2 } from 'lucide-react'; // Icon for the loading spinner

const Button = ({
  children,
  onClick,
  type = 'button', // 'button', 'submit', or 'reset'
  variant = 'primary', // 'primary', 'secondary', 'danger', 'ghost'
  size = 'md', // 'sm', 'md', 'lg', 'icon'
  isLoading = false, // If true, disables button and shows spinner
  disabled = false, // Standard disabled state
  icon: Icon, // Optional icon component (e.g., icon={Plus})
  className = '', // Allow extra classes if absolutely needed
  ...props // Catch-all for other standard HTML props (like id, title)
}) => {

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 border-transparent focus:ring-blue-500 shadow-sm',
    secondary: 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-gray-200 shadow-sm dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent focus:ring-red-500 shadow-sm',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-transparent dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2', 
  };

  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`
        ${baseStyles} 
        ${variants[variant]} 
        ${sizes[size]} 
        ${className}
      `}
      {...props}
    >
      {/* A. If Loading: Show Spinner */}
      {isLoading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      )}

      {/* B. If Icon Provided (and not loading): Show Icon */}
      {/* We hide the icon while loading to prevent the button from jumping width */}
      {!isLoading && Icon && (
        <Icon className={`w-4 h-4 ${children ? 'mr-2' : ''}`} />
      )}

      {/* C. The Button Text */}
      {children}
    </button>
  );
};

export default Button;
