/**
 * Snapshot Routes
 */

import { Router } from 'express';
import {
  listSnapshots,
  getSnapshot,
  createNewSnapshot,
  removeSnapshot,
  listAccounts,
  createNewAccount,
} from '../controllers/snapshot.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.use(authMiddleware);

// Snapshot routes
router.get('/snapshots', listSnapshots);
router.get('/snapshots/:id', getSnapshot);
router.post('/snapshots', createNewSnapshot);
router.delete('/snapshots/:id', removeSnapshot);

// Account routes
router.get('/accounts', listAccounts);
router.post('/accounts', createNewAccount);

export default router;
