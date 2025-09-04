import express from 'express'
import Stripe from 'stripe'
import { authenticate } from '../middleware/auth.js'
import { ApiError, asyncHandler } from '../middleware/errorHandler.js'
import { logger } from '../utils/logger.js'

const router = express.Router()

// Initialize Stripe (will be null if not configured)
let stripe = null
if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'your_stripe_secret_key_here') {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  logger.info('Stripe initialized successfully')
} else {
  logger.warn('Stripe not configured - payment endpoints will return mock responses')
}

// Subscription plans with Stripe price IDs (in production, these would be actual Stripe price IDs)
const STRIPE_PLANS = {
  basic: {
    priceId: 'price_basic_monthly', // Replace with actual Stripe price ID
    amount: 1500, // $15.00 in cents
    currency: 'usd',
    interval: 'month'
  },
  pro: {
    priceId: 'price_pro_monthly', // Replace with actual Stripe price ID
    amount: 4500, // $45.00 in cents
    currency: 'usd',
    interval: 'month'
  }
}

/**
 * @swagger
 * /api/payments/create-checkout-session:
 *   post:
 *     summary: Create Stripe checkout session for subscription
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *             properties:
 *               planId:
 *                 type: string
 *                 enum: [basic, pro]
 *               successUrl:
 *                 type: string
 *                 format: uri
 *               cancelUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *       400:
 *         description: Invalid plan or missing parameters
 *       401:
 *         description: Unauthorized
 */
router.post('/create-checkout-session', authenticate, asyncHandler(async (req, res) => {
  const { planId, successUrl, cancelUrl } = req.body
  const user = req.user

  if (!planId || !STRIPE_PLANS[planId]) {
    throw new ApiError(400, 'Invalid plan ID')
  }

  // Mock response if Stripe is not configured
  if (!stripe) {
    logger.info(`Mock checkout session created for user ${user.userId}, plan: ${planId}`)
    
    return res.json({
      message: 'Checkout session created successfully (mock)',
      sessionId: `mock_session_${Date.now()}`,
      url: `https://checkout.stripe.com/mock/${planId}`,
      mock: true
    })
  }

  try {
    // Create or retrieve Stripe customer
    let customerId = user.stripeCustomerId
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.userId
        }
      })
      customerId = customer.id
      
      // Update user with Stripe customer ID
      await user.update({ stripeCustomerId: customerId })
      logger.info(`Created Stripe customer ${customerId} for user ${user.userId}`)
    }

    const plan = STRIPE_PLANS[planId]
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.CORS_ORIGIN}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.CORS_ORIGIN}/subscription/cancel`,
      metadata: {
        userId: user.userId,
        planId: planId
      },
      subscription_data: {
        metadata: {
          userId: user.userId,
          planId: planId
        }
      }
    })

    logger.info(`Checkout session created: ${session.id} for user ${user.userId}`)

    res.json({
      message: 'Checkout session created successfully',
      sessionId: session.id,
      url: session.url
    })

  } catch (error) {
    logger.error('Stripe checkout session creation failed:', error.message)
    throw new ApiError(500, 'Failed to create checkout session')
  }
}))

/**
 * @swagger
 * /api/payments/create-portal-session:
 *   post:
 *     summary: Create Stripe customer portal session
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               returnUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Portal session created successfully
 *       400:
 *         description: No Stripe customer found
 *       401:
 *         description: Unauthorized
 */
router.post('/create-portal-session', authenticate, asyncHandler(async (req, res) => {
  const { returnUrl } = req.body
  const user = req.user

  if (!user.stripeCustomerId) {
    throw new ApiError(400, 'No Stripe customer found for this user')
  }

  // Mock response if Stripe is not configured
  if (!stripe) {
    logger.info(`Mock portal session created for user ${user.userId}`)
    
    return res.json({
      message: 'Portal session created successfully (mock)',
      url: `https://billing.stripe.com/mock/${user.stripeCustomerId}`,
      mock: true
    })
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl || `${process.env.CORS_ORIGIN}/dashboard`,
    })

    logger.info(`Portal session created for user ${user.userId}`)

    res.json({
      message: 'Portal session created successfully',
      url: session.url
    })

  } catch (error) {
    logger.error('Stripe portal session creation failed:', error.message)
    throw new ApiError(500, 'Failed to create portal session')
  }
}))

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Handle Stripe webhooks
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook signature
 */
router.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
  if (!stripe) {
    logger.warn('Webhook received but Stripe not configured')
    return res.status(200).json({ received: true, mock: true })
  }

  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    logger.error('Stripe webhook secret not configured')
    return res.status(400).json({ error: 'Webhook secret not configured' })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    logger.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  logger.info(`Received Stripe webhook: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object)
        break
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break
        
      default:
        logger.info(`Unhandled webhook event type: ${event.type}`)
    }

    res.json({ received: true })
    
  } catch (error) {
    logger.error('Webhook processing error:', error.message)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}))

// Webhook event handlers
async function handleCheckoutSessionCompleted(session) {
  logger.info(`Checkout session completed: ${session.id}`)
  
  const userId = session.metadata?.userId
  if (!userId) {
    logger.error('No userId in checkout session metadata')
    return
  }

  // Import User model dynamically to avoid circular imports
  const { User } = await import('../models/User.js')
  const user = await User.findById(userId)
  
  if (!user) {
    logger.error(`User not found: ${userId}`)
    return
  }

  // Update user with subscription info
  await user.update({
    stripeCustomerId: session.customer,
    stripeSubscriptionId: session.subscription
  })

  logger.info(`Updated user ${userId} with subscription ${session.subscription}`)
}

async function handleSubscriptionCreated(subscription) {
  logger.info(`Subscription created: ${subscription.id}`)
  
  const userId = subscription.metadata?.userId
  const planId = subscription.metadata?.planId
  
  if (!userId || !planId) {
    logger.error('Missing metadata in subscription')
    return
  }

  const { User } = await import('../models/User.js')
  const user = await User.findById(userId)
  
  if (!user) {
    logger.error(`User not found: ${userId}`)
    return
  }

  // Update user subscription
  await user.update({
    subscriptionPlan: planId,
    stripeSubscriptionId: subscription.id,
    generationsLimit: planId === 'pro' ? -1 : 10,
    generationsUsed: 0 // Reset usage on new subscription
  })

  logger.info(`User ${userId} subscribed to ${planId} plan`)
}

async function handleSubscriptionUpdated(subscription) {
  logger.info(`Subscription updated: ${subscription.id}`)
  
  // Handle subscription changes (plan upgrades/downgrades)
  const { User } = await import('../models/User.js')
  const user = await User.findByStripeSubscriptionId(subscription.id)
  
  if (!user) {
    logger.error(`User not found for subscription: ${subscription.id}`)
    return
  }

  // Determine new plan based on subscription items
  const priceId = subscription.items.data[0]?.price?.id
  let newPlan = 'basic'
  
  for (const [planId, planData] of Object.entries(STRIPE_PLANS)) {
    if (planData.priceId === priceId) {
      newPlan = planId
      break
    }
  }

  await user.update({
    subscriptionPlan: newPlan,
    generationsLimit: newPlan === 'pro' ? -1 : 10
  })

  logger.info(`User ${user.userId} plan updated to ${newPlan}`)
}

async function handleSubscriptionDeleted(subscription) {
  logger.info(`Subscription deleted: ${subscription.id}`)
  
  const { User } = await import('../models/User.js')
  const user = await User.findByStripeSubscriptionId(subscription.id)
  
  if (!user) {
    logger.error(`User not found for subscription: ${subscription.id}`)
    return
  }

  // Downgrade to basic plan
  await user.update({
    subscriptionPlan: 'basic',
    stripeSubscriptionId: null,
    generationsLimit: 10
  })

  logger.info(`User ${user.userId} downgraded to basic plan`)
}

async function handlePaymentSucceeded(invoice) {
  logger.info(`Payment succeeded: ${invoice.id}`)
  
  // Reset usage for the new billing period
  if (invoice.subscription) {
    const { User } = await import('../models/User.js')
    const user = await User.findByStripeSubscriptionId(invoice.subscription)
    
    if (user && user.subscriptionPlan !== 'pro') {
      await user.update({ generationsUsed: 0 })
      logger.info(`Reset usage for user ${user.userId}`)
    }
  }
}

async function handlePaymentFailed(invoice) {
  logger.info(`Payment failed: ${invoice.id}`)
  
  // Handle failed payments (send notifications, etc.)
  if (invoice.subscription) {
    const { User } = await import('../models/User.js')
    const user = await User.findByStripeSubscriptionId(invoice.subscription)
    
    if (user) {
      logger.warn(`Payment failed for user ${user.userId}`)
      // In production, send email notification or take other actions
    }
  }
}

export default router
