import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Request size limiting middleware
export const requestSizeLimit = (maxSize: number = 1024 * 10) => { // 10KB default
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = req.get('content-length');
    if (contentLength && parseInt(contentLength) > maxSize) {
      logger.warn('Request size exceeded', {
        ip: req.ip,
        path: req.path,
        size: contentLength,
        maxSize,
        timestamp: new Date().toISOString()
      });
      return res.status(413).json({
        success: false,
        error: 'Request entity too large',
        timestamp: new Date().toISOString()
      });
    }
    next();
  };
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy for API
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");
  
  next();
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };
    
    if (res.statusCode >= 400) {
      logger.warn('Request completed with error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });
  
  next();
};

// API key validation middleware (for future use)
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.get('X-API-Key');
  const validApiKeys = process.env.API_KEYS?.split(',') || [];
  
  // If no API keys are configured, skip validation
  if (validApiKeys.length === 0 || !validApiKeys[0]) {
    return next();
  }
  
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    logger.warn('Invalid or missing API key', {
      ip: req.ip,
      path: req.path,
      providedKey: apiKey ? 'provided' : 'missing',
      timestamp: new Date().toISOString()
    });
    return res.status(401).json({
      success: false,
      error: 'Invalid or missing API key',
      timestamp: new Date().toISOString()
    });
  }
  
  next();
};
