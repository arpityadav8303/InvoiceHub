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


//"_id": "69366b5e553a489547707c38"
//"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzY2YjVlNTUzYTQ4OTU0NzcwN2MzOCIsImlhdCI6MTc2NTE3NDExMCwiZXhwIjoxNzY1Nzc4OTEwfQ.P3OQBD-xptj_EhO9bmrXXnZwudb7iLweTezV9fmNKUI"


//  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MzkxYzI1YmVhYmU4YmM2ZTFjODgxZiIsImlhdCI6MTc2NTM1MDQ4MywiZXhwIjoxNzY1OTU1MjgzfQ.hHiQk1njSJQLmYOYsVgM61EGp9yfRzqGBErSh5IRwiY"