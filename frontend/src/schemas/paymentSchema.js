import { validators } from '../utils/validators';

export const paymentSchema = {
  invoiceId: [validators.required],
  amount: [
    validators.required,
    validators.number,
    (value) => value <= 0 ? 'Amount must be greater than 0' : null
  ],
  date: [validators.required],
  method: [validators.required], // Bank Transfer, UPI, Cash, etc.
  transactionId: [
    // Optional but if provided must be at least 3 chars
    (value) => value && value.length < 3 ? 'Transaction ID is too short' : null
  ],
  notes: [] // Optional
};
