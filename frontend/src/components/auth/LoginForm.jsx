import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from './FormInput';
import PasswordInput from './PasswordInput';
import FormButton from './FormButton';
import FormErrorMessage from './FormErrorMessage';
import { loginUser, loginClient, saveToken } from '../../services/authService';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants';

function LoginForm() {
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user'); // 'user' or 'client'

  // Loading and error state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});

  /**
   * Validate form fields
   * @returns {boolean} - True if valid, false otherwise
   */
  const validateForm = () => {
    const errors = {};

    if (!email.trim()) {
      errors.email = ERROR_MESSAGES.EMAIL_REQUIRED;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }

    if (!password.trim()) {
      errors.password = ERROR_MESSAGES.PASSWORD_REQUIRED;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let response;

      // Call appropriate login function based on user type
      if (userType === 'user') {
        response = await loginUser(email, password);
      } else {
        response = await loginClient(email, password);
      }

      // Check if login was successful
      if (response.success) {
        // Save token to localStorage
        saveToken(response.token);

        // Save user data (optional - can use Redux later)
        localStorage.setItem('userData', JSON.stringify(response.user));
        localStorage.setItem('userType', userType);

        // Show success message (optional - use toast later)
        console.log(SUCCESS_MESSAGES.LOGIN_SUCCESS);

        // Navigate to appropriate dashboard
        if (userType === 'user') {
          navigate('/dashboard/user', { replace: true });
        } else {
          navigate('/dashboard/client', { replace: true });
        }
      } else {
        setError(response.message || ERROR_MESSAGES.LOGIN_FAILED);
      }
    } catch (err) {
      // Handle error
      setError(err.message || ERROR_MESSAGES.LOGIN_FAILED);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      {/* Heading */}
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login</h2>

      {/* Error Alert */}
      {error && (
        <FormErrorMessage
          message={error}
          onClose={() => setError('')}
        />
      )}

      {/* User Type Selection */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Login as:
        </label>
        <div className="flex gap-4">
          {/* Business Owner Option */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="userType"
              value="user"
              checked={userType === 'user'}
              onChange={(e) => setUserType(e.target.value)}
              className="w-4 h-4"
            />
            <span className="text-gray-700">Business Owner</span>
          </label>

          {/* Client Option */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="userType"
              value="client"
              checked={userType === 'client'}
              onChange={(e) => setUserType(e.target.value)}
              className="w-4 h-4"
            />
            <span className="text-gray-700">Client</span>
          </label>
        </div>
      </div>

      {/* Email Input */}
      <FormInput
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={validationErrors.email}
        required
        name="email"
      />

      {/* Password Input */}
      <PasswordInput
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={validationErrors.password}
        required
        name="password"
      />

      {/* Submit Button */}
      <FormButton
        text="Login"
        loading={loading}
        disabled={loading}
        type="submit"
      />

      {/* Sign Up Link */}
      <p className="text-center text-gray-600 mt-4">
        Don't have an account?{' '}
        <a
          href="/auth/signup"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Sign Up
        </a>
      </p>
    </form>
  );
}

export default LoginForm;