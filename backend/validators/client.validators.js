import Joi from 'joi';

const clientValidationSchema = Joi.object({
  firstName: Joi.string()
    .required()
    .min(2)
    .max(50)
    .trim()
    .messages({
      "string.min": "First name must be at least 2 characters",
      "string.max": "First name cannot exceed 50 characters",
      "any.required": "First name is required"
    }),

  lastName: Joi.string()
    .required()
    .min(2)
    .max(50)
    .trim()
    .messages({
      "string.min": "Last name must be at least 2 characters",
      "string.max": "Last name cannot exceed 50 characters",
      "any.required": "Last name is required"
    }),

  email: Joi.string()
    .required()
    .email()
    .trim()
    .messages({
      "string.email": "Invalid email address",
      "any.required": "Email is required"
    }),

    password: Joi.string()
    .min(8)
    .max(50)
    .trim()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.max": "Password cannot exceed 50 characters",
      "any.required": "Password is required"
    }),

  phone: Joi.string()
    .required()
    .pattern(/^\d{10}$/)
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
      "any.required": "Phone number is required"
    }),

  companyName: Joi.string().trim().optional(),

  address: Joi.object({
    street: Joi.string().trim().optional(),
    city: Joi.string().trim().optional(),
    state: Joi.string().trim().optional(),
    zipCode: Joi.string().trim().optional()
  }).optional(),

  gstNumber: Joi.string().trim().optional(),

  preferredPaymentMethod: Joi.string()
    .valid('bank_transfer', 'cheque', 'upi', 'card')
    .default('bank_transfer')
    .messages({
      "any.only": "Invalid payment method"
    }),

  paymentStats: Joi.object({
    totalInvoices: Joi.number().default(0),
    totalAmount: Joi.number().default(0),
    totalPaid: Joi.number().default(0),
    totalUnpaid: Joi.number().default(0),
    averageDaysToPayment: Joi.number().default(0),
    paymentReliabilityScore: Joi.number().default(0),
    onTimePayments: Joi.number().default(0),
    latePayments: Joi.number().default(0),
    lastPaymentDate: Joi.date().optional(),
    lastInvoiceDate: Joi.date().optional()
  }).optional(),

  notes: Joi.string().trim().optional(),

  riskLevel: Joi.string()
    .valid('LOW', 'MEDIUM', 'HIGH')
    .default('LOW')
    .messages({
      "any.only": "Risk level must be LOW, MEDIUM, or HIGH"
    }),

  status: Joi.string()
    .valid('active', 'inactive')
    .default('active')
    .messages({
      "any.only": "Status must be active or inactive"
    })
});

export { clientValidationSchema };