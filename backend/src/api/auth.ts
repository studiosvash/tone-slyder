import { Router, Request, Response } from 'express';

export const authRouter = Router();

// POST /api/auth/login - Mock login for development
authRouter.post('/login', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      token: 'dev-token-123',
      user: {
        id: 'dev-user-123',
        email: 'dev@toneslyder.com',
        tier: 'premium'
      }
    },
    message: 'Development login successful'
  });
});

// POST /api/auth/register - Mock register for development  
authRouter.post('/register', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      token: 'dev-token-123',
      user: {
        id: 'dev-user-123',
        email: 'dev@toneslyder.com',
        tier: 'free'
      }
    },
    message: 'Development registration successful'
  });
});
