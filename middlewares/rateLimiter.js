import rateLimit from 'express-rate-limit'

// Strict limit for auth
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts
  message: { error: 'Too many login attempts, try again after 15 minutes.' },
})

// Moderate limit for public API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, slow down.' },
})
