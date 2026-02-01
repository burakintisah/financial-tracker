/**
 * Authentication Controller
 * Handles auth-related HTTP requests
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { verifyGoogleToken, createOrUpdateUser, findUserById } from '../services/auth.service';
import { generateToken } from '../middleware/auth.middleware';

// Validation schemas
const googleLoginSchema = z.object({
  credential: z.string().min(1, 'Google credential is required'),
});

/**
 * POST /api/auth/google
 * Authenticate user with Google ID token
 */
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validation = googleLoginSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
      return;
    }

    const { credential } = validation.data;

    // Verify Google token
    const googlePayload = await verifyGoogleToken(credential);
    if (!googlePayload) {
      res.status(401).json({
        success: false,
        error: 'Invalid Google token',
      });
      return;
    }

    // Check if email is verified
    if (!googlePayload.email_verified) {
      res.status(401).json({
        success: false,
        error: 'Email not verified with Google',
      });
      return;
    }

    // Create or update user
    const user = await createOrUpdateUser(googlePayload);
    if (!user) {
      res.status(500).json({
        success: false,
        error: 'Failed to create or update user',
      });
      return;
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
      },
      token,
    });
  } catch (error) {
    console.error('[Auth Controller] Google login error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed',
    });
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
      return;
    }

    const user = await findUserById(req.user.id);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
      },
    });
  } catch (error) {
    console.error('[Auth Controller] Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user',
    });
  }
};

/**
 * POST /api/auth/logout
 * Logout user (client-side token removal)
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  // JWT is stateless, so logout is handled client-side
  // This endpoint exists for consistency and future session invalidation
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};
