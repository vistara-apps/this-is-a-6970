import express from 'express'
import Joi from 'joi'
import multer from 'multer'
import { ContentRequest } from '../models/ContentRequest.js'
import { authenticate, checkGenerationLimit } from '../middleware/auth.js'
import { ApiError, asyncHandler } from '../middleware/errorHandler.js'
import { generateContent } from '../services/openai.js'
import { processMedia } from '../services/mediaProcessor.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow video, audio, and text files
    const allowedTypes = [
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac',
      'text/plain', 'application/pdf'
    ]
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new ApiError(400, 'Invalid file type'), false)
    }
  }
})

// Validation schemas
const generateContentSchema = Joi.object({
  prompt: Joi.string().required().min(10).max(1000),
  contentType: Joi.string().valid(
    'social-post', 'blog-outline', 'email-subject', 
    'product-description', 'video-script', 'ad-copy'
  ).required()
})

const repurposeContentSchema = Joi.object({
  outputFormat: Joi.string().valid(
    'short-clips', 'highlights', 'transcript', 
    'social-posts', 'quotes'
  ).required(),
  url: Joi.string().uri().optional(),
  metadata: Joi.object().optional()
})

/**
 * @swagger
 * /api/content/generate:
 *   post:
 *     summary: Generate content using AI
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *               - contentType
 *             properties:
 *               prompt:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *               contentType:
 *                 type: string
 *                 enum: [social-post, blog-outline, email-subject, product-description, video-script, ad-copy]
 *     responses:
 *       201:
 *         description: Content generated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Generation limit reached
 */
router.post('/generate', 
  authenticate, 
  checkGenerationLimit, 
  asyncHandler(async (req, res) => {
    // Validate request body
    const { error, value } = generateContentSchema.validate(req.body)
    if (error) {
      throw new ApiError(400, error.details[0].message)
    }

    const { prompt, contentType } = value

    // Create content request record
    const contentRequest = await ContentRequest.create({
      userId: req.user.userId,
      type: 'generation',
      contentType,
      inputContent: prompt,
      metadata: {
        userAgent: req.headers['user-agent'],
        ip: req.ip
      }
    })

    try {
      // Mark as processing
      await contentRequest.markAsProcessing()

      // Generate content using OpenAI
      const generatedContent = await generateContent(prompt, contentType)

      // Mark as completed and save generated content
      await contentRequest.markAsCompleted(generatedContent, {
        tokensUsed: generatedContent.length, // Approximate
        model: 'gpt-4'
      })

      // Increment user's generation count
      await req.user.incrementGenerations()

      logger.info(`Content generated for user ${req.user.userId}: ${contentRequest.requestId}`)

      res.status(201).json({
        message: 'Content generated successfully',
        request: contentRequest.toJSON(),
        content: generatedContent
      })

    } catch (error) {
      // Mark as failed
      await contentRequest.markAsFailed(error)
      throw error
    }
  })
)

/**
 * @swagger
 * /api/content/repurpose:
 *   post:
 *     summary: Repurpose content from file upload or URL
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               outputFormat:
 *                 type: string
 *                 enum: [short-clips, highlights, transcript, social-posts, quotes]
 *               url:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Content repurposed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Generation limit reached
 */
router.post('/repurpose',
  authenticate,
  checkGenerationLimit,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    // Validate request body
    const { error, value } = repurposeContentSchema.validate(req.body)
    if (error) {
      throw new ApiError(400, error.details[0].message)
    }

    const { outputFormat, url, metadata = {} } = value

    // Check if file or URL is provided
    if (!req.file && !url) {
      throw new ApiError(400, 'Either file upload or URL is required')
    }

    // Create content request record
    const contentRequest = await ContentRequest.create({
      userId: req.user.userId,
      type: 'repurposing',
      contentType: outputFormat,
      inputContent: url || req.file.originalname,
      metadata: {
        ...metadata,
        fileName: req.file?.originalname,
        fileSize: req.file?.size,
        mimeType: req.file?.mimetype,
        url: url,
        userAgent: req.headers['user-agent'],
        ip: req.ip
      }
    })

    try {
      // Mark as processing
      await contentRequest.markAsProcessing()

      // Process media file or URL
      const repurposedContent = await processMedia({
        file: req.file,
        url: url,
        outputFormat: outputFormat
      })

      // Mark as completed and save repurposed content
      await contentRequest.markAsCompleted(repurposedContent, {
        processingTime: Date.now() - new Date(contentRequest.createdAt).getTime(),
        outputFormat: outputFormat
      })

      // Increment user's generation count
      await req.user.incrementGenerations()

      logger.info(`Content repurposed for user ${req.user.userId}: ${contentRequest.requestId}`)

      res.status(201).json({
        message: 'Content repurposed successfully',
        request: contentRequest.toJSON(),
        content: repurposedContent
      })

    } catch (error) {
      // Mark as failed
      await contentRequest.markAsFailed(error)
      throw error
    }
  })
)

/**
 * @swagger
 * /api/content/history:
 *   get:
 *     summary: Get user's content generation history
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [generation, repurposing]
 *         description: Filter by content type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *         description: Filter by status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of results to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       200:
 *         description: Content history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/history', authenticate, asyncHandler(async (req, res) => {
  const {
    type,
    status,
    limit = 20,
    offset = 0
  } = req.query

  const options = {
    limit: Math.min(parseInt(limit), 100),
    offset: parseInt(offset),
    type,
    status
  }

  const contentRequests = await ContentRequest.findByUserId(req.user.userId, options)

  res.json({
    message: 'Content history retrieved successfully',
    data: contentRequests.map(request => request.toJSON()),
    pagination: {
      limit: options.limit,
      offset: options.offset,
      total: contentRequests.length
    }
  })
}))

/**
 * @swagger
 * /api/content/{requestId}:
 *   get:
 *     summary: Get specific content request details
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content request ID
 *     responses:
 *       200:
 *         description: Content request retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content request not found
 */
router.get('/:requestId', authenticate, asyncHandler(async (req, res) => {
  const { requestId } = req.params

  const contentRequest = await ContentRequest.findById(requestId)
  
  if (!contentRequest) {
    throw new ApiError(404, 'Content request not found')
  }

  // Check if user owns this content request
  if (contentRequest.userId !== req.user.userId) {
    throw new ApiError(403, 'Access denied')
  }

  res.json({
    message: 'Content request retrieved successfully',
    data: contentRequest.toJSON()
  })
}))

/**
 * @swagger
 * /api/content/{requestId}:
 *   delete:
 *     summary: Delete a content request
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Content request ID
 *     responses:
 *       200:
 *         description: Content request deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Content request not found
 */
router.delete('/:requestId', authenticate, asyncHandler(async (req, res) => {
  const { requestId } = req.params

  const contentRequest = await ContentRequest.findById(requestId)
  
  if (!contentRequest) {
    throw new ApiError(404, 'Content request not found')
  }

  // Check if user owns this content request
  if (contentRequest.userId !== req.user.userId) {
    throw new ApiError(403, 'Access denied')
  }

  await contentRequest.delete()

  res.json({
    message: 'Content request deleted successfully'
  })
}))

/**
 * @swagger
 * /api/content/stats:
 *   get:
 *     summary: Get user's content generation statistics
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *           default: 30d
 *         description: Statistics timeframe
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', authenticate, asyncHandler(async (req, res) => {
  const { timeframe = '30d' } = req.query

  const stats = await ContentRequest.getUserStats(req.user.userId, timeframe)

  res.json({
    message: 'Statistics retrieved successfully',
    data: stats
  })
}))

export default router
