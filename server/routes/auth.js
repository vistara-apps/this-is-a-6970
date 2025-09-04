import express from 'express'
import Joi from 'joi'
import { User } from '../models/User.js'
import { generateToken, authenticate } from '../middleware/auth.js'
import { ApiError, asyncHandler } from '../middleware/errorHandler.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  subscriptionPlan: Joi.string().valid('basic', 'pro').default('basic')
})

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
})

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               subscriptionPlan:
 *                 type: string
 *                 enum: [basic, pro]
 *                 default: basic
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post('/register', asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = registerSchema.validate(req.body)
  if (error) {
    throw new ApiError(400, error.details[0].message)
  }

  const { email, password, subscriptionPlan } = value

  // Check if user already exists
  const existingUser = await User.findByEmail(email)
  if (existingUser) {
    throw new ApiError(409, 'User already exists with this email')
  }

  // Create new user
  const user = await User.create({
    email,
    password,
    subscriptionPlan
  })

  // Generate token
  const token = generateToken(user.userId)

  logger.info(`User registered: ${email}`)

  res.status(201).json({
    message: 'User registered successfully',
    user: user.toJSON(),
    token
  })
}))

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', asyncHandler(async (req, res) => {
  // Validate request body
  const { error, value } = loginSchema.validate(req.body)
  if (error) {
    throw new ApiError(400, error.details[0].message)
  }

  const { email, password } = value

  // Find user by email
  const user = await User.findByEmail(email)
  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  // Verify password
  const isPasswordValid = await user.verifyPassword(password)
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password')
  }

  // Generate token
  const token = generateToken(user.userId)

  logger.info(`User logged in: ${email}`)

  res.json({
    message: 'Login successful',
    user: user.toJSON(),
    token
  })
}))

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 stats:
 *                   type: object
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, asyncHandler(async (req, res) => {
  const stats = await req.user.getStats()
  
  res.json({
    user: req.user.toJSON(),
    stats
  })
}))

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh authentication token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Unauthorized
 */
router.post('/refresh', authenticate, asyncHandler(async (req, res) => {
  // Generate new token
  const token = generateToken(req.user.userId)
  
  res.json({
    message: 'Token refreshed successfully',
    token
  })
}))

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user (client-side token removal)
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', (req, res) => {
  // Since we're using stateless JWT tokens, logout is handled client-side
  // by removing the token from storage
  res.json({
    message: 'Logout successful'
  })
})

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         subscriptionPlan:
 *           type: string
 *           enum: [basic, pro]
 *         generationsUsed:
 *           type: integer
 *         generationsLimit:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

export default router
