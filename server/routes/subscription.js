import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { ApiError, asyncHandler } from '../middleware/errorHandler.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 15,
    currency: 'USD',
    interval: 'month',
    features: [
      '10 content generations per month',
      '10 content repurposing tasks',
      'Basic templates',
      'Email support'
    ],
    generationsLimit: 10
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 45,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited content generations',
      'Unlimited repurposing tasks',
      'Advanced templates',
      'Priority support',
      'Custom branding',
      'Analytics dashboard'
    ],
    generationsLimit: -1 // Unlimited
  }
}

/**
 * @swagger
 * /api/subscriptions/plans:
 *   get:
 *     summary: Get available subscription plans
 *     tags: [Subscriptions]
 *     responses:
 *       200:
 *         description: Subscription plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plans:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       price:
 *                         type: number
 *                       currency:
 *                         type: string
 *                       interval:
 *                         type: string
 *                       features:
 *                         type: array
 *                         items:
 *                           type: string
 */
router.get('/plans', (req, res) => {
  res.json({
    message: 'Subscription plans retrieved successfully',
    plans: Object.values(SUBSCRIPTION_PLANS)
  })
})

/**
 * @swagger
 * /api/subscriptions/current:
 *   get:
 *     summary: Get current user's subscription details
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current subscription retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/current', authenticate, asyncHandler(async (req, res) => {
  const user = req.user
  const currentPlan = SUBSCRIPTION_PLANS[user.subscriptionPlan]

  if (!currentPlan) {
    throw new ApiError(404, 'Current subscription plan not found')
  }

  // Get usage statistics
  const stats = await user.getStats()

  res.json({
    message: 'Current subscription retrieved successfully',
    subscription: {
      plan: currentPlan,
      usage: {
        generationsUsed: user.generationsUsed,
        generationsLimit: user.subscriptionPlan === 'pro' ? 'unlimited' : user.generationsLimit,
        generationsRemaining: user.subscriptionPlan === 'pro' ? 'unlimited' : Math.max(0, user.generationsLimit - user.generationsUsed)
      },
      stats: stats,
      billing: {
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
        nextBillingDate: null, // Would be populated from Stripe
        status: user.stripeSubscriptionId ? 'active' : 'inactive'
      }
    }
  })
}))

/**
 * @swagger
 * /api/subscriptions/usage:
 *   get:
 *     summary: Get detailed usage statistics
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [current_month, last_month, last_3_months]
 *           default: current_month
 *         description: Usage period to retrieve
 *     responses:
 *       200:
 *         description: Usage statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/usage', authenticate, asyncHandler(async (req, res) => {
  const { period = 'current_month' } = req.query
  const user = req.user

  // Calculate date range based on period
  let startDate, endDate
  const now = new Date()
  
  switch (period) {
    case 'current_month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      break
    case 'last_month':
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      endDate = new Date(now.getFullYear(), now.getMonth(), 0)
      break
    case 'last_3_months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1)
      endDate = now
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  }

  // Get detailed usage stats (this would query the database in a real implementation)
  const usageStats = {
    period: period,
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    },
    totalGenerations: user.generationsUsed,
    generationsLimit: user.subscriptionPlan === 'pro' ? 'unlimited' : user.generationsLimit,
    generationsRemaining: user.subscriptionPlan === 'pro' ? 'unlimited' : Math.max(0, user.generationsLimit - user.generationsUsed),
    breakdown: {
      contentGeneration: Math.floor(user.generationsUsed * 0.6),
      contentRepurposing: Math.floor(user.generationsUsed * 0.4)
    },
    dailyUsage: [], // Would be populated from actual usage data
    topContentTypes: [
      { type: 'social-post', count: Math.floor(user.generationsUsed * 0.4) },
      { type: 'blog-outline', count: Math.floor(user.generationsUsed * 0.3) },
      { type: 'email-subject', count: Math.floor(user.generationsUsed * 0.3) }
    ]
  }

  res.json({
    message: 'Usage statistics retrieved successfully',
    usage: usageStats
  })
}))

/**
 * @swagger
 * /api/subscriptions/upgrade-preview:
 *   post:
 *     summary: Preview subscription upgrade/downgrade
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetPlan
 *             properties:
 *               targetPlan:
 *                 type: string
 *                 enum: [basic, pro]
 *     responses:
 *       200:
 *         description: Upgrade preview calculated successfully
 *       400:
 *         description: Invalid target plan
 *       401:
 *         description: Unauthorized
 */
