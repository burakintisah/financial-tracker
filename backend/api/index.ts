import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Catch all for /api routes
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

export default app;
