import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const generateToken = (id) => {
  const expiresIn = process.env.JWT_EXPIRE || '7d'
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: expiresIn
  })
  return token
}

const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, businessName, phone, businessType } = req.body

    // Validation: Check if all required fields are provided
    if (!firstName || !lastName || !email || !password || !businessName || !phone || !businessType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: firstName, lastName, email, password, businessName, phone, businessType'
      })
    }

    // Validation: Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      })
    }

    // Validation: Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      })
    }

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      businessName,
      phone,
      businessType
    })

    // Generate JWT token
    const token = generateToken(newUser._id)

    // Return response with user data (without password)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        businessName: newUser.businessName,
        phone: newUser.phone,
        businessType: newUser.businessType
      },
      token: token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message
    })
  }
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      })
    }

    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      })
    }

    const isPasswordValid = await user.comparePassword(password)

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        businessName: user.businessName,
        phone: user.phone,
        businessType: user.businessType
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    })
  }
}

const logoutUser= (req, res) => {
    res.json({
    success: true,
    message: 'Logged out successfully'
  });
}
export  {registerUser,loginUser,logoutUser}