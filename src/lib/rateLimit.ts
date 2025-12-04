// src/lib/rateLimit.ts
// Purpose: Request rate limiting to prevent abuse
// Limits API calls per IP address to prevent brute force attacks

import rateLimit from 'express-rate-limit'

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Strict limiter for auth endpoints
 * 5 requests per 15 minutes per IP (prevents password brute force)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: false,
  message: 'Too many login attempts, please try again later',
})

/**
 * OTP limiter
 * 3 OTP requests per hour per phone
 */
export const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.body?.phone || req.ip || '',
  message: 'Too many OTP requests, please try again later',
})
