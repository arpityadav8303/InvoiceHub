import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormInput from './FormInput';
import PasswordInput from './PasswordInput';
import FormButton from './FormButton';
import FormErrorMessage from './FormErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { ERROR_MESSAGES, BUSINESS_TYPES } from '../../utils/constants';

function SignupForm() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    businessName: '',
    phone: '',
    businessType: 'freelancer',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = ERROR_MESSAGES.FIRSTNAME_REQUIRED;
    }

    if (!formData.lastName.trim()) {
      errors.lastName = ERROR_MESSAGES.LASTNAME_REQUIRED;
    }

    if (!formData.email.trim()) {
      errors.email = ERROR_MESSAGES.EMAIL_REQUIRED;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }

    if (!formData.password.trim()) {
      errors.password = ERROR_MESSAGES.PASSWORD_REQUIRED;
    } else if (formData.password.length < 6) {
      errors.password = ERROR_MESSAGES.PASSWORD_MIN_LENGTH;
    }

    if (!formData.businessName.trim()) {
      errors.businessName = ERROR_MESSAGES.BUSINESS_NAME_REQUIRED;
    }

    if (!formData.phone.trim()) {
      errors.phone = ERROR_MESSAGES.PHONE_REQUIRED;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = ERROR_MESSAGES.PHONE_INVALID;
    }

    if (!formData.businessType) {
      errors.businessType = ERROR_MESSAGES.BUSINESS_TYPE_REQUIRED;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard/user', { replace: true });
    } catch (err) {
      setError(err.message || ERROR_MESSAGES.REGISTRATION_FAILED);
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      {error && (
        <FormErrorMessage
          message={error}
          onClose={() => setError('')}
        />
      )}

      <FormInput
        label="First Name"
        type="text"
        placeholder="John"
        value={formData.firstName}
        onChange={handleInputChange}
        error={validationErrors.firstName}
        required
        name="firstName"
      />

      <FormInput
        label="Last Name"
        type="text"
        placeholder="Doe"
        value={formData.lastName}
        onChange={handleInputChange}
        error={validationErrors.lastName}
        required
        name="lastName"
      />

      <FormInput
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={handleInputChange}
        error={validationErrors.email}
        required
        name="email"
      />

      <PasswordInput
        label="Password"
        placeholder="At least 6 characters"
        value={formData.password}
        onChange={handleInputChange}
        error={validationErrors.password}
        required
        name="password"
      />

      <FormInput
        label="Business Name"
        type="text"
        placeholder="Your Company Name"
        value={formData.businessName}
        onChange={handleInputChange}
        error={validationErrors.businessName}
        required
        name="businessName"
      />

      <FormInput
        label="Phone Number"
        type="tel"
        placeholder="10-digit number"
        value={formData.phone}
        onChange={handleInputChange}
        error={validationErrors.phone}
        required
        name="phone"
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Business Type <span className="text-red-500">*</span>
        </label>
        <select
          name="businessType"
          value={formData.businessType}
          onChange={handleInputChange}
          className={`
            w-full px-4 py-2 border rounded-lg outline-none transition
            ${validationErrors.businessType
              ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500'
              : 'border-gray-300 focus:ring-2 focus:ring-blue-500'
            }
          `}
        >
          <option value="">Select Business Type</option>
          {BUSINESS_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {validationErrors.businessType && (
          <p className="text-red-500 text-sm mt-1">{validationErrors.businessType}</p>
        )}
      </div>

      <FormButton
        text="Create Account"
        loading={loading}
        disabled={loading}
        type="submit"
      />

      <p className="text-center text-gray-600 mt-4">
        Already have an account?{' '}
        <a
          href="/auth/login"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Login
        </a>
      </p>
    </form>
  );
}

export default SignupForm;