import express from 'express'
import { registerUser, loginUser, logoutUser } from '../controller/auth.controller.js'
import { protect,validate } from '../middleware/auth.middleware.js'
import { registerSchema, loginSchema} from '../validators/auth.validators.js'


const router = express.Router()

router.post('/register',validate(registerSchema), registerUser)

router.post('/login',validate(loginSchema), loginUser)

router.post('/logout', protect, logoutUser)

export default router

