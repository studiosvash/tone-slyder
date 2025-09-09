import { Router, Request, Response } from 'express';
import { DEFAULT_PRESETS } from '@tone-slyder/shared/types';

export const presetsRouter = Router();

// GET /api/presets - Get all available presets
presetsRouter.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: DEFAULT_PRESETS
  });
});

// GET /api/presets/:id - Get a specific preset
presetsRouter.get('/:id', (req: Request, res: Response) => {
  const preset = DEFAULT_PRESETS.find(p => p.id === req.params.id);
  
  if (!preset) {
    return res.status(404).json({
      success: false,
      error: 'preset_not_found',
      message: 'Preset not found'
    });
  }
  
  res.json({
    success: true,
    data: preset
  });
});
