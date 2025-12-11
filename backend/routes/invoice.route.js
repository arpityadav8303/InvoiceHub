import { createInvoice, getInvoices, getInvoiceById, updateInvoice, deleteInvoice} from "../controller/invoice.controller.js";
import {protect,validate} from '../middleware/auth.middleware.js'
import {invoiceCreateSchema,invoiceUpdateSchema} from '../validators/invoice.validators.js'
import express from 'express'

const router=express.Router()

router.post('/',protect,validate(invoiceCreateSchema),createInvoice)
router.get('/',protect,getInvoices)
router.get('/:id',protect,getInvoiceById)
router.put('/:id',protect,validate(invoiceUpdateSchema),updateInvoice)
router.delete('/:id',protect,deleteInvoice)

export default router

