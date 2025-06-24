import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Admin authentication middleware for sync endpoint
export const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  const adminApiKey = process.env.ADMIN_API_KEY;
  const adminIPs = process.env.ADMIN_IPS?.split(',').map(ip => ip.trim()) || ['127.0.0.1', '::1'];
  
  // Get client IP (handle proxy headers)
  const clientIP = req.ip || 
    req.connection.remoteAddress || 
    req.socket.remoteAddress ||
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    'unknown';

  // Log the admin access attempt
  logger.info('Admin sync attempt', {
    clientIP,
    hasApiKey: !!apiKey,
    userAgent: req.headers['user-agent'],
    timestamp: new Date().toISOString()
  });

  // Check if admin API key is configured
  if (!adminApiKey) {
    logger.warn('Admin API key not configured, allowing sync access');
    return next();
  }

  // Check API key
  if (!apiKey) {
    logger.warn('Sync attempt without API key', { clientIP });
    res.status(401).json({
      success: false,
      error: 'Admin API key required',
      details: 'Please provide X-API-Key header for sync operations',
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (apiKey !== adminApiKey) {
    logger.warn('Sync attempt with invalid API key', { clientIP, providedKey: apiKey.substring(0, 8) + '...' });
    res.status(401).json({
      success: false,
      error: 'Invalid admin API key',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Check IP whitelist
  const isIPAllowed = adminIPs.some(allowedIP => {
    if (allowedIP === '127.0.0.1' && (clientIP === '127.0.0.1' || clientIP === '::1' || clientIP === '::ffff:127.0.0.1')) {
      return true;
    }
    return clientIP === allowedIP || clientIP === `::ffff:${allowedIP}`;
  });

  if (!isIPAllowed) {
    logger.warn('Sync attempt from non-whitelisted IP', { clientIP, allowedIPs: adminIPs });
    res.status(403).json({
      success: false,
      error: 'IP address not authorized',
      details: 'Your IP address is not in the admin whitelist',
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Log successful admin authentication
  logger.info('Admin sync authenticated successfully', { clientIP });
  next();
};

// Optional: General API key authentication for all endpoints
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
  const apiKeys = process.env.API_KEYS?.split(',').map(key => key.trim());
  
  // If no API keys configured, skip authentication
  if (!apiKeys || apiKeys.length === 0) {
    return next();
  }

  const providedKey = req.headers['x-api-key'] as string;
  
  if (!providedKey) {
    res.status(401).json({
      success: false,
      error: 'API key required',
      details: 'Please provide X-API-Key header',
      timestamp: new Date().toISOString()
    });
    return;
  }

  if (!apiKeys.includes(providedKey)) {
    logger.warn('Invalid API key attempt', { 
      ip: req.ip, 
      providedKey: providedKey.substring(0, 8) + '...' 
    });
    res.status(401).json({
      success: false,
      error: 'Invalid API key',
      timestamp: new Date().toISOString()
    });
    return;
  }

  next();
};
