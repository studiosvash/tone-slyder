import { Router, Request, Response } from 'express';
import { authenticateUser } from '../middleware/auth';
import { logger } from '../config/logger';
import Joi from 'joi';

export const preferencesRouter = Router();

// In-memory preferences storage (in production, use database)
const userPreferences = new Map<string, any>();

// Validation schema for preferences
const preferencesSchema = Joi.object({
  preferredModel: Joi.string().valid('gpt-3.5-turbo', 'gpt-4', 'claude-3-haiku', 'claude-3-sonnet').optional(),
  autoSaveEnabled: Joi.boolean().optional(),
  showTips: Joi.boolean().optional(),
  defaultSliderValues: Joi.object({
    formality: Joi.number().min(10).max(90).optional(),
    conversational: Joi.number().min(10).max(90).optional(),
    informativeness: Joi.number().min(10).max(90).optional(),
    authoritativeness: Joi.number().min(10).max(90).optional()
  }).optional(),
  favoritePresets: Joi.array().items(Joi.string()).optional(),
  theme: Joi.string().valid('light', 'dark', 'auto').optional(),
  notificationSettings: Joi.object({
    quotaWarnings: Joi.boolean().optional(),
    newFeatures: Joi.boolean().optional(),
    usageSummary: Joi.boolean().optional()
  }).optional()
});

/**
 * GET /api/preferences
 * Get user's preferences
 */
preferencesRouter.get('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'unauthorized',
        message: 'User authentication required'
      });
    }

    // Get preferences from storage (in production, query database)
    const preferences = userPreferences.get(userId) || {
      preferredModel: 'gpt-3.5-turbo',
      autoSaveEnabled: true,
      showTips: true,
      defaultSliderValues: {
        formality: 50,
        conversational: 50,
        informativeness: 50,
        authoritativeness: 50
      },
      favoritePresets: [],
      theme: 'light',
      notificationSettings: {
        quotaWarnings: true,
        newFeatures: false,
        usageSummary: true
      }
    };

    res.json({
      success: true,
      data: preferences
    });

  } catch (error: any) {
    logger.error('Error fetching user preferences', {
      userId: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'preferences_fetch_failed',
      message: 'Unable to fetch preferences. Please try again.'
    });
  }
});

/**
 * PUT /api/preferences
 * Update user's preferences
 */
preferencesRouter.put('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'unauthorized',
        message: 'User authentication required'
      });
    }

    // Validate request body
    const { error, value } = preferencesSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'validation_error',
        message: error.details[0].message
      });
    }

    // Get existing preferences
    const existingPreferences = userPreferences.get(userId) || {};
    
    // Merge with new preferences
    const updatedPreferences = {
      ...existingPreferences,
      ...value,
      updatedAt: new Date().toISOString()
    };

    // Save preferences (in production, update database)
    userPreferences.set(userId, updatedPreferences);

    logger.info('User preferences updated', {
      userId,
      updatedFields: Object.keys(value)
    });

    res.json({
      success: true,
      data: updatedPreferences,
      message: 'Preferences updated successfully'
    });

  } catch (error: any) {
    logger.error('Error updating user preferences', {
      userId: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'preferences_update_failed',
      message: 'Unable to update preferences. Please try again.'
    });
  }
});

/**
 * PATCH /api/preferences/:key
 * Update a specific preference key
 */
preferencesRouter.patch('/:key', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const key = req.params.key;
    const value = req.body.value;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'unauthorized',
        message: 'User authentication required'
      });
    }

    // Validate the specific key update
    const singleKeySchema = Joi.object({
      [key]: preferencesSchema.describe().keys[key] || Joi.any()
    });

    const { error } = singleKeySchema.validate({ [key]: value });
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'validation_error',
        message: `Invalid value for ${key}: ${error.details[0].message}`
      });
    }

    // Get existing preferences
    const existingPreferences = userPreferences.get(userId) || {};
    
    // Update specific key
    const updatedPreferences = {
      ...existingPreferences,
      [key]: value,
      updatedAt: new Date().toISOString()
    };

    // Save preferences
    userPreferences.set(userId, updatedPreferences);

    logger.info('User preference updated', {
      userId,
      key,
      value: typeof value === 'object' ? JSON.stringify(value) : value
    });

    res.json({
      success: true,
      data: { [key]: value },
      message: `Preference '${key}' updated successfully`
    });

  } catch (error: any) {
    logger.error('Error updating user preference', {
      userId: req.user?.id,
      key: req.params.key,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'preference_update_failed',
      message: 'Unable to update preference. Please try again.'
    });
  }
});

/**
 * DELETE /api/preferences
 * Reset user preferences to defaults
 */
preferencesRouter.delete('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'unauthorized',
        message: 'User authentication required'
      });
    }

    // Remove preferences (reset to defaults)
    userPreferences.delete(userId);

    logger.info('User preferences reset to defaults', { userId });

    res.json({
      success: true,
      message: 'Preferences reset to defaults'
    });

  } catch (error: any) {
    logger.error('Error resetting user preferences', {
      userId: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'preferences_reset_failed',
      message: 'Unable to reset preferences. Please try again.'
    });
  }
});
