import { paymentCreateSchema, paymentUpdateSchema } from '../validators/payment.validators.js'
import express from 'express'
import { protect, validate } from '../middleware/auth.middleware.js'
import { recordPayment, getPayments, getPaymentsById, deletePayment } from '../controller/payment.Controller.js'
import rateLimiter from '../middleware/rate-limitor.js'
const router = express.Router()

router.post('/', rateLimiter({ limit: 10, windowMinutes: 60 }), validate(paymentCreateSchema), recordPayment)
router.get('/', rateLimiter({ limit: 10, windowMinutes: 60 }), protect, getPayments)
router.get('/:id', rateLimiter({ limit: 10, windowMinutes: 60 }), protect, getPaymentsById)
router.delete('/:id', protect, deletePayment)

export default router