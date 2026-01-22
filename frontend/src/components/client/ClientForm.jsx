import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, MapPin, FileText } from 'lucide-react';
import Input from '../forms/Input';
import TextArea from '../forms/TextArea';
import Button from '../common/Button';
import FormWrapper from '../forms/FormWrapper';
import { validateField } from '../../utils/validators';
import { clientSchema } from '../../schemas/clientSchema';
import { useToast } from '../../hooks/useToast';

const ClientForm = ({
  initialData = null, // If provided, we are in "Edit Mode"
  onSubmit,
  isLoading
}) => {
  const { showToast } = useToast();
  const [useAutoPassword, setUseAutoPassword] = useState(true);

  // 1. Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    gstIn: '',
    password: ''
  });

  const [errors, setErrors] = useState({});

  // 2. Pre-fill data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        password: '' // Don't pre-fill password on edit
      }));
      // If editing, we generally don't set password unless explicitly asked, so keep auto (which means no-op here usually) or hidden
      // But for edit mode, we might want to hide this entire section or handle password ressetting differently.
      // For now, let's just default auto-password to true so the field is hidden by default.
    }
  }, [initialData]);

  // 3. Handle Input Changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Handle Checkbox
    if (type === 'checkbox' && name === 'useAutoPassword') {
      setUseAutoPassword(checked);
      if (checked) {
        setFormData(prev => ({ ...prev, password: '' })); // Clear password if auto
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // 4. Handle Submission
  const handleSubmit = (e) => {
    // A. Run Validation
    const newErrors = {};
    let isValid = true;

    Object.keys(clientSchema).forEach(field => {
      // Skip validation for fields not in form
      if (field === 'password' && useAutoPassword) return;

      const fieldValidators = clientSchema[field];
      if (formData[field] !== undefined) { // Only validate if field exists in form data
        const error = validateField(formData[field], fieldValidators);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });

    if (!useAutoPassword && (!formData.password || formData.password.length < 6)) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);

    // B. Stop if invalid
    if (!isValid) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    // C. Submit
    // Filter out password if auto-gen is used
    const submissionData = { ...formData };
    if (useAutoPassword) {
      delete submissionData.password;
    }
    onSubmit(submissionData);
  };

  return (
    <FormWrapper
      title={initialData ? "Edit Client" : "Add New Client"}
      subtitle="Enter the client's details to manage their invoices."
      onSubmit={handleSubmit}
      className="max-w-3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            icon={User}
            placeholder="e.g. John Doe"
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            icon={Mail}
            placeholder="john@example.com"
            required
          />

          <Input
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            icon={Phone}
            placeholder="+91 98765 43210"
            required
          />

          {/* Password Section - Only show for new clients or specific edit flow if needed */}
          {!initialData && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Login Credentials</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="useAutoPassword"
                    name="useAutoPassword"
                    checked={useAutoPassword}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor="useAutoPassword" class="text-xs text-gray-500 cursor-pointer select-none">Auto-generate</label>
                </div>
              </div>

              {!useAutoPassword && (
                <div className="mt-2">
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="Set a password..."
                  />
                  <p className="text-xs text-gray-500 mt-1">A welcome email with login details will be sent to the client.</p>
                </div>
              )}
              {useAutoPassword && (
                <p className="text-xs text-gray-500 italic">A secure password will be automatically generated and emailed to the client.</p>
              )}
            </div>
          )}

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Input
            label="Company Name"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            error={errors.companyName}
            icon={Building}
            placeholder="Acme Corp (Optional)"
          />

          <Input
            label="Tax ID / GSTIN"
            name="gstIn"
            value={formData.gstIn}
            onChange={handleChange}
            error={errors.gstIn}
            icon={FileText}
            placeholder="GSTIN Number (Optional)"
          />
        </div>

        {/* Full Width */}
        <div className="col-span-1 md:col-span-2">
          <TextArea
            label="Billing Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={errors.address}
            placeholder="Enter complete billing address"
            rows={3}
            required
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          {initialData ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </FormWrapper>
  );
};

export default ClientForm;
