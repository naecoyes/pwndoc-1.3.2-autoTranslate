/**
 * Centralized error handling middleware
 * Provides consistent error responses and logging
 */

const errorHandler = (err, req, res, next) => {
  // Log error details for debugging
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Don't expose internal error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      details: isDevelopment ? err.message : 'Invalid input data'
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid ID format',
      details: isDevelopment ? err.message : 'Invalid resource identifier'
    });
  }
  
  if (err.code === 11000) {
    return res.status(409).json({
      status: 'error',
      message: 'Duplicate entry',
      details: isDevelopment ? err.message : 'Resource already exists'
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token',
      details: 'Authentication failed'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      message: 'Token expired',
      details: 'Please login again'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    details: isDevelopment ? err.stack : 'Something went wrong. Please contact your administrator.'
  });
};

/**
 * Async error wrapper to catch async errors in route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom error class for application-specific errors
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  AppError
};