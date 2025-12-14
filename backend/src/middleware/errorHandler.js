// Custom error class for API errors
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

// Validation error helper
export class ValidationError extends ApiError {
  constructor(errors) {
    super(400, 'Validation failed', errors);
    this.name = 'ValidationError';
  }
}

// Not found error helper
export class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

// Unauthorized error helper
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

// Forbidden error helper
export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, message);
    this.name = 'ForbiddenError';
  }
}

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Handle known API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.name || 'Error',
      message: err.message,
      details: err.details
    });
  }

  // Handle PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({
          error: 'Conflict',
          message: 'A resource with this identifier already exists'
        });
      case '23503': // Foreign key violation
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Referenced resource does not exist'
        });
      case '22P02': // Invalid text representation
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid input format'
        });
      default:
        console.error('Database error:', err.code, err.message);
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token expired'
    });
  }

  // Default server error
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'An unexpected error occurred'
  });
};

// Async handler wrapper to catch async errors
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
