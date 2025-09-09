import { Request, Response, NextFunction } from 'express';

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        tier: 'free' | 'premium' | 'enterprise';
      };
    }
  }
}

export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  // For development, create a mock user
  // In production, this would validate JWT tokens
  
  req.user = {
    id: 'dev-user-123',
    email: 'dev@toneslyder.com',
    tier: 'premium'
  };
  
  next();
}
