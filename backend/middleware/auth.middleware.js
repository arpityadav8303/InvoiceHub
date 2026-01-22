import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import Client from '../models/client.model.js'

dotenv.config()



const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      let entity;

      if (decoded.model === 'user') {
        entity = await User.findById(decoded.id);
      } else if (decoded.model === 'client') {
        entity = await Client.findById(decoded.id);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid token payload: unknown model type'
        });
      }

      if (!entity) {
        return res.status(404).json({
          success: false,
          message: `${decoded.model} not found`
        });
      }

      // Attach to request depending on type
      if (decoded.model === 'user') {
        req.user = entity;
      } else {
        req.client = entity;
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid or expired'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in auth middleware',
      error: error.message
    });
  }
};



// middleware/validate.middleware.js
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      console.log('❌ Validation Error:', error.details.map(d => d.message));
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }
    next();
  };
};

export { protect }