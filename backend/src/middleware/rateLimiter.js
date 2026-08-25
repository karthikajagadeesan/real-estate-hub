const rateLimit = require('express-rate-limit');

// Rate limiter for Lead/Inquiry submissions: max 100 requests per 15 minutes per IP
const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many inquiry submissions from this IP. Please try again after 15 minutes to prevent spam.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for Auth endpoints (Login / Register): max 50 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter: max 300 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'API rate limit exceeded. Please slow down your requests.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  inquiryLimiter,
  authLimiter,
  apiLimiter,
};
