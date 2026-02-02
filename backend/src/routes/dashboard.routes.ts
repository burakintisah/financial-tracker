/**
 * Dashboard Routes
 */

import { Router } from 'express';
import { getSummary, getTimelineData, getDistribution } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authMiddleware);

router.get('/dashboard/summary', getSummary);
router.get('/dashboard/timeline', getTimelineData);
router.get('/dashboard/distribution', getDistribution);

export default router;
