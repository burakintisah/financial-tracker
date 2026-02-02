/**
 * Import Controller
 * Handles Excel import HTTP requests
 */

import { Request, Response } from 'express';
import { importProjectExcel, importExcelBuffer } from '../services/import.service';

/**
 * POST /api/import/project-excel
 * Import Excel file from project directory
 */
export const importFromProject = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const filePath = req.body.file_path as string | undefined;
    const result = await importProjectExcel(req.user.id, filePath);

    if (!result.success && result.imported === 0) {
      res.status(400).json({
        success: false,
        error: result.errors[0] || 'No data was imported',
        details: result,
      });
      return;
    }

    res.json({
      success: true,
      message: `Successfully imported ${result.imported} snapshots`,
      data: {
        imported: result.imported,
        failed: result.failed,
        errors: result.errors,
      },
    });
  } catch (error) {
    console.error('[Import Controller] Error importing project Excel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import Excel file',
    });
  }
};

/**
 * POST /api/import/upload
 * Import uploaded Excel file
 */
export const importUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    // Check for file in request
    // Note: This requires multer or similar middleware for file uploads
    const file = (req as any).file;
    if (!file) {
      res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
      return;
    }

    const result = await importExcelBuffer(req.user.id, file.buffer);

    if (!result.success && result.imported === 0) {
      res.status(400).json({
        success: false,
        error: result.errors[0] || 'No data was imported',
        details: result,
      });
      return;
    }

    res.json({
      success: true,
      message: `Successfully imported ${result.imported} snapshots`,
      data: {
        imported: result.imported,
        failed: result.failed,
        errors: result.errors,
      },
    });
  } catch (error) {
    console.error('[Import Controller] Error importing uploaded Excel:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import Excel file',
    });
  }
};
