import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/environment';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Import routes
import { rewriteRouter } from './api/rewrite';
import { presetsRouter } from './api/presets';
import { slidersRouter } from './api/sliders';
import { authRouter } from './api/auth';
import { usageRouter } from './api/usage';

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression and body parsing
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.rateLimiting.maxRequests,
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    environment: config.env,
  });
});

// API routes
app.use('/api/rewrite', rewriteRouter);
app.use('/api/presets', presetsRouter);
app.use('/api/sliders', slidersRouter);
app.use('/api/auth', authRouter);
app.use('/api/usage', usageRouter);

// API documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'Tone Slyder API',
    version: '0.1.0',
    description: 'AI-powered tone adjustment API',
    endpoints: {
      health: 'GET /health',
      rewrite: 'POST /api/rewrite',
      presets: 'GET|POST /api/presets',
      sliders: 'GET|POST /api/sliders',
      auth: 'POST /api/auth/login|register',
      usage: 'GET /api/usage',
    },
    documentation: 'https://docs.toneslyder.com/api',
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const port = config.port;
const server = app.listen(port, () => {
  logger.info(`🎚️ Tone Slyder API server running on port ${port}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`API URL: http://localhost:${port}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export default app;
