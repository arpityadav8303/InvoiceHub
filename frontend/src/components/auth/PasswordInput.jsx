import { useState } from 'react';

/**
 * Password Input Component with Show/Hide Toggle
 * @param {string} label - Input label
 * @param {string} placeholder - Placeholder text
 * @param {string} value - Current password value
 * @param {function} onChange - Change handler
 * @param {string} error - Error message (if any)
 * @param {boolean} required - Is field required?
 */
function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  name,
}) {
  // State to toggle show/hide password
  const [showPassword, setShowPassword] = useState(false);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="mb-4">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Password Input Container */}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`
            w-full px-4 py-2 border rounded-lg outline-none transition pr-10
            ${
              error
                ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500'
                : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
            }
          `}
        />

        {/* Show/Hide Password Button */}
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? (
            // Hide Icon (Eye Slash)
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" />
              <path d="M15.171 13.576l1.414 1.414a1 1 0 001.414-1.414l-14-14a1 1 0 00-1.414 1.414l1.473 1.473A10.014 10.014 0 00.458 10C1.732 14.057 5.522 17 10 17a9.958 9.958 0 004.512-1.074l1.78 1.781z" />
            </svg>
          ) : (
            // Show Icon (Eye)
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

export default PasswordInput;
