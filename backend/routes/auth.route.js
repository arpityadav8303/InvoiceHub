import express from 'express'
import { registerUser, loginUser, logoutUser } from '../controller/auth.controller.js'
import { protect,validate } from '../middleware/auth.middleware.js'
import { registerSchema, loginSchema} from '../validators/auth.validators.js'


const router = express.Router()

router.post('/register',validate(registerSchema), registerUser)

router.post('/login',validate(loginSchema), loginUser)

router.post('/logout', protect, logoutUser)

export default router

//login token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NDUxYmFiM2VmYmMzZTllMjg1OGU3MiIsImlhdCI6MTc2NjEzNzQ3NiwiZXhwIjoxNzY2NzQyMjc2fQ.MBdv96VPs5CZqdM8wAKdPxlZcBfVSj39JybMY6py7A8