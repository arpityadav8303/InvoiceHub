import express from 'express'
import { createClient, getClients, getClientById, updateClient, deleteClient } from '../controller/client.controller.js'
import { clientValidationSchema } from '../validators/client.validators.js'
import { protect,validate } from '../middleware/auth.middleware.js'

const router = express.Router()

router.post('/',protect,validate(clientValidationSchema),createClient)
router.get('/', protect, getClients)
router.get('/:id', protect, getClientById)
router.put('/:id', protect, validate(clientValidationSchema), updateClient)
router.delete('/:id', protect, deleteClient)


export default router


