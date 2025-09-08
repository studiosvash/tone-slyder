import { Router, Request, Response } from 'express';
import { RewriteRequest, RewriteResponse, ApiResponse } from '@tone-slyder/shared/types';
import { rewriteEngine } from '../core/rewriteEngine';
import { llmService } from '../services/llmService';
import { cacheService } from '../services/cacheService';
import { meteringService } from '../services/meteringService';
import { validateRequest } from '../middleware/validation';
import { authenticateUser } from '../middleware/auth';
import { logger } from '../config/logger';
import Joi from 'joi';

export const rewriteRouter = Router();

// Validation schema for rewrite requests
const rewriteRequestSchema = Joi.object({
  originalText: Joi.string().min(1).max(10000).required(),
  sliderValues: Joi.object().pattern(
    Joi.string(),
    Joi.number().min(10).max(90)
  ).required(),
  guardrails: Joi.object({
    required: Joi.array().items(Joi.string()).default([]),
    banned: Joi.array().items(Joi.string()).default([])
  }).default({ required: [], banned: [] }),
  model: Joi.string().valid('gpt-3.5-turbo', 'gpt-4', 'claude-3-sonnet', 'claude-3-haiku').default('gpt-3.5-turbo'),
  userId: Joi.string().optional()
});

/**
 * POST /api/rewrite
 * Main rewriting endpoint
 */
rewriteRouter.post('/', 
  validateRequest(rewriteRequestSchema),
  authenticateUser,
  async (req: Request, res: Response) => {
    const startTime = Date.now();
    const requestData: RewriteRequest = req.body;

    try {
      // Set user ID from auth middleware
      requestData.userId = req.user?.id;

      logger.info('Rewrite request received', {
        userId: requestData.userId,
        textLength: requestData.originalText.length,
        sliderCount: Object.keys(requestData.sliderValues).length,
        model: requestData.model
      });

      // Process request through rewrite engine
      const { prompt, conflicts, cacheKey } = await rewriteEngine.processRequest(requestData);

      // Check cache first (Phase 2: Cost Control)
      const cachedResult = await cacheService.get(cacheKey);
      if (cachedResult) {
        logger.info('Cache hit for rewrite request', { cacheKey, userId: requestData.userId });
        
        const response: ApiResponse<RewriteResponse> = {
          success: true,
          data: {
            ...cachedResult,
            processingTime: Date.now() - startTime
          }
        };
        
        return res.json(response);
      }

      // Check user's remaining quota
      const canProceed = await meteringService.checkQuota(
        requestData.userId || 'anonymous',
        requestData.model || 'gpt-3.5-turbo'
      );

      if (!canProceed) {
        return res.status(429).json({
          success: false,
          error: 'quota_exceeded',
          message: 'Monthly rewrite quota exceeded. Please upgrade your plan or wait for next month.'
        });
      }

      // Call LLM service
      const llmResponse = await llmService.rewrite(prompt, requestData.model || 'gpt-3.5-turbo');
      
      // Validate output against guardrails
      const violations = rewriteEngine.validateOutput(
        requestData.originalText,
        llmResponse.text,
        requestData.guardrails
      );

      // If there are violations, try once more with stricter prompt
      let finalText = llmResponse.text;
      if (violations.length > 0) {
        logger.warn('Guardrail violations detected, retrying with stricter prompt', { violations });
        
        const stricterPrompt = prompt + '\\n\\nIMPORTANT: Pay special attention to the guardrails above. Ensure ALL required words remain unchanged and NO banned words appear in the output.';
        const retryResponse = await llmService.rewrite(stricterPrompt, requestData.model || 'gpt-3.5-turbo');
        
        const retryViolations = rewriteEngine.validateOutput(
          requestData.originalText,
          retryResponse.text,
          requestData.guardrails
        );
        
        if (retryViolations.length < violations.length) {
          finalText = retryResponse.text;
        }
      }

      // Calculate metrics
      const metrics = rewriteEngine.calculateMetrics(requestData, finalText, Date.now() - startTime);

      // Record usage
      await meteringService.recordUsage(
        requestData.userId || 'anonymous',
        requestData.model || 'gpt-3.5-turbo',
        llmResponse.tokensUsed
      );

      // Prepare response
      const responseData: RewriteResponse = {
        rewrittenText: finalText,
        originalText: requestData.originalText,
        model: requestData.model || 'gpt-3.5-turbo',
        processingTime: metrics.processingTime,
        tokensUsed: llmResponse.tokensUsed,
        guardrailViolations: violations.length > 0 ? violations : undefined
      };

      // Cache the result (10 minute TTL)
      await cacheService.set(cacheKey, responseData, 600);

      logger.info('Rewrite completed successfully', {
        userId: requestData.userId,
        processingTime: metrics.processingTime,
        tokensUsed: llmResponse.tokensUsed,
        wordChangeRatio: metrics.wordChangeRatio,
        violations: violations.length
      });

      const response: ApiResponse<RewriteResponse> = {
        success: true,
        data: responseData
      };

      res.json(response);

    } catch (error) {
      logger.error('Error processing rewrite request', {
        error: error.message,
        stack: error.stack,
        userId: requestData.userId,
        requestData
      });

      const response: ApiResponse = {
        success: false,
        error: 'rewrite_failed',
        message: 'Failed to process rewrite request. Please try again.'
      };

      res.status(500).json(response);
    }
  }
);

/**
 * POST /api/rewrite/batch
 * Batch rewriting endpoint for multiple texts
 */
rewriteRouter.post('/batch',
  authenticateUser,
  async (req: Request, res: Response) => {
    const { texts, ...commonParams } = req.body;
    
    if (!Array.isArray(texts) || texts.length === 0 || texts.length > 10) {
      return res.status(400).json({
        success: false,
        error: 'invalid_batch_size',
        message: 'Batch size must be between 1 and 10 texts'
      });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < texts.length; i++) {
      try {
        const requestData: RewriteRequest = {
          originalText: texts[i],
          ...commonParams,
          userId: req.user?.id
        };

        const { prompt, cacheKey } = await rewriteEngine.processRequest(requestData);
        
        // Check cache
        let result = await cacheService.get(cacheKey);
        
        if (!result) {
          const llmResponse = await llmService.rewrite(prompt, requestData.model || 'gpt-3.5-turbo');
          
          result = {
            rewrittenText: llmResponse.text,
            originalText: requestData.originalText,
            model: requestData.model || 'gpt-3.5-turbo',
            processingTime: 0,
            tokensUsed: llmResponse.tokensUsed
          };
          
          await cacheService.set(cacheKey, result, 600);
          
          await meteringService.recordUsage(
            requestData.userId || 'anonymous',
            requestData.model || 'gpt-3.5-turbo',
            llmResponse.tokensUsed
          );
        }

        results.push(result);
        
      } catch (error) {
        errors.push({
          index: i,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        results,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  }
);

/**
 * GET /api/rewrite/models
 * Get available models and their capabilities
 */
rewriteRouter.get('/models', (req: Request, res: Response) => {
  const models = [
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'openai',
      tier: 'free',
      maxTokens: 4096,
      costPerToken: 0.0015,
      description: 'Fast and efficient model for general tone adjustments'
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'openai',
      tier: 'premium',
      maxTokens: 8192,
      costPerToken: 0.03,
      description: 'Advanced model with superior understanding and nuanced tone control'
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'anthropic',
      tier: 'premium',
      maxTokens: 4096,
      costPerToken: 0.002,
      description: 'Fast and efficient Claude model with good tone understanding'
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'anthropic',
      tier: 'premium',
      maxTokens: 8192,
      costPerToken: 0.015,
      description: 'Balanced Claude model with excellent tone control and creativity'
    }
  ];

  res.json({
    success: true,
    data: models
  });
});
