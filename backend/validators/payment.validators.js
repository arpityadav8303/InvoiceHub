import Joi from 'joi'

const messages = {
  invoiceId: {
    'any.required': 'Invoice ID is required',
    'string.hex': 'Invoice ID must be valid',
    'string.length': 'Invoice ID must be 24 characters'
  },

  amount: {
    'any.required': 'Amount is required',
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be greater than 0'
  },

  paymentMethod: {
    'any.required': 'Payment method is required',
    'any.only': 'Payment method must be one of: bank_transfer, cheque, upi, card, cash'
  },

  paymentDate: {
    'any.required': 'Payment date is required',
    'date.base': 'Payment date must be a valid date',
    'date.max': 'Payment date cannot be in the future'
  },

  referenceNumber: {
    'string.base': 'Reference number must be a string'
  },

  ifscCode: {
    'string.pattern.base': 'IFSC code must be in valid format (e.g., HDFC0000001)'
  },

  transactionId: {
    'string.base': 'Transaction ID must be a string'
  },

  notes: {
    'string.base': 'Notes must be a string'
  },

  status: {
    'any.only': 'Status must be one of: draft, sent, paid, partially_paid, overdue, completed, pending, failed'
  },

}

const fields = {
  invoiceId: () => Joi.string().hex().length(24).messages(messages.invoiceId),

  amount: () => Joi.number().positive().messages(messages.amount),

  paymentMethod: () =>
    Joi.string()
      .valid('bank_transfer', 'cheque', 'upi', 'card', 'cash')
      .messages(messages.paymentMethod),

  paymentDate: () =>
    Joi.date()
      .max('now')
      .messages(messages.paymentDate),

  referenceNumber: () =>
    Joi.string()
      .trim()
      .messages(messages.referenceNumber),

  bankDetails: () =>
    Joi.object({
      bankName: Joi.string().trim().optional(),
      accountNumber: Joi.string().trim().optional(),
      ifscCode: Joi.string()
        .trim()
        .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
        .optional()
        .messages(messages.ifscCode)
    }).optional(),

  transactionId: () =>
    Joi.string()
      .trim()
      .messages(messages.transactionId),

  notes: () =>
    Joi.string()
      .trim()
      .messages(messages.notes),

  status: () =>
    Joi.string()
      .valid('draft', 'sent', 'paid', 'partially_paid', 'overdue', 'completed', 'pending', 'failed')
      .messages(messages.status),

}

const paymentCreateSchema = Joi.object({
  invoiceId: fields.invoiceId().required(),
  amount: fields.amount().required(),
  paymentMethod: fields.paymentMethod().required(),
  paymentDate: fields.paymentDate().required(),
  referenceNumber: fields.referenceNumber().optional(),
  bankDetails: fields.bankDetails(),
  transactionId: fields.transactionId().optional(),
  notes: fields.notes().optional(),
  paymentHistory: fields.paymentHistory().optional()
})

const paymentUpdateSchema = Joi.object({
  invoiceId: fields.invoiceId().optional(),
  amount: fields.amount().optional(),
  paymentMethod: fields.paymentMethod().optional(),
  paymentDate: fields.paymentDate().optional(),
  referenceNumber: fields.referenceNumber().optional(),
  bankDetails: fields.bankDetails(),
  transactionId: fields.transactionId().optional(),
  notes: fields.notes().optional(),
  status: fields.status().optional(),
  paymentHistory: fields.paymentHistory().optional()
})

export { paymentCreateSchema, paymentUpdateSchema }