/**
 * Authentication Routes
 */

import { Router } from 'express';
import { googleLogin, getCurrentUser, logout } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/auth/google', googleLogin);

// Protected routes
router.get('/auth/me', authMiddleware, getCurrentUser);
router.post('/auth/logout', authMiddleware, logout);

export default router;
