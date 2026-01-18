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

  // 1. Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    gstIn: '',
  });

  const [errors, setErrors] = useState({});

  // 2. Pre-fill data if editing
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // 3. Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
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
      const fieldValidators = clientSchema[field];
      const error = validateField(formData[field], fieldValidators);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);

    // B. Stop if invalid
    if (!isValid) {
      showToast('Please fix the errors in the form', 'error');
      return;
    }

    // C. Submit
    onSubmit(formData);
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
