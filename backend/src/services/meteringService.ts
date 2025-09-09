import { config } from '../config/environment';
import { logger } from '../config/logger';

// User tier limits and pricing
interface TierLimits {
  monthlyRewrites: number;
  monthlyBudgetUSD: number;
  modelAccess: string[];
  rateLimitPerHour: number;
}

interface UserUsage {
  userId: string;
  monthYear: string;  // "2024-01"
  rewritesCount: number;
  tokensUsed: number;
  costUSD: number;
  tier: 'free' | 'premium' | 'enterprise';
}

interface ModelPricing {
  inputTokenCost: number;   // Cost per 1K input tokens
  outputTokenCost: number;  // Cost per 1K output tokens
  tier: 'free' | 'premium' | 'enterprise';
}

class MeteringService {
  // Tier configurations
  private readonly TIER_LIMITS: Record<string, TierLimits> = {
    free: {
      monthlyRewrites: 100,
      monthlyBudgetUSD: 5,
      modelAccess: ['gpt-3.5-turbo'],
      rateLimitPerHour: 30
    },
    premium: {
      monthlyRewrites: 1000,
      monthlyBudgetUSD: 50,
      modelAccess: ['gpt-3.5-turbo', 'gpt-4', 'claude-3-haiku', 'claude-3-sonnet'],
      rateLimitPerHour: 300
    },
    enterprise: {
      monthlyRewrites: 10000,
      monthlyBudgetUSD: 500,
      modelAccess: ['gpt-3.5-turbo', 'gpt-4', 'claude-3-haiku', 'claude-3-sonnet', 'gpt-4-turbo'],
      rateLimitPerHour: 1000
    }
  };

  // Model pricing (per 1K tokens)
  private readonly MODEL_PRICING: Record<string, ModelPricing> = {
    'gpt-3.5-turbo': {
      inputTokenCost: 0.0015,
      outputTokenCost: 0.002,
      tier: 'free'
    },
    'gpt-4': {
      inputTokenCost: 0.03,
      outputTokenCost: 0.06,
      tier: 'premium'
    },
    'claude-3-haiku': {
      inputTokenCost: 0.00025,
      outputTokenCost: 0.00125,
      tier: 'premium'
    },
    'claude-3-sonnet': {
      inputTokenCost: 0.003,
      outputTokenCost: 0.015,
      tier: 'premium'
    }
  };

  // In-memory cache for recent usage (for performance)
  private usageCache: Map<string, UserUsage> = new Map();
  private lastCacheClean = Date.now();

  /**
   * Check if user can make a rewrite request
   */
  async checkQuota(userId: string, model: string, userTier?: string): Promise<{
    canProceed: boolean;
    reason?: string;
    usage?: UserUsage;
    limits?: TierLimits;
  }> {
    try {
      // Get user's current usage
      const usage = await this.getCurrentUsage(userId, userTier || 'free');
      const limits = this.TIER_LIMITS[usage.tier];

      // Check model access
      if (!limits.modelAccess.includes(model)) {
        return {
          canProceed: false,
          reason: `Model ${model} not available for ${usage.tier} tier. Please upgrade your plan.`,
          usage,
          limits
        };
      }

      // Check monthly rewrite limit
      if (usage.rewritesCount >= limits.monthlyRewrites) {
        return {
          canProceed: false,
          reason: `Monthly rewrite limit (${limits.monthlyRewrites}) exceeded. Please upgrade or wait for next month.`,
          usage,
          limits
        };
      }

      // Check monthly budget limit
      if (usage.costUSD >= limits.monthlyBudgetUSD) {
        return {
          canProceed: false,
          reason: `Monthly budget limit ($${limits.monthlyBudgetUSD}) exceeded. Please upgrade or wait for next month.`,
          usage,
          limits
        };
      }

      // Check if estimated cost would exceed budget
      const estimatedCost = this.estimateRequestCost(model, 2000); // Assume 2K tokens average
      if (usage.costUSD + estimatedCost > limits.monthlyBudgetUSD) {
        return {
          canProceed: false,
          reason: `Estimated cost would exceed monthly budget. Remaining budget: $${(limits.monthlyBudgetUSD - usage.costUSD).toFixed(2)}`,
          usage,
          limits
        };
      }

      return {
        canProceed: true,
        usage,
        limits
      };

    } catch (error) {
      logger.error('Error checking user quota', { userId, model, error });
      // On error, allow request for premium/enterprise, block for free
      return {
        canProceed: userTier !== 'free',
        reason: 'Unable to verify quota. Please try again.'
      };
    }
  }

  /**
   * Record usage after successful rewrite
   */
  async recordUsage(
    userId: string, 
    model: string, 
    tokensUsed: number,
    inputTokens?: number,
    outputTokens?: number
  ): Promise<void> {
    try {
      const cost = this.calculateCost(model, tokensUsed, inputTokens, outputTokens);
      const monthYear = this.getCurrentMonthYear();
      
      // Update in-memory cache
      const cacheKey = `${userId}-${monthYear}`;
      let usage = this.usageCache.get(cacheKey);
      
      if (!usage) {
        // Load from database if not in cache
        usage = await this.loadUsageFromDB(userId, monthYear);
      }

      usage.rewritesCount += 1;
      usage.tokensUsed += tokensUsed;
      usage.costUSD += cost;
      
      this.usageCache.set(cacheKey, usage);
      
      // Async update to database (don't wait)
      this.updateUsageInDB(usage).catch(error => {
        logger.error('Failed to update usage in database', { userId, error });
      });
      
      logger.info('Usage recorded', {
        userId,
        model,
        tokensUsed,
        cost: cost.toFixed(4),
        monthlyTotal: usage.rewritesCount
      });
      
    } catch (error) {
      logger.error('Error recording usage', { userId, model, tokensUsed, error });
      // Don't throw - usage recording failures shouldn't break user requests
    }
  }

  /**
   * Get user's current usage statistics
   */
  async getUserUsage(userId: string, userTier: string = 'free'): Promise<{
    usage: UserUsage;
    limits: TierLimits;
    utilization: {
      rewritesPercent: number;
      budgetPercent: number;
      daysLeftInMonth: number;
    };
  }> {
    const usage = await this.getCurrentUsage(userId, userTier);
    const limits = this.TIER_LIMITS[usage.tier];
    
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysLeftInMonth = daysInMonth - now.getDate();
    
    return {
      usage,
      limits,
      utilization: {
        rewritesPercent: Math.round((usage.rewritesCount / limits.monthlyRewrites) * 100),
        budgetPercent: Math.round((usage.costUSD / limits.monthlyBudgetUSD) * 100),
        daysLeftInMonth
      }
    };
  }

  /**
   * Estimate cost for a request
   */
  estimateRequestCost(model: string, estimatedTokens: number): number {
    const pricing = this.MODEL_PRICING[model];
    if (!pricing) return 0;
    
    // Rough estimate: 60% input, 40% output tokens
    const inputTokens = Math.round(estimatedTokens * 0.6);
    const outputTokens = Math.round(estimatedTokens * 0.4);
    
    return (
      (inputTokens / 1000) * pricing.inputTokenCost +
      (outputTokens / 1000) * pricing.outputTokenCost
    );
  }

  /**
   * Calculate actual cost based on token usage
   */
  private calculateCost(
    model: string, 
    totalTokens: number, 
    inputTokens?: number, 
    outputTokens?: number
  ): number {
    const pricing = this.MODEL_PRICING[model];
    if (!pricing) return 0;

    if (inputTokens && outputTokens) {
      // Exact calculation if we have input/output breakdown
      return (
        (inputTokens / 1000) * pricing.inputTokenCost +
        (outputTokens / 1000) * pricing.outputTokenCost
      );
    } else {
      // Estimate based on total tokens (assume 60/40 split)
      const estimatedInput = Math.round(totalTokens * 0.6);
      const estimatedOutput = Math.round(totalTokens * 0.4);
      return (
        (estimatedInput / 1000) * pricing.inputTokenCost +
        (estimatedOutput / 1000) * pricing.outputTokenCost
      );
    }
  }

  /**
   * Get current usage from cache or database
   */
  private async getCurrentUsage(userId: string, userTier: string): Promise<UserUsage> {
    const monthYear = this.getCurrentMonthYear();
    const cacheKey = `${userId}-${monthYear}`;
    
    // Clean cache periodically
    if (Date.now() - this.lastCacheClean > 3600000) { // 1 hour
      this.cleanCache();
    }
    
    let usage = this.usageCache.get(cacheKey);
    if (!usage) {
      usage = await this.loadUsageFromDB(userId, monthYear);
      usage.tier = userTier as 'free' | 'premium' | 'enterprise';
      this.usageCache.set(cacheKey, usage);
    }
    
    return usage;
  }

  /**
   * Load usage from database (placeholder - in production, use actual DB)
   */
  private async loadUsageFromDB(userId: string, monthYear: string): Promise<UserUsage> {
    // TODO: Implement actual database query
    // SELECT * FROM user_usage WHERE user_id = $1 AND month_year = $2
    
    return {
      userId,
      monthYear,
      rewritesCount: 0,
      tokensUsed: 0,
      costUSD: 0,
      tier: 'free'
    };
  }

  /**
   * Update usage in database (placeholder - in production, use actual DB)
   */
  private async updateUsageInDB(usage: UserUsage): Promise<void> {
    // TODO: Implement actual database update
    // INSERT INTO user_usage (...) VALUES (...) 
    // ON CONFLICT (user_id, month_year) DO UPDATE SET ...
    
    logger.debug('Usage would be saved to DB', usage);
  }

  /**
   * Get current month-year string
   */
  private getCurrentMonthYear(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  /**
   * Clean old entries from cache
   */
  private cleanCache(): void {
    const currentMonthYear = this.getCurrentMonthYear();
    
    for (const [key, usage] of this.usageCache.entries()) {
      if (usage.monthYear !== currentMonthYear) {
        this.usageCache.delete(key);
      }
    }
    
    this.lastCacheClean = Date.now();
    logger.debug(`Cache cleaned, ${this.usageCache.size} entries remaining`);
  }
}

export const meteringService = new MeteringService();
