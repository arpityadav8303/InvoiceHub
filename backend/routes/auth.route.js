import express from 'express'
import { registerUser, loginUser, logoutUser } from '../controller/auth.controller.js'
import { protect, validate } from '../middleware/auth.middleware.js'
import { registerSchema, loginSchema } from '../validators/auth.validators.js'
import rateLimiter from '../middleware/rate-limitor.js'

const router = express.Router()

router.post('/register', rateLimiter({ limit: 10, windowMinutes: 60 }), validate(registerSchema), registerUser)

router.post('/login', rateLimiter({ limit: 10, windowMinutes: 60 }), validate(loginSchema), loginUser)

router.post('/logout', protect, logoutUser)

export default router