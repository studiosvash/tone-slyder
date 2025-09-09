import { Router, Request, Response } from 'express';
import { meteringService } from '../services/meteringService';
import { authenticateUser } from '../middleware/auth';
import { logger } from '../config/logger';

export const usageRouter = Router();

/**
 * GET /api/usage
 * Get current user's usage statistics and limits
 */
usageRouter.get('/', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userTier = req.user?.tier || 'free';

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'unauthorized',
        message: 'User authentication required'
      });
    }

    const usageStats = await meteringService.getUserUsage(userId, userTier);

    res.json({
      success: true,
      data: {
        currentUsage: {
          rewrites: usageStats.usage.rewritesCount,
          tokens: usageStats.usage.tokensUsed,
          cost: usageStats.usage.costUSD,
          monthYear: usageStats.usage.monthYear
        },
        limits: {
          monthlyRewrites: usageStats.limits.monthlyRewrites,
          monthlyBudgetUSD: usageStats.limits.monthlyBudgetUSD,
          rateLimitPerHour: usageStats.limits.rateLimitPerHour,
          modelAccess: usageStats.limits.modelAccess
        },
        utilization: usageStats.utilization,
        tier: usageStats.usage.tier,
        status: {
          canMakeRequests: usageStats.utilization.rewritesPercent < 100 && 
                          usageStats.utilization.budgetPercent < 100,
          warningThresholds: {
            approaching80Percent: usageStats.utilization.rewritesPercent >= 80 || 
                                usageStats.utilization.budgetPercent >= 80,
            approaching95Percent: usageStats.utilization.rewritesPercent >= 95 || 
                                usageStats.utilization.budgetPercent >= 95
          }
        }
      }
    });

  } catch (error: any) {
    logger.error('Error fetching user usage', {
      userId: req.user?.id,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      success: false,
      error: 'usage_fetch_failed',
      message: 'Unable to fetch usage statistics. Please try again.'
    });
  }
});

/**
 * GET /api/usage/estimate
 * Estimate cost for a potential request
 */
usageRouter.post('/estimate', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { model = 'gpt-3.5-turbo', textLength } = req.body;
    
    // Rough estimation: ~4 characters per token, plus overhead
    const estimatedTokens = Math.ceil((textLength || 1000) / 4 * 1.3);
    
    const estimatedCost = meteringService.estimateRequestCost(model, estimatedTokens);
    
    res.json({
      success: true,
      data: {
        model,
        estimatedTokens,
        estimatedCost: parseFloat(estimatedCost.toFixed(4)),
        textLength: textLength || 1000
      }
    });

  } catch (error: any) {
    logger.error('Error estimating request cost', {
      userId: req.user?.id,
      error: error.message,
      body: req.body
    });

    res.status(500).json({
      success: false,
      error: 'estimation_failed', 
      message: 'Unable to estimate request cost. Please try again.'
    });
  }
});

/**
 * GET /api/usage/models
 * Get available models and pricing for user's tier
 */
usageRouter.get('/models', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userTier = req.user?.tier || 'free';
    
    // Get tier limits to determine model access
    const quotaCheck = await meteringService.checkQuota(
      req.user?.id || 'anonymous', 
      'gpt-3.5-turbo',
      userTier
    );
    
    if (!quotaCheck.limits) {
      throw new Error('Unable to determine user limits');
    }

    const modelPricing = [
      {
        id: 'gpt-3.5-turbo',
        name: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        tier: 'free',
        available: quotaCheck.limits.modelAccess.includes('gpt-3.5-turbo'),
        pricing: {
          inputPer1k: 0.0015,
          outputPer1k: 0.002
        },
        features: ['Fast', 'Cost-effective', 'Good quality']
      },
      {
        id: 'gpt-4',
        name: 'GPT-4',
        provider: 'OpenAI',
        tier: 'premium',
        available: quotaCheck.limits.modelAccess.includes('gpt-4'),
        pricing: {
          inputPer1k: 0.03,
          outputPer1k: 0.06
        },
        features: ['High quality', 'Better reasoning', 'More accurate']
      },
      {
        id: 'claude-3-haiku',
        name: 'Claude 3 Haiku',
        provider: 'Anthropic',
        tier: 'premium',
        available: quotaCheck.limits.modelAccess.includes('claude-3-haiku'),
        pricing: {
          inputPer1k: 0.00025,
          outputPer1k: 0.00125
        },
        features: ['Very fast', 'Ultra cost-effective', 'Good for simple tasks']
      },
      {
        id: 'claude-3-sonnet',
        name: 'Claude 3 Sonnet',
        provider: 'Anthropic', 
        tier: 'premium',
        available: quotaCheck.limits.modelAccess.includes('claude-3-sonnet'),
        pricing: {
          inputPer1k: 0.003,
          outputPer1k: 0.015
        },
        features: ['Balanced performance', 'Creative writing', 'Nuanced understanding']
      }
    ];

    res.json({
      success: true,
      data: {
        models: modelPricing,
        userTier,
        availableModels: modelPricing.filter(m => m.available).length,
        totalModels: modelPricing.length
      }
    });

  } catch (error: any) {
    logger.error('Error fetching model pricing', {
      userId: req.user?.id,
      error: error.message
    });

    res.status(500).json({
      success: false,
      error: 'models_fetch_failed',
      message: 'Unable to fetch model information. Please try again.'
    });
  }
});
