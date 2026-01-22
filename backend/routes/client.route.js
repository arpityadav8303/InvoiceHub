import express from 'express'
import { createClient, getClients, getClientById, updateClient, deleteClient } from '../controller/client.controller.js'
import { clientValidationSchema } from '../validators/client.validators.js'
import { protect, validate } from '../middleware/auth.middleware.js'
import { updateClientPassword } from '../controller/auth.controller.js'
import rateLimiter from '../middleware/rate-limitor.js'

const router = express.Router()

router.post('/', rateLimiter({ limit: 100, windowMinutes: 15 }), protect, validate(clientValidationSchema), createClient)
router.get('/', rateLimiter({ limit: 100, windowMinutes: 15 }), protect, getClients)
router.put('/update-password', rateLimiter({ limit: 100, windowMinutes: 15 }), protect, updateClientPassword)
router.get('/:id', rateLimiter({ limit: 1000, windowMinutes: 15 }), protect, getClientById)
router.put('/:id', rateLimiter({ limit: 100, windowMinutes: 15 }), protect, validate(clientValidationSchema), updateClient)
router.delete('/:id', rateLimiter({ limit: 100, windowMinutes: 15 }), protect, deleteClient)



export default router


