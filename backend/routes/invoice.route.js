import { createInvoice, getInvoices, getInvoiceById, updateInvoice, deleteInvoice } from "../controller/invoice.controller.js";
import { protect, validate } from '../middleware/auth.middleware.js'
import { invoiceCreateSchema, invoiceUpdateSchema } from '../validators/invoice.validators.js'
import express from 'express'
import rateLimiter from '../middleware/rate-limitor.js'

const router = express.Router()

router.post('/', rateLimiter({ limit: 5, windowMinutes: 60 }), protect, validate(invoiceCreateSchema), createInvoice)
router.get('/', rateLimiter({ limit: 10, windowMinutes: 60 }), protect, getInvoices)
router.get('/:id', rateLimiter({ limit: 10, windowMinutes: 60 }), protect, getInvoiceById)
router.put('/:id', rateLimiter({ limit: 10, windowMinutes: 60 }), protect, validate(invoiceUpdateSchema), updateInvoice)
router.delete('/:id', rateLimiter({ limit: 10, windowMinutes: 60 }), protect, deleteInvoice)

export default router

