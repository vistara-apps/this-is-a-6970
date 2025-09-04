import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { ApiError, asyncHandler } from './errorHandler.js'
import { logger } from '../utils/logger.js'

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })
}

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    throw new ApiError(401, 'Invalid token')
  }
}

// Authentication middleware
export const authenticate = asyncHandler(async (req, res, next) => {
  let token

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  // Check for token in cookies (if using cookie-based auth)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token
  }

  if (!token) {
    throw new ApiError(401, 'Access denied. No token provided.')
  }

  try {
    // Verify token
    const decoded = verifyToken(token)
    
    // Get user from database
    const user = await User.findById(decoded.userId)
    if (!user) {
      throw new ApiError(401, 'Token is valid but user not found')
    }

    // Add user to request object
    req.user = user
    next()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    logger.error('Authentication error:', error.message)
    throw new ApiError(401, 'Invalid token')
  }
})

// Authorization middleware - check if user has required subscription
export const requireSubscription = (requiredPlan = 'basic') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, 'Authentication required')
    }

    const userPlan = req.user.subscriptionPlan
    
    // Define plan hierarchy
    const planHierarchy = {
      'basic': 1,
      'pro': 2
    }

    const userPlanLevel = planHierarchy[userPlan] || 0
    const requiredPlanLevel = planHierarchy[requiredPlan] || 0

    if (userPlanLevel < requiredPlanLevel) {
      throw new ApiError(403, `${requiredPlan} subscription required`)
    }

    next()
  })
}

// Check if user can generate content (within limits)
export const checkGenerationLimit = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required')
  }

  if (!req.user.canGenerate()) {
    throw new ApiError(429, 'Generation limit reached. Please upgrade your subscription.')
  }

  next()
})

// Optional authentication - doesn't throw error if no token
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token
  }

  if (token) {
    try {
      const decoded = verifyToken(token)
      const user = await User.findById(decoded.userId)
      if (user) {
        req.user = user
      }
    } catch (error) {
      // Silently fail for optional auth
      logger.debug('Optional auth failed:', error.message)
    }
  }

  next()
})

// Admin middleware (for future admin features)
export const requireAdmin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required')
  }

  if (!req.user.isAdmin) {
    throw new ApiError(403, 'Admin access required')
  }

  next()
})
