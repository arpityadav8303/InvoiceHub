import React from 'react';
import { Calendar } from 'lucide-react';

const DatePicker = ({
  label,
  name,
  value,
  onChange,
  error,
  min,
  max,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="date"
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          disabled={disabled}
          className={`
            block w-full rounded-lg shadow-sm pl-10 pr-3 py-2.5 transition-colors duration-200
            ${error
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500 dark:border-red-800'
              : 'border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white'
            }
            border sm:text-sm
            disabled:opacity-60 disabled:cursor-not-allowed
            [color-scheme:light] dark:[color-scheme:dark]
          `}
          {...props}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default DatePicker;
