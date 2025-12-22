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

  ifscCode: {
    'string.pattern.base': 'IFSC code must be in valid format (e.g., HDFC0000001)'
  },

  status: {
    'any.only': 'Status must be one of: completed, pending, failed'
  }
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
      .allow('', null),

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
      .allow('', null),

  notes: () =>
    Joi.string()
      .trim()
      .allow('', null),

  status: () =>
    Joi.string()
      .valid('completed', 'pending', 'failed')
      .messages(messages.status)
}

const paymentCreateSchema = Joi.object({
  invoiceId: fields.invoiceId().required(),
  amount: fields.amount().required(),
  paymentMethod: fields.paymentMethod().required(),
  paymentDate: fields.paymentDate().required(),
  referenceNumber: fields.referenceNumber().optional(),
  bankDetails: fields.bankDetails(),
  transactionId: fields.transactionId().optional(),
  notes: fields.notes().optional()
})

const paymentUpdateSchema = Joi.object({
  status: fields.status().optional(),
  notes: fields.notes().optional()
})

export { paymentCreateSchema, paymentUpdateSchema }