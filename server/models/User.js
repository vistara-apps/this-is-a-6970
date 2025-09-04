import { dbAsync } from '../config/database.js'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../utils/logger.js'

export class User {
  constructor(data) {
    this.userId = data.userId
    this.email = data.email
    this.password = data.password
    this.subscriptionPlan = data.subscriptionPlan || 'basic'
    this.stripeCustomerId = data.stripeCustomerId
    this.stripeSubscriptionId = data.stripeSubscriptionId
    this.generationsUsed = data.generationsUsed || 0
    this.generationsLimit = data.generationsLimit || 10
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  // Create a new user
  static async create({ email, password, subscriptionPlan = 'basic' }) {
    try {
      const userId = uuidv4()
      const hashedPassword = await bcrypt.hash(password, 12)
      
      const result = await dbAsync.run(
        `INSERT INTO users (userId, email, password, subscriptionPlan, generationsLimit)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, email, hashedPassword, subscriptionPlan, subscriptionPlan === 'pro' ? -1 : 10]
      )

      logger.info(`User created: ${email}`)
      return await User.findById(userId)
    } catch (error) {
      logger.error('Error creating user:', error.message)
      throw error
    }
  }

  // Find user by ID
  static async findById(userId) {
    try {
      const row = await dbAsync.get(
        'SELECT * FROM users WHERE userId = ?',
        [userId]
      )
      return row ? new User(row) : null
    } catch (error) {
      logger.error('Error finding user by ID:', error.message)
      throw error
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const row = await dbAsync.get(
        'SELECT * FROM users WHERE email = ?',
        [email]
      )
      return row ? new User(row) : null
    } catch (error) {
      logger.error('Error finding user by email:', error.message)
      throw error
    }
  }

  // Verify password
  async verifyPassword(password) {
    try {
      return await bcrypt.compare(password, this.password)
    } catch (error) {
      logger.error('Error verifying password:', error.message)
      throw error
    }
  }

  // Update user
  async update(updates) {
    try {
      const allowedUpdates = [
        'subscriptionPlan', 'stripeCustomerId', 'stripeSubscriptionId',
        'generationsUsed', 'generationsLimit'
      ]
      
      const updateFields = []
      const updateValues = []
      
      for (const [key, value] of Object.entries(updates)) {
        if (allowedUpdates.includes(key)) {
          updateFields.push(`${key} = ?`)
          updateValues.push(value)
          this[key] = value
        }
      }
      
      if (updateFields.length === 0) {
        return this
      }
      
      updateFields.push('updatedAt = CURRENT_TIMESTAMP')
      updateValues.push(this.userId)
      
      await dbAsync.run(
        `UPDATE users SET ${updateFields.join(', ')} WHERE userId = ?`,
        updateValues
      )
      
      logger.info(`User updated: ${this.email}`)
      return this
    } catch (error) {
      logger.error('Error updating user:', error.message)
      throw error
    }
  }

  // Increment generations used
  async incrementGenerations() {
    try {
      if (this.subscriptionPlan === 'pro') {
        return this // Pro users have unlimited generations
      }
      
      const newCount = this.generationsUsed + 1
      await this.update({ generationsUsed: newCount })
      return this
    } catch (error) {
      logger.error('Error incrementing generations:', error.message)
      throw error
    }
  }

  // Check if user can generate content
  canGenerate() {
    if (this.subscriptionPlan === 'pro') {
      return true
    }
    return this.generationsUsed < this.generationsLimit
  }

  // Get user stats
  async getStats() {
    try {
      const contentRequests = await dbAsync.all(
        `SELECT type, status, COUNT(*) as count 
         FROM content_requests 
         WHERE userId = ? 
         GROUP BY type, status`,
        [this.userId]
      )

      const totalRequests = await dbAsync.get(
        'SELECT COUNT(*) as total FROM content_requests WHERE userId = ?',
        [this.userId]
      )

      return {
        totalRequests: totalRequests.total || 0,
        generationsUsed: this.generationsUsed,
        generationsLimit: this.subscriptionPlan === 'pro' ? 'unlimited' : this.generationsLimit,
        subscriptionPlan: this.subscriptionPlan,
        breakdown: contentRequests
      }
    } catch (error) {
      logger.error('Error getting user stats:', error.message)
      throw error
    }
  }

  // Convert to JSON (remove sensitive data)
  toJSON() {
    const { password, ...userWithoutPassword } = this
    return userWithoutPassword
  }

  // Find user by Stripe subscription ID
  static async findByStripeSubscriptionId(subscriptionId) {
    try {
      const row = await dbAsync.get(
        'SELECT * FROM users WHERE stripeSubscriptionId = ?',
        [subscriptionId]
      )
      return row ? new User(row) : null
    } catch (error) {
      logger.error('Error finding user by Stripe subscription ID:', error.message)
      throw error
    }
  }

  // Delete user
  async delete() {
    try {
      await dbAsync.run('DELETE FROM users WHERE userId = ?', [this.userId])
      logger.info(`User deleted: ${this.email}`)
    } catch (error) {
      logger.error('Error deleting user:', error.message)
      throw error
    }
  }
}
