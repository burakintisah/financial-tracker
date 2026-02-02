/**
 * Import Routes
 */

import { Router } from 'express';
import { importFromProject, importUpload } from '../controllers/import.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authMiddleware);

router.post('/import/project-excel', importFromProject);
router.post('/import/upload', importUpload);

export default router;
