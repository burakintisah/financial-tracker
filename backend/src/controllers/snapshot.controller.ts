/**
 * Snapshot Controller
 * Handles snapshot-related HTTP requests
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import {
  getSnapshotsByUserId,
  getSnapshotById,
  createSnapshot,
  deleteSnapshot,
  getAccountsByUserId,
  createAccount,
} from '../services/snapshot.service';

// Validation schemas
const createSnapshotSchema = z.object({
  snapshot_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  notes: z.string().optional(),
  account_balances: z
    .array(
      z.object({
        account_id: z.string().uuid(),
        amount_try: z.number().optional(),
        amount_usd: z.number().optional(),
        amount_eur: z.number().optional(),
        amount_gbp: z.number().optional(),
      })
    )
    .optional()
    .default([]),
  gold_holdings: z
    .array(
      z.object({
        gold_type: z.enum(['gram', 'quarter', 'half', 'full', 'republic', 'other']),
        quantity: z.number(),
        weight_grams: z.number(),
      })
    )
    .optional()
    .default([]),
  investments: z
    .array(
      z.object({
        investment_type: z.enum(['fund', 'bist', 'nasdaq', 'crypto', 'pension', 'other']),
        name: z.string(),
        ticker: z.string().optional(),
        principal: z.number().optional(),
        current_value: z.number().optional(),
        pnl: z.number().optional(),
        currency: z.enum(['TRY', 'USD', 'EUR', 'GBP']).optional(),
      })
    )
    .optional()
    .default([]),
});

const createAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  type: z.enum(['bank', 'brokerage', 'crypto', 'pension', 'other']),
  institution: z.string().optional(),
});

/**
 * GET /api/snapshots
 * Get all snapshots for current user
 */
export const listSnapshots = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const snapshots = await getSnapshotsByUserId(req.user.id);

    res.json({
      success: true,
      data: snapshots,
    });
  } catch (error) {
    console.error('[Snapshot Controller] Error listing snapshots:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch snapshots',
    });
  }
};

/**
 * GET /api/snapshots/:id
 * Get single snapshot with full details
 */
export const getSnapshot = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const snapshot = await getSnapshotById(id, req.user.id);

    if (!snapshot) {
      res.status(404).json({
        success: false,
        error: 'Snapshot not found',
      });
      return;
    }

    res.json({
      success: true,
      data: snapshot,
    });
  } catch (error) {
    console.error('[Snapshot Controller] Error getting snapshot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch snapshot',
    });
  }
};

/**
 * POST /api/snapshots
 * Create a new snapshot
 */
export const createNewSnapshot = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const validation = createSnapshotSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
      return;
    }

    const snapshot = await createSnapshot(req.user.id, validation.data);

    if (!snapshot) {
      res.status(500).json({
        success: false,
        error: 'Failed to create snapshot',
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: snapshot,
    });
  } catch (error) {
    console.error('[Snapshot Controller] Error creating snapshot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create snapshot',
    });
  }
};

/**
 * DELETE /api/snapshots/:id
 * Delete a snapshot
 */
export const removeSnapshot = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const { id } = req.params;

    const success = await deleteSnapshot(id, req.user.id);

    if (!success) {
      res.status(404).json({
        success: false,
        error: 'Snapshot not found or could not be deleted',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Snapshot deleted successfully',
    });
  } catch (error) {
    console.error('[Snapshot Controller] Error deleting snapshot:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete snapshot',
    });
  }
};

/**
 * GET /api/accounts
 * Get all accounts for current user
 */
export const listAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const accounts = await getAccountsByUserId(req.user.id);

    res.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error('[Snapshot Controller] Error listing accounts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch accounts',
    });
  }
};

/**
 * POST /api/accounts
 * Create a new account
 */
export const createNewAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const validation = createAccountSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: validation.error.errors[0].message,
      });
      return;
    }

    const account = await createAccount(
      req.user.id,
      validation.data.name,
      validation.data.type,
      validation.data.institution
    );

    if (!account) {
      res.status(500).json({
        success: false,
        error: 'Failed to create account',
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error('[Snapshot Controller] Error creating account:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create account',
    });
  }
};