router.post('/upgrade-preview', authenticate, asyncHandler(async (req, res) => {
  const { targetPlan } = req.body
  const user = req.user

  if (!targetPlan || !SUBSCRIPTION_PLANS[targetPlan]) {
    throw new ApiError(400, 'Invalid target plan')
  }

  const currentPlan = SUBSCRIPTION_PLANS[user.subscriptionPlan]
  const newPlan = SUBSCRIPTION_PLANS[targetPlan]

  if (currentPlan.id === newPlan.id) {
    throw new ApiError(400, 'Target plan is the same as current plan')
  }

  // Calculate pricing changes
  const priceDifference = newPlan.price - currentPlan.price
  const isUpgrade = priceDifference > 0

  const preview = {
    currentPlan: currentPlan,
    targetPlan: newPlan,
    isUpgrade: isUpgrade,
    priceDifference: Math.abs(priceDifference),
    effectiveDate: new Date().toISOString(),
    benefits: {
      added: newPlan.features.filter(f => !currentPlan.features.includes(f)),
      removed: currentPlan.features.filter(f => !newPlan.features.includes(f))
    },
    generationsChange: {
      current: currentPlan.generationsLimit,
      new: newPlan.generationsLimit === -1 ? 'unlimited' : newPlan.generationsLimit
    }
  }

  res.json({
    message: 'Upgrade preview calculated successfully',
    preview: preview
  })
}))

/**
 * @swagger
 * /api/subscriptions/cancel:
 *   post:
 *     summary: Cancel current subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for cancellation
 *               feedback:
 *                 type: string
 *                 description: Additional feedback
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: No active subscription to cancel
 */
router.post('/cancel', authenticate, asyncHandler(async (req, res) => {
  const { reason, feedback } = req.body
  const user = req.user

  if (!user.stripeSubscriptionId) {
    throw new ApiError(400, 'No active subscription to cancel')
  }

  // In a real implementation, this would:
  // 1. Cancel the Stripe subscription
  // 2. Update the user's subscription status
  // 3. Set cancellation date
  // 4. Log the cancellation reason

  logger.info(`Subscription cancellation requested by user ${user.userId}`, {
    reason,
    feedback,
    currentPlan: user.subscriptionPlan
  })

  // Mock cancellation - in production, integrate with Stripe
  await user.update({
    subscriptionPlan: 'basic',
    stripeSubscriptionId: null,
    generationsLimit: 10
  })

  res.json({
    message: 'Subscription cancelled successfully',
    details: {
      cancelledAt: new Date().toISOString(),
      reason: reason,
      accessUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      newPlan: 'basic'
    }
  })
}))

/**
 * @swagger
 * /api/subscriptions/reactivate:
 *   post:
 *     summary: Reactivate cancelled subscription
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription reactivated successfully
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: No cancelled subscription to reactivate
 */
router.post('/reactivate', authenticate, asyncHandler(async (req, res) => {
  const user = req.user

  // In a real implementation, this would check if there's a cancelled subscription
  // that can be reactivated within the grace period

  logger.info(`Subscription reactivation requested by user ${user.userId}`)

  res.json({
    message: 'Subscription reactivation initiated',
    details: {
      status: 'pending',
      message: 'Please complete payment to reactivate your subscription',
      redirectUrl: '/api/payments/create-checkout-session'
    }
  })
}))

export default router
