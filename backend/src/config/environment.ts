import dotenv from 'dotenv';
import { logger } from './logger';

// Load environment variables
dotenv.config();

interface Config {
  env: string;
  port: number;
  database: {
    url: string;
  };
  redis: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  cors: {
    origins: string[];
  };
  rateLimiting: {
    maxRequests: number;
    windowMs: number;
  };
  logging: {
    level: string;
  };
  cache: {
    ttlSeconds: number;
  };
  costControl: {
    freeTierMonthlyRewrites: number;
    freeTierMonthlyBudgetUsd: number;
  };
  models: {
    default: string;
    temperature: number;
    maxTokens: number;
  };
  llm: {
    openai: {
      apiKey: string;
    };
    anthropic: {
      apiKey: string;
    };
  };
}

function validateConfig(): Config {
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'JWT_SECRET'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate API keys in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      throw new Error('At least one LLM API key (OPENAI_API_KEY or ANTHROPIC_API_KEY) is required in production');
    }
  }

  return {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    
    database: {
      url: process.env.DATABASE_URL || 'postgresql://localhost:5432/tone_slyder'
    },
    
    redis: {
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    },
    
    cors: {
      origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173']
    },
    
    rateLimiting: {
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10)
    },
    
    logging: {
      level: process.env.LOG_LEVEL || 'info'
    },
    
    cache: {
      ttlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '600', 10)
    },
    
    costControl: {
      freeTierMonthlyRewrites: parseInt(process.env.FREE_TIER_MONTHLY_REWRITES || '100', 10),
      freeTierMonthlyBudgetUsd: parseInt(process.env.FREE_TIER_MONTHLY_BUDGET_USD || '100', 10)
    },
    
    models: {
      default: process.env.DEFAULT_MODEL || 'gpt-3.5-turbo',
      temperature: parseFloat(process.env.DEFAULT_TEMPERATURE || '0.4'),
      maxTokens: parseInt(process.env.DEFAULT_MAX_TOKENS || '2000', 10)
    },
    
    llm: {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || ''
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || ''
      }
    }
  };
}

export const config = validateConfig();

// Log configuration in development
if (config.env === 'development') {
  logger.info('Configuration loaded', {
    env: config.env,
    port: config.port,
    corsOrigins: config.cors.origins,
    hasOpenAI: !!config.llm.openai.apiKey,
    hasAnthropic: !!config.llm.anthropic.apiKey,
    defaultModel: config.models.default
  });
}
