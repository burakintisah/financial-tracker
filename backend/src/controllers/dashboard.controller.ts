/**
 * Dashboard Controller
 * Handles dashboard-related HTTP requests
 */

import { Request, Response } from 'express';
import {
  getDashboardSummary,
  getTimeline,
  getAssetDistribution,
} from '../services/dashboard.service';

/**
 * GET /api/dashboard/summary
 * Get dashboard summary with latest stats
 */
export const getSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const summary = await getDashboardSummary(req.user.id);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('[Dashboard Controller] Error getting summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard summary',
    });
  }
};

/**
 * GET /api/dashboard/timeline
 * Get net worth timeline for charts
 */
export const getTimelineData = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const months = parseInt(req.query.months as string) || 12;
    const timeline = await getTimeline(req.user.id, months);

    res.json({
      success: true,
      data: timeline,
    });
  } catch (error) {
    console.error('[Dashboard Controller] Error getting timeline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timeline data',
    });
  }
};

/**
 * GET /api/dashboard/distribution
 * Get asset distribution for pie chart
 */
export const getDistribution = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const distribution = await getAssetDistribution(req.user.id);

    res.json({
      success: true,
      data: distribution,
    });
  } catch (error) {
    console.error('[Dashboard Controller] Error getting distribution:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch asset distribution',
    });
  }
};
