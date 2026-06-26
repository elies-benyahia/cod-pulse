const rateLimit = require('express-rate-limit');

// --- Rate limiting sur la route de login ---
// Protection brute-force : max 5 tentatives par IP sur 15 minutes.
const loginRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_LOGIN) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again in 15 minutes' },
  skipSuccessfulRequests: true
});

// Rate limiter général pour toutes les routes API
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down' }
});

module.exports = { loginRateLimiter, apiRateLimiter };
