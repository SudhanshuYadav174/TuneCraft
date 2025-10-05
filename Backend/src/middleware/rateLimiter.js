const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: message,
      code: 'RATE_LIMIT_EXCEEDED',
      timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
        url: req.originalUrl,
        method: req.method,
        userAgent: req.get('User-Agent')
      });
      
      res.status(429).json({
        error: message,
        code: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString()
      });
    }
  });
};

// General API rate limiter
const apiLimiter = createRateLimiter(
  parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiter for search endpoints
const searchLimiter = createRateLimiter(
  5 * 60 * 1000, // 5 minutes
  50, // 50 searches per 5 minutes
  'Too many search requests, please try again later.'
);

// Stream endpoint rate limiter
const streamLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  30, // 30 stream requests per minute
  'Too many streaming requests, please try again later.'
);

module.exports = {
  apiLimiter,
  searchLimiter,
  streamLimiter
};