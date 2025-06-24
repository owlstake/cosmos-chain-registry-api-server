import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import logger from '../utils/logger';

// Rate limiting configuration
const createRateLimiter = (windowMs: number, max: number, message: string, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    },
    skipSuccessfulRequests,
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.path,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
      res.status(429).json({
        success: false,
        error: message,
        timestamp: new Date().toISOString()
      });
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
};

// General API rate limiting - 1000 requests per 15 minutes
export const generalRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  1000, // limit each IP to 1000 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiting for sync endpoint - 5 requests per hour
export const syncRateLimit = createRateLimiter(
  60 * 60 * 1000, // 1 hour
  5, // limit each IP to 5 requests per windowMs
  'Too many sync requests from this IP, please try again later.'
);

// Moderate rate limiting for search - 100 requests per 15 minutes
export const searchRateLimit = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many search requests from this IP, please try again later.'
);

// Burst protection - 30 requests per minute
export const burstRateLimit = createRateLimiter(
  60 * 1000, // 1 minute
  30, // limit each IP to 30 requests per windowMs
  'Too many requests in a short time, please slow down.'
);
