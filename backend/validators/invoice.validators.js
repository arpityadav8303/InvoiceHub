import Joi from 'joi'

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

  // Optional fields
  discount: Joi.number().min(0).default(0).optional(),
  taxRate: Joi.number().min(0).max(100).default(18).optional(),
  paymentTerms: Joi.string().default('Net 30').optional(),
  notes: Joi.string().allow('', null).optional(),
  
  // Calculated or set by server, should be forbidden input
  subtotal: Joi.forbidden(),
  tax: Joi.forbidden(),
  total: Joi.forbidden()
})

// --- Invoice Update Schema ---
const invoiceUpdateSchema = Joi.object({
  clientId: Joi.string().hex().length(24).optional(),
  dueDate: Joi.date().optional(),
  invoiceNumber: Joi.string().optional(),
  
  // Use the corrected item schema for updates as well
  items: Joi.array()
    .items(itemValidatorSchema)
    .min(1)
    .optional(),

  discount: Joi.number().min(0).optional(),
  taxRate: Joi.number().min(0).max(100).optional(),
  paymentTerms: Joi.string().optional(),
  notes: Joi.string().allow('', null).optional(),

  // Status can be updated
  status: Joi.string()
    .valid('draft', 'sent', 'paid', 'overdue')
    .optional(),

  // Still forbid calculated fields on update payload
  subtotal: Joi.forbidden(),
  tax: Joi.forbidden(),
  total: Joi.forbidden()
})

export { invoiceCreateSchema, invoiceUpdateSchema, itemValidatorSchema }