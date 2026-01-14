import { createInvoice, getInvoices, getInvoiceById, updateInvoice, deleteInvoice } from "../controller/invoice.controller.js";
import { protect, validate } from '../middleware/auth.middleware.js'
import { invoiceCreateSchema, invoiceUpdateSchema } from '../validators/invoice.validators.js'
import express from 'express'
import rateLimiter from '../middleware/rate-limitor.js'

const router = express.Router()

router.post('/', rateLimiter({ limit: 50, windowMinutes: 15 }), protect, validate(invoiceCreateSchema), createInvoice)
router.get('/', rateLimiter({ limit: 100, windowMinutes: 15 }), protect, getInvoices)
router.get('/:id', rateLimiter({ limit: 100, windowMinutes: 15 }), protect, getInvoiceById)
router.put('/:id', rateLimiter({ limit: 50, windowMinutes: 15 }), protect, validate(invoiceUpdateSchema), updateInvoice)
router.delete('/:id', rateLimiter({ limit: 50, windowMinutes: 15 }), protect, deleteInvoice)

export default router

