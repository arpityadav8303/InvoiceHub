import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from './FormInput';
import PasswordInput from './PasswordInput';
import FormButton from './FormButton';
import FormErrorMessage from './FormErrorMessage';
import { useAuth } from '../../context/AuthContext'; // Import Context Hook
import { ERROR_MESSAGES } from '../../utils/constants';

function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth(); // Use the context function

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!email.trim()) errors.email = ERROR_MESSAGES.EMAIL_REQUIRED;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ERROR_MESSAGES.INVALID_EMAIL;
    if (!password.trim()) errors.password = ERROR_MESSAGES.PASSWORD_REQUIRED;
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Pass userType to the context login function
      const response = await login({ email, password }, userType);

      if (response.success) {
        // Redirect based on role
        if (userType === 'user') {
          navigate('/dashboard/user', { replace: true });
        } else {
          navigate('/portal/dashboard', { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || ERROR_MESSAGES.LOGIN_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login</h2>

      {error && <FormErrorMessage message={error} onClose={() => setError('')} />}

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-3">Login as:</label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="userType" value="user" checked={userType === 'user'} onChange={(e) => setUserType(e.target.value)} className="w-4 h-4" />
            <span className="text-gray-700">Business Owner</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" name="userType" value="client" checked={userType === 'client'} onChange={(e) => setUserType(e.target.value)} className="w-4 h-4" />
            <span className="text-gray-700">Client</span>
          </label>
        </div>
      </div>

      <FormInput label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={validationErrors.email} required name="email" />
      <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.target.value)} error={validationErrors.password} required name="password" />
      <FormButton text="Login" loading={loading} disabled={loading} type="submit" />

      <p className="text-center text-gray-600 mt-4">
        Don't have an account? <a href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">Sign Up</a>
      </p>
    </form>
  );
}

export default LoginForm;