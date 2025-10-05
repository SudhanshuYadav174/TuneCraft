const logger = require('./logger');

class ErrorHandler extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
  }
}

const handleError = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  logger.error(`Error: ${error.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // YouTube API errors
  if (err.response && err.response.status === 403) {
    error = new ErrorHandler('API quota exceeded. Please try again later.', 429, 'QUOTA_EXCEEDED');
  }

  // Rate limit errors
  if (err.type === 'rate-limit') {
    error = new ErrorHandler('Too many requests. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error = new ErrorHandler('Invalid request parameters', 400, 'VALIDATION_ERROR');
  }

  // Default error
  if (!error.statusCode) {
    error = new ErrorHandler('Internal server error', 500, 'INTERNAL_ERROR');
  }

  res.status(error.statusCode || 500).json({
    error: error.message,
    code: error.errorCode,
    timestamp: error.timestamp,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const notFound = (req, res, next) => {
  const error = new ErrorHandler(`Not found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
};

module.exports = {
  ErrorHandler,
  handleError,
  asyncHandler,
  notFound
};