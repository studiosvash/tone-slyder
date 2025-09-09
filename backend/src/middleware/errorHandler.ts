import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url
  });

  res.status(500).json({
    success: false,
    error: 'internal_server_error',
    message: 'An unexpected error occurred'
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: 'not_found',
    message: `Route ${req.method} ${req.url} not found`
  });
}
