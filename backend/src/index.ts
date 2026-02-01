import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import { env } from './config/env';
import analysisRoutes from './routes/analysis.routes';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS middleware
app.use(cors({
  origin: env.ALLOWED_ORIGINS,
  credentials: true
}));

// Body parser middleware
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// Analysis routes
app.use('/api', analysisRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server] Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
});

// Start server for local development
if (env.NODE_ENV !== 'production') {
  app.listen(env.PORT, () => {
    console.log(`Server running on http://localhost:${env.PORT}`);
    console.log('Environment:', env.NODE_ENV);
    console.log('CORS allowed origins:', env.ALLOWED_ORIGINS.join(', '));
  });
}

export default app;
