import { validators } from '../utils/validators';

export const clientSchema = {
  name: [
    (value) => validators.required(value) || (value.length < 3 ? 'Name must be at least 3 characters' : null)
  ],
  email: [
    validators.required,
    validators.email
  ],
  phone: [
    validators.required,
    validators.phone
  ],
  companyName: [
    // Optional field, but if provided, must be at least 2 chars
    (value) => value && value.length < 2 ? 'Company name is too short' : null
  ],
  gstIn: [
    // Optional, but if provided, must match GST pattern
    (value) => value && validators.gst ? validators.gst(value) : null
  ],
  address: [
    validators.required
  ]
};