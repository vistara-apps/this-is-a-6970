import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { logger } from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Database configuration
const dbPath = process.env.DATABASE_URL || join(__dirname, '..', 'database.sqlite')

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    logger.error('Error opening database:', err.message)
    process.exit(1)
  } else {
    logger.info(`Connected to SQLite database at ${dbPath}`)
    
    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON', (err) => {
      if (err) {
        logger.error('Error enabling foreign keys:', err.message)
      } else {
        logger.info('Foreign keys enabled')
      }
    })
  }
})

// Promisify database methods for easier async/await usage
const dbAsync = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          reject(err)
        } else {
          resolve({ id: this.lastID, changes: this.changes })
        }
      })
    })
  },

  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row)
        }
      })
    })
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows)
        }
      })
    })
  },

  close: () => {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }
}

// Initialize database tables
export const initializeDatabase = async () => {
  try {
    // Create Users table
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS users (
        userId TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        subscriptionPlan TEXT DEFAULT 'basic' CHECK (subscriptionPlan IN ('basic', 'pro')),
        stripeCustomerId TEXT,
        stripeSubscriptionId TEXT,
        generationsUsed INTEGER DEFAULT 0,
        generationsLimit INTEGER DEFAULT 10,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create ContentRequests table
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS content_requests (
        requestId TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('generation', 'repurposing')),
        contentType TEXT,
        inputContent TEXT,
        generatedContent TEXT,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
        metadata TEXT, -- JSON string for additional data
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE CASCADE
      )
    `)

    // Create Analytics table for tracking usage
    await dbAsync.run(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        event TEXT NOT NULL,
        data TEXT, -- JSON string for event data
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE CASCADE
      )
    `)

    // Create indexes for better performance
    await dbAsync.run('CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)')
    await dbAsync.run('CREATE INDEX IF NOT EXISTS idx_content_requests_user ON content_requests (userId)')
    await dbAsync.run('CREATE INDEX IF NOT EXISTS idx_content_requests_status ON content_requests (status)')
    await dbAsync.run('CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics (userId)')
    await dbAsync.run('CREATE INDEX IF NOT EXISTS idx_analytics_event ON analytics (event)')

    logger.info('Database tables initialized successfully')
  } catch (error) {
    logger.error('Error initializing database:', error.message)
    throw error
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await dbAsync.close()
    logger.info('Database connection closed')
  } catch (error) {
    logger.error('Error closing database:', error.message)
  }
})

export { db, dbAsync }
