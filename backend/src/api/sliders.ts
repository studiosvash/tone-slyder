import { Router, Request, Response } from 'express';
import { CORE_SLIDERS } from '@tone-slyder/shared/types';

export const slidersRouter = Router();

// GET /api/sliders - Get all core sliders
slidersRouter.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      core: CORE_SLIDERS,
      custom: [] // No custom sliders in basic implementation
    }
  });
});

// GET /api/sliders/core - Get core sliders only
slidersRouter.get('/core', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: CORE_SLIDERS
  });
});
