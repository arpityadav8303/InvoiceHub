import Joi from 'joi'

// --- Item Schema ---
const itemValidatorSchema = Joi.object({
  description: Joi.string().required().messages({
    'any.required': 'Item description is required.',
    'string.empty': 'Item description cannot be empty.'
  }),

  quantity: Joi.number().integer().min(1).required().messages({
    'any.required': 'Item quantity is required.',
    'number.base': 'Item quantity must be a number.',
    'number.min': 'Item quantity must be at least 1.',
    'number.integer': 'Item quantity must be an integer.'
  }),

  rate: Joi.number().min(0).required().messages({
    'any.required': 'Item rate is required.',
    'number.base': 'Item rate must be a number.',
    'number.min': 'Item rate must be a non-negative number.'
  }),

  amount: Joi.any().forbidden().messages({
    'any.unknown': 'Item amount cannot be supplied by the client. It is calculated server-side.'
  })
})

// --- Payment History Schema ---
const paymentHistorySchema = Joi.array().items(
  Joi.object({
    amount: Joi.number().positive().required().messages({
      'any.required': 'Payment amount is required.',
      'number.base': 'Payment amount must be a number.',
      'number.positive': 'Payment amount must be greater than 0.'
    }),
    paymentDate: Joi.date().max('now').required().messages({
      'any.required': 'Payment date is required.',
      'date.base': 'Payment date must be a valid date.',
      'date.max': 'Payment date cannot be in the future.'
    }),
    paymentMethod: Joi.string()
      .valid('bank_transfer', 'cheque', 'upi', 'card', 'cash')
      .required()
      .messages({
        'any.required': 'Payment method is required.',
        'any.only': 'Payment method must be one of: bank_transfer, cheque, upi, card, cash'
      }),
    transactionId: Joi.string().trim().optional().messages({
      'string.base': 'Transaction ID must be a string'
    }),
    referenceNumber: Joi.string().trim().optional().messages({
      'string.base': 'Reference number must be a string'
    })
  })
)

// --- Invoice Create Schema ---
const invoiceCreateSchema = Joi.object({
  clientId: Joi.string().hex().length(24).required().messages({
    'any.required': 'Client ID is required.',
    'string.hex': 'Client ID must be a hexadecimal string.',
    'string.length': 'Client ID must be 24 characters long.'
  }),

  invoiceNumber: Joi.string().required().messages({
    'any.required': 'Invoice number is required.'
  }),

  dueDate: Joi.date().required().messages({
    'any.required': 'Due date is required.',
    'date.base': 'Due date must be a valid date.'
  }),

  items: Joi.array()
    .items(itemValidatorSchema)
    .min(1)
    .required()
    .messages({
      'any.required': 'Invoice items list is required.',
      'array.min': 'Invoice must have at least one item.'
    }),

  discount: Joi.number().min(0).default(0).optional(),
  taxRate: Joi.number().min(0).max(100).default(18).optional(),
  paymentTerms: Joi.string().default('Net 30').optional(),
  notes: Joi.string().allow('', null).optional(),

  // Payment tracking (optional on create)
  paidAmount: Joi.number().min(0).optional(),
  remainingAmount: Joi.number().min(0).optional(),
  paidAt: Joi.date().optional(),
  paymentMethod: Joi.string()
    .valid('bank_transfer', 'cheque', 'upi', 'card', 'cash')
    .optional(),
  paymentHistory: paymentHistorySchema.optional(),

  // Server-calculated fields forbidden
  subtotal: Joi.forbidden(),
  tax: Joi.forbidden(),
  total: Joi.forbidden()
})

// --- Invoice Update Schema ---
const invoiceUpdateSchema = Joi.object({
  clientId: Joi.string().hex().length(24).optional(),
  dueDate: Joi.date().optional(),
  invoiceNumber: Joi.string().optional(),

  items: Joi.array().items(itemValidatorSchema).min(1).optional(),

  discount: Joi.number().min(0).optional(),
  taxRate: Joi.number().min(0).max(100).optional(),
  paymentTerms: Joi.string().optional(),
  notes: Joi.string().allow('', null).optional(),

  status: Joi.string()
    .valid('draft', 'sent', 'paid', 'partially_paid', 'overdue')
    .optional(),

  // Payment tracking (optional on update)
  paidAmount: Joi.number().min(0).optional(),
  remainingAmount: Joi.number().min(0).optional(),
  paidAt: Joi.date().optional(),
  paymentMethod: Joi.string()
    .valid('bank_transfer', 'cheque', 'upi', 'card', 'cash')
    .optional(),
  paymentHistory: paymentHistorySchema.optional(),

  // Server-calculated fields forbidden
  subtotal: Joi.forbidden(),
  tax: Joi.forbidden(),
  total: Joi.forbidden()
})

export { invoiceCreateSchema, invoiceUpdateSchema, itemValidatorSchema, paymentHistorySchema }