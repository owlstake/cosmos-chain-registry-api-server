import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Helper function to validate chain name
const isValidChainName = (chainName: string): boolean => {
  return /^[a-zA-Z0-9\-_]{1,50}$/.test(chainName);
};

// Helper function to validate integer
const isValidInteger = (value: string, min = 0, max = Number.MAX_SAFE_INTEGER): boolean => {
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= min && num <= max;
};

// Chain name validation middleware
export const validateChainName = (req: Request, res: Response, next: NextFunction): void => {
  const { chainName } = req.params;
  
  if (!chainName || !isValidChainName(chainName)) {
    logger.warn('Invalid chain name:', { chainName, path: req.path });
    res.status(400).json({
      success: false,
      error: 'Invalid chain name',
      details: 'Chain name must be 1-50 characters and contain only letters, numbers, hyphens, and underscores',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  next();
};

// Pagination validation middleware
export const validatePaginationQuery = (req: Request, res: Response, next: NextFunction): void => {
  const { limit, offset } = req.query;
  
  if (limit && !isValidInteger(limit as string, 1, 1000)) {
    res.status(400).json({
      success: false,
      error: 'Invalid limit parameter',
      details: 'Limit must be an integer between 1 and 1000',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  if (offset && !isValidInteger(offset as string, 0)) {
    res.status(400).json({
      success: false,
      error: 'Invalid offset parameter', 
      details: 'Offset must be a non-negative integer',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  next();
};

// Filter validation middleware
export const validateFilterQuery = (req: Request, res: Response, next: NextFunction): void => {
  const { network_type, status } = req.query;
  
  if (network_type && !['mainnet', 'testnet', 'devnet'].includes(network_type as string)) {
    res.status(400).json({
      success: false,
      error: 'Invalid network_type parameter',
      details: 'Network type must be mainnet, testnet, or devnet',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  if (status && !['live', 'upcoming', 'killed'].includes(status as string)) {
    res.status(400).json({
      success: false,
      error: 'Invalid status parameter',
      details: 'Status must be live, upcoming, or killed',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  next();
};

// Search query validation middleware
export const validateSearchQuery = (req: Request, res: Response, next: NextFunction): void => {
  const { q } = req.query;
  
  if (q && (typeof q !== 'string' || q.length === 0 || q.length > 100)) {
    res.status(400).json({
      success: false,
      error: 'Invalid search query',
      details: 'Search query must be between 1 and 100 characters',
      timestamp: new Date().toISOString()
    });
    return;
  }
  
  next();
};
