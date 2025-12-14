import { paymentCreateSchema, paymentUpdateSchema } from '../validators/payment.validators.js'
import express from 'express'
import { protect, validate } from '../middleware/auth.middleware.js'
import { recordPayment,getPayments,getPaymentsById,deletePayment } from '../controller/payment.controller.js'

const router = express.Router()

router.post('/', protect, validate(paymentCreateSchema), recordPayment)
router.get('/', protect, getPayments)
router.get('/:id', protect, getPaymentsById)
router.delete('/:id', protect, validate(paymentUpdateSchema), deletePayment)

export default router