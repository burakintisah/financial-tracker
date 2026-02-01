/**
 * Rate Limiting Middleware
 * Implements IP-based rate limiting for API endpoints
 */

import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

/**
 * Standard rate limiter for analysis endpoints
 * Max requests per minute configurable via environment
 */
export const analysisRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: env.MAX_REQUESTS_PER_MINUTE,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
    retryAfter: 60,
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  keyGenerator: (req) => {
    // Use X-Forwarded-For header if behind a proxy, otherwise use IP
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
           req.ip ||
           'unknown';
  },
  skip: (req) => {
    // Skip rate limiting for health check endpoints
    return req.path === '/api/health' || req.path === '/api/health/analysis';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Too many requests, please try again later.',
      retryAfter: 60,
    });
  },
});

/**
 * Stricter rate limiter for AI-intensive endpoints
 * Limits to 5 requests per minute
 */
export const strictRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // Stricter limit for AI calls
  message: {
    success: false,
    error: 'Rate limit exceeded for AI analysis. Please wait before making more requests.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
           req.ip ||
           'unknown';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: 'Rate limit exceeded for AI analysis. Please wait before making more requests.',
      retryAfter: 60,
    });
  },
});

export default analysisRateLimiter;
