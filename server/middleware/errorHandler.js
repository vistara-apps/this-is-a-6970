import { logger } from '../utils/logger.js'

// Custom error class for API errors
export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err

  // Default to 500 server error
  if (!statusCode) {
    statusCode = 500
  }

  // Log error details
  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`)
  
  // Log stack trace for server errors
  if (statusCode === 500) {
    logger.error(err.stack)
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation Error'
  }

  if (err.name === 'UnauthorizedError') {
    statusCode = 401
    message = 'Unauthorized'
  }

  if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    statusCode = 409
    message = 'Resource already exists'
  }

  if (err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
    statusCode = 400
    message = 'Invalid reference to related resource'
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const errorResponse = {
    error: {
      status: statusCode,
      message: isDevelopment ? message : getGenericErrorMessage(statusCode),
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      method: req.method
    }
  }

  // Include stack trace in development
  if (isDevelopment && err.stack) {
    errorResponse.error.stack = err.stack
  }

  // Include validation details if available
  if (err.details) {
    errorResponse.error.details = err.details
  }

  res.status(statusCode).json(errorResponse)
}

// Get generic error message based on status code
const getGenericErrorMessage = (statusCode) => {
  switch (statusCode) {
    case 400:
      return 'Bad Request'
    case 401:
      return 'Unauthorized'
    case 403:
      return 'Forbidden'
    case 404:
      return 'Not Found'
    case 409:
      return 'Conflict'
    case 422:
      return 'Unprocessable Entity'
    case 429:
      return 'Too Many Requests'
    case 500:
      return 'Internal Server Error'
    case 502:
      return 'Bad Gateway'
    case 503:
      return 'Service Unavailable'
    default:
      return 'Something went wrong'
  }
}

// Async error wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

// Not found middleware
export const notFound = (req, res, next) => {
  const error = new ApiError(404, `Not found - ${req.originalUrl}`)
  next(error)
}
