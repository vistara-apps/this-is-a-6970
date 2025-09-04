import { dbAsync } from '../config/database.js'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../utils/logger.js'

export class ContentRequest {
  constructor(data) {
    this.requestId = data.requestId
    this.userId = data.userId
    this.type = data.type // 'generation' or 'repurposing'
    this.contentType = data.contentType
    this.inputContent = data.inputContent
    this.generatedContent = data.generatedContent
    this.status = data.status || 'pending'
    this.metadata = data.metadata ? JSON.parse(data.metadata) : {}
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  // Create a new content request
  static async create({
    userId,
    type,
    contentType,
    inputContent,
    metadata = {}
  }) {
    try {
      const requestId = uuidv4()
      
      await dbAsync.run(
        `INSERT INTO content_requests 
         (requestId, userId, type, contentType, inputContent, metadata, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          requestId,
          userId,
          type,
          contentType,
          inputContent,
          JSON.stringify(metadata),
          'pending'
        ]
      )

      logger.info(`Content request created: ${requestId} for user ${userId}`)
      return await ContentRequest.findById(requestId)
    } catch (error) {
      logger.error('Error creating content request:', error.message)
      throw error
    }
  }

  // Find content request by ID
  static async findById(requestId) {
    try {
      const row = await dbAsync.get(
        'SELECT * FROM content_requests WHERE requestId = ?',
        [requestId]
      )
      return row ? new ContentRequest(row) : null
    } catch (error) {
      logger.error('Error finding content request by ID:', error.message)
      throw error
    }
  }

  // Find content requests by user ID
  static async findByUserId(userId, options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        status,
        type,
        orderBy = 'createdAt',
        order = 'DESC'
      } = options

      let query = 'SELECT * FROM content_requests WHERE userId = ?'
      const params = [userId]

      if (status) {
        query += ' AND status = ?'
        params.push(status)
      }

      if (type) {
        query += ' AND type = ?'
        params.push(type)
      }

      query += ` ORDER BY ${orderBy} ${order} LIMIT ? OFFSET ?`
      params.push(limit, offset)

      const rows = await dbAsync.all(query, params)
      return rows.map(row => new ContentRequest(row))
    } catch (error) {
      logger.error('Error finding content requests by user ID:', error.message)
      throw error
    }
  }

  // Update content request
  async update(updates) {
    try {
      const allowedUpdates = [
        'status', 'generatedContent', 'metadata'
      ]
      
      const updateFields = []
      const updateValues = []
      
      for (const [key, value] of Object.entries(updates)) {
        if (allowedUpdates.includes(key)) {
          if (key === 'metadata') {
            updateFields.push(`${key} = ?`)
            updateValues.push(JSON.stringify(value))
            this[key] = value
          } else {
            updateFields.push(`${key} = ?`)
            updateValues.push(value)
            this[key] = value
          }
        }
      }
      
      if (updateFields.length === 0) {
        return this
      }
      
      updateFields.push('updatedAt = CURRENT_TIMESTAMP')
      updateValues.push(this.requestId)
      
      await dbAsync.run(
        `UPDATE content_requests SET ${updateFields.join(', ')} WHERE requestId = ?`,
        updateValues
      )
      
      logger.info(`Content request updated: ${this.requestId}`)
      return this
    } catch (error) {
      logger.error('Error updating content request:', error.message)
      throw error
    }
  }

  // Mark as processing
  async markAsProcessing() {
    return await this.update({ status: 'processing' })
  }

  // Mark as completed
  async markAsCompleted(generatedContent, metadata = {}) {
    return await this.update({
      status: 'completed',
      generatedContent,
      metadata: { ...this.metadata, ...metadata }
    })
  }

  // Mark as failed
  async markAsFailed(error, metadata = {}) {
    return await this.update({
      status: 'failed',
      metadata: {
        ...this.metadata,
        ...metadata,
        error: error.message || error,
        failedAt: new Date().toISOString()
      }
    })
  }

  // Get processing time
  getProcessingTime() {
    if (!this.updatedAt || !this.createdAt) {
      return null
    }
    
    const created = new Date(this.createdAt)
    const updated = new Date(this.updatedAt)
    return updated - created
  }

  // Get user statistics for content requests
  static async getUserStats(userId, timeframe = '30d') {
    try {
      let dateFilter = ''
      if (timeframe === '7d') {
        dateFilter = "AND createdAt >= datetime('now', '-7 days')"
      } else if (timeframe === '30d') {
        dateFilter = "AND createdAt >= datetime('now', '-30 days')"
      } else if (timeframe === '90d') {
        dateFilter = "AND createdAt >= datetime('now', '-90 days')"
      }

      const stats = await dbAsync.all(
        `SELECT 
           type,
           status,
           COUNT(*) as count,
           AVG(CASE 
             WHEN status = 'completed' AND updatedAt IS NOT NULL 
             THEN (julianday(updatedAt) - julianday(createdAt)) * 24 * 60 * 60 
             ELSE NULL 
           END) as avgProcessingTime
         FROM content_requests 
         WHERE userId = ? ${dateFilter}
         GROUP BY type, status`,
        [userId]
      )

      const totalRequests = await dbAsync.get(
        `SELECT COUNT(*) as total FROM content_requests WHERE userId = ? ${dateFilter}`,
        [userId]
      )

      return {
        totalRequests: totalRequests.total || 0,
        breakdown: stats,
        timeframe
      }
    } catch (error) {
      logger.error('Error getting user content stats:', error.message)
      throw error
    }
  }

  // Delete content request
  async delete() {
    try {
      await dbAsync.run('DELETE FROM content_requests WHERE requestId = ?', [this.requestId])
      logger.info(`Content request deleted: ${this.requestId}`)
    } catch (error) {
      logger.error('Error deleting content request:', error.message)
      throw error
    }
  }

  // Convert to JSON
  toJSON() {
    return {
      requestId: this.requestId,
      userId: this.userId,
      type: this.type,
      contentType: this.contentType,
      inputContent: this.inputContent,
      generatedContent: this.generatedContent,
      status: this.status,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      processingTime: this.getProcessingTime()
    }
  }
}
