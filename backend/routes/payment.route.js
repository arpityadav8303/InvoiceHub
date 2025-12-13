import { paymentCreateSchema, paymentUpdateSchema } from '../validators/payment.validators.js'
import express from 'express'
import { protect, validate } from '../middleware/auth.middleware.js'
import { recordPayment,getPayments } from '../controller/payment.controller.js'

const router = express.Router()

router.post('/', protect, validate(paymentCreateSchema), recordPayment)
router.get('/', protect, getPayments)


export default router