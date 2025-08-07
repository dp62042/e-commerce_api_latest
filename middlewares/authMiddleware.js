// authMiddleware.js

import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

// authMiddleware.js
export const protect = async (req, res, next) => {
  let token
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' })
    }

    // Add isAdmin property to the user object
    req.user = {
      ...user.toObject(), // Convert Mongoose doc to plain object
      isAdmin: decoded.isAdmin, // Add from token payload
    }

    next()
  } catch (error) {
    console.error('JWT error:', error.message)
    res.status(401).json({ message: 'Not authorized, token failed' })
  }
}
