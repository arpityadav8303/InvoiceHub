import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import Client from '../models/client.model.js'
// import bcrypt from 'bcryptjs' // Removed if not needed directly, handled by model usually

dotenv.config()

const generateToken = (id, model) => {
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  const token = jwt.sign({ id, model }, process.env.JWT_SECRET, {
    expiresIn: expiresIn
  });
  return token;
};


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
    const token = generateToken(newUser._id, 'user')

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

    // Validation: Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      })
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Generate JWT token
    const token = generateToken(user._id, 'user')

    // Return response with user data (without password)
    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        businessName: user.businessName,
        phone: user.phone,
        businessType: user.businessType
      },
      token: token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    })
  }
}

const loginClient = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const client = await Client.findOne({ email }).select('+password');

    console.log(`🔍 Login attempt for: ${email}`);
    console.log(`   Client found: ${!!client}`);

    if (!client) {
      console.log('❌ Client not found in DB');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log(`   Password hash present: ${!!client.password}`);
    if (!client.password) {
      console.log('❌ CRITICAL: Client has NO password hash! Re-create account.');
      return res.status(400).json({
        success: false,
        message: 'Account corrupted: Password missing. Please contact support or recreate account.'
      });
    }

    const isPasswordValid = await client.comparePassword(password);
    console.log(`   Password valid: ${isPasswordValid}`);

    if (!isPasswordValid) {
      console.log('❌ Password mismatch');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(client._id, 'client');

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: token,
      client: {
        _id: client._id,
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        businessName: client.businessName,
        phone: client.phone,
        businessType: client.businessType
      }
    });

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    })
  }
}

const updateClientPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const clientId = req.client._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new passwords' });
    }

    const client = await Client.findById(clientId).select('+password');
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    // Check if password exists (legacy support)
    if (client.password) {
      const isMatch = await client.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect current password' });
      }
    }

    client.password = newPassword;
    await client.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Update Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error updating password' });
  }
};

const logoutUser = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}

const getMe = async (req, res, next) => {
  try {
    const user = req.user || req.client; // Support both User and Client entities
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export { registerUser, loginUser, logoutUser, loginClient, getMe, updateClientPassword };