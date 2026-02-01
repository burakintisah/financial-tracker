/**
 * Analysis Routes
 * API routes for stock analysis endpoints
 */

import { Router } from 'express';
import {
  getAnalysis,
  getTrendingStocks,
  getBulkAnalysis,
  testAnalysis,
  getAnalysisHealth,
} from '../controllers/analysis.controller';
import { analysisRateLimiter, strictRateLimiter } from '../middleware/rate-limit.middleware';

const router = Router();

// Health check endpoint (no rate limiting)
router.get('/health/analysis', getAnalysisHealth);

// Test endpoint (strict rate limiting)
router.get('/analysis/test', strictRateLimiter, testAnalysis);

// Get trending stocks (standard rate limiting)
router.get('/analysis/trending/:market', analysisRateLimiter, getTrendingStocks);

// Bulk analysis (strict rate limiting)
router.post('/analysis/bulk', strictRateLimiter, getBulkAnalysis);

// Single stock analysis (strict rate limiting for AI calls)
router.get('/analysis/:market/:ticker/:timeframe', strictRateLimiter, getAnalysis);

export default router;
