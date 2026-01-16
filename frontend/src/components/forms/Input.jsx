import React from 'react';
import { AlertCircle } from 'lucide-react';

const Input = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,          // Pass an error message string to trigger red state
  icon: Icon,     // Optional icon to show on the left
  helperText,     // Optional text below the input
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {/* 1. LABEL */}
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* 2. INPUT WRAPPER (Handles Icon Positioning) */}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            block w-full rounded-lg shadow-sm transition-colors duration-200
            ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5
            ${error 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500 dark:border-red-800 dark:bg-red-900/10' 
              : 'border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400'
            }
            border sm:text-sm
            disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-900
          `}
          {...props}
        />

        {/* Error Icon (Right side) */}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>

      {/* 3. HELPER TEXT / ERROR MESSAGE */}
      {error ? (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-1">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default Input;
