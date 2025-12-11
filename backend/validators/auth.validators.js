import Joi from 'joi';

const registerSchema = Joi.object({
  firstName: Joi.string()
    .required()
    .min(3)
    .max(50)
    .trim()
    .messages({
      "string.min": "First name must be at least 3 characters",
      "string.max": "First name cannot exceed 50 characters",
      "any.required": "First name is required"
    }),

  lastName: Joi.string()
    .required()
    .min(3)
    .max(50)
    .trim()
    .messages({
      "string.min": "Last name must be at least 3 characters",
      "string.max": "Last name cannot exceed 50 characters",
      "any.required": "Last name is required"
    }),

  email: Joi.string()
    .required()
    .email()
    .trim()
    .messages({
      "string.email": "Please enter a valid email",
      "any.required": "Email is required"
    }),

  password: Joi.string()
    .required()
    .min(6) // matches mongoose minlength
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/) // at least one lowercase, uppercase, number
    .messages({
      "string.min": "Password must be at least 6 characters",
      "string.pattern.base": "Password must contain uppercase, lowercase, and numbers",
      "any.required": "Password is required"
    }),

  businessName: Joi.string()
    .required()
    .min(3)
    .max(100)
    .trim()
    .messages({
      "string.min": "Business name must be at least 3 characters",
      "string.max": "Business name cannot exceed 100 characters",
      "any.required": "Business name is required"
    }),

  phone: Joi.string()
    .required()
    .pattern(/^\d{10}$/) // enforce 10 digits
    .messages({
      "string.pattern.base": "Phone number must be 10 digits",
      "any.required": "Phone number is required"
    }),

  businessType: Joi.string()
    .valid('freelancer', 'agency', 'startup', 'service')
    .default('freelancer')
    .messages({
      "any.only": "Invalid business type"
    }),

  address: Joi.object({
    street: Joi.string().trim().optional(),
    city: Joi.string().trim().optional(),
    state: Joi.string().trim().optional(),
    zipCode: Joi.string().trim().optional()
  }).optional(),

  gstNumber: Joi.string().trim().optional(),
  bankAccountNumber: Joi.string().trim().optional(),
  ifscCode: Joi.string().trim().optional(),

  preferences: Joi.object({
    invoiceCurrency: Joi.string().default('INR'),
    invoicePrefix: Joi.string().default('INV'),
    defaultPaymentTerms: Joi.string().default('Net 30'),
    defaultTaxRate: Joi.number().default(18)
  }).optional(),

  subscription: Joi.object({
    plan: Joi.string().valid('free', 'pro').default('free'),
    status: Joi.string().default('active'),
    startDate: Joi.date().default(() => new Date())
  }).optional(),

  isActive: Joi.boolean().default(true)
});

const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .lowercase()
        .trim(),
    
    password: Joi.string()
        .min(8)
        .required()
});

export {registerSchema,loginSchema};