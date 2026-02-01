/**
 * Import Service
 * Handles Excel file import and parsing
 */

import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { supabaseClient } from '../config/supabase';
import { calculateAndStoreTotals, createAccount } from './snapshot.service';

interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
}

interface ParsedRow {
  accountName: string;
  try_amount: number;
  usd_amount: number;
  eur_amount: number;
  gbp_amount: number;
  gold_grams: number;
  bes_amount: number;
}

// Account name mappings from Excel rows
const ACCOUNT_MAPPINGS: Record<number, { name: string; type: string }> = {
  0: { name: 'Yapikredi', type: 'bank' },
  1: { name: 'Anadolu Hayat', type: 'pension' },
  2: { name: 'Garanti', type: 'bank' },
  3: { name: 'IBKR', type: 'brokerage' },
  4: { name: 'Midas', type: 'brokerage' },
  5: { name: 'Nakit', type: 'other' },
};

/**
 * Parse date from sheet name (e.g., "092323" -> "2023-09-23")
 */
const parseSheetDate = (sheetName: string): string | null => {
  // Try MMDDYY format
  const match = sheetName.match(/^(\d{2})(\d{2})(\d{2})$/);
  if (match) {
    const [, month, day, year] = match;
    const fullYear = parseInt(year) > 50 ? `19${year}` : `20${year}`;
    return `${fullYear}-${month}-${day}`;
  }

  // Try other date formats
  const altMatch = sheetName.match(/(\d{1,2})[.\-\/](\d{1,2})[.\-\/](\d{2,4})/);
  if (altMatch) {
    const [, month, day, year] = altMatch;
    const fullYear = year.length === 2 ? (parseInt(year) > 50 ? `19${year}` : `20${year}`) : year;
    return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return null;
};

/**
 * Parse a numeric value from Excel cell
 */
const parseNumber = (value: any): number => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  // Remove currency symbols and thousands separators
  const cleaned = String(value)
    .replace(/[^\d.,-]/g, '')
    .replace(/,/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Parse a single worksheet
 */
const parseWorksheet = (worksheet: XLSX.WorkSheet): ParsedRow[] => {
  const rows: ParsedRow[] = [];

  // Convert to JSON with header row
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  // Skip if not enough data
  if (data.length < 2) {
    return rows;
  }

  // Find column indices by looking at header row
  const headerRow = data[0] || [];
  let tryCol = -1;
  let usdCol = -1;
  let eurCol = -1;
  let gbpCol = -1;
  let goldCol = -1;
  let besCol = -1;

  headerRow.forEach((cell, idx) => {
    const cellStr = String(cell || '').toLowerCase();
    if (cellStr.includes('try') || cellStr.includes('tl') || cellStr === 'nakit') {
      tryCol = idx;
    } else if (cellStr.includes('dolar') || cellStr.includes('usd') || cellStr === '$') {
      usdCol = idx;
    } else if (cellStr.includes('euro') || cellStr.includes('eur')) {
      eurCol = idx;
    } else if (cellStr.includes('pound') || cellStr.includes('gbp') || cellStr.includes('sterlin')) {
      gbpCol = idx;
    } else if (cellStr.includes('altin') || cellStr.includes('gold') || cellStr.includes('gram')) {
      goldCol = idx;
    } else if (cellStr.includes('bes') || cellStr.includes('emeklilik')) {
      besCol = idx;
    }
  });

  // If no headers found, use default column positions
  if (tryCol === -1) tryCol = 1;
  if (usdCol === -1) usdCol = 2;
  if (eurCol === -1) eurCol = 3;
  if (gbpCol === -1) gbpCol = 4;
  if (goldCol === -1) goldCol = 5;
  if (besCol === -1) besCol = 6;

  // Parse data rows (skip header)
  for (let i = 1; i < Math.min(data.length, 10); i++) {
    const row = data[i];
    if (!row || !row[0]) continue;

    const accountInfo = ACCOUNT_MAPPINGS[i - 1];
    if (!accountInfo) continue;

    rows.push({
      accountName: accountInfo.name,
      try_amount: parseNumber(row[tryCol]),
      usd_amount: parseNumber(row[usdCol]),
      eur_amount: parseNumber(row[eurCol]),
      gbp_amount: parseNumber(row[gbpCol]),
      gold_grams: parseNumber(row[goldCol]),
      bes_amount: parseNumber(row[besCol]),
    });
  }

  return rows;
};

/**
 * Import Excel file from project directory
 */
export const importProjectExcel = async (
  userId: string,
  filePath?: string
): Promise<ImportResult> => {
  const result: ImportResult = {
    success: false,
    imported: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Default file path
    const excelPath = filePath || '/mnt/project/Financial_Tracker_1.xlsx';

    // Check if file exists
    if (!fs.existsSync(excelPath)) {
      result.errors.push(`Excel file not found at ${excelPath}`);
      return result;
    }

    // Read the workbook
    const workbook = XLSX.readFile(excelPath);

    // Get or create user accounts
    const { data: existingAccounts } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', userId);

    const accountMap = new Map<string, string>();
    for (const account of existingAccounts || []) {
      accountMap.set(account.name.toLowerCase(), account.id);
    }

    // Create missing accounts
    for (const [, accountInfo] of Object.entries(ACCOUNT_MAPPINGS)) {
      const lowerName = accountInfo.name.toLowerCase();
      if (!accountMap.has(lowerName)) {
        const newAccount = await createAccount(userId, accountInfo.name, accountInfo.type);
        if (newAccount) {
          accountMap.set(lowerName, newAccount.id);
        }
      }
    }

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      const date = parseSheetDate(sheetName);
      if (!date) {
        result.errors.push(`Could not parse date from sheet: ${sheetName}`);
        result.failed++;
        continue;
      }

      const worksheet = workbook.Sheets[sheetName];
      const parsedRows = parseWorksheet(worksheet);

      if (parsedRows.length === 0) {
        result.errors.push(`No data found in sheet: ${sheetName}`);
        result.failed++;
        continue;
      }

      try {
        // Check if snapshot already exists for this date
        const { data: existingSnapshot } = await supabaseClient
          .from('snapshots')
          .select('id')
          .eq('user_id', userId)
          .eq('snapshot_date', date)
          .single();

        let snapshotId: string;

        if (existingSnapshot) {
          // Delete existing data for this snapshot
          snapshotId = existingSnapshot.id;
          await Promise.all([
            supabaseClient.from('account_balances').delete().eq('snapshot_id', snapshotId),
            supabaseClient.from('gold_holdings').delete().eq('snapshot_id', snapshotId),
            supabaseClient.from('investments').delete().eq('snapshot_id', snapshotId),
            supabaseClient.from('snapshot_totals').delete().eq('snapshot_id', snapshotId),
          ]);
        } else {
          // Create new snapshot
          const { data: newSnapshot, error: snapshotError } = await supabaseClient
            .from('snapshots')
            .insert({
              user_id: userId,
              snapshot_date: date,
              notes: `Imported from Excel sheet: ${sheetName}`,
            })
            .select()
            .single();

          if (snapshotError || !newSnapshot) {
            result.errors.push(`Failed to create snapshot for ${date}: ${snapshotError?.message}`);
            result.failed++;
            continue;
          }

          snapshotId = newSnapshot.id;
        }

        // Insert account balances
        const balances = parsedRows
          .filter((row) => accountMap.has(row.accountName.toLowerCase()))
          .map((row) => ({
            snapshot_id: snapshotId,
            account_id: accountMap.get(row.accountName.toLowerCase())!,
            amount_try: row.try_amount,
            amount_usd: row.usd_amount,
            amount_eur: row.eur_amount,
            amount_gbp: row.gbp_amount,
          }));

        if (balances.length > 0) {
          await supabaseClient.from('account_balances').insert(balances);
        }

        // Insert gold holdings
        const totalGoldGrams = parsedRows.reduce((sum, row) => sum + row.gold_grams, 0);
        if (totalGoldGrams > 0) {
          await supabaseClient.from('gold_holdings').insert({
            snapshot_id: snapshotId,
            gold_type: 'gram',
            quantity: totalGoldGrams,
            weight_grams: totalGoldGrams,
          });
        }

        // Insert BES as pension investment
        const totalBes = parsedRows.reduce((sum, row) => sum + row.bes_amount, 0);
        if (totalBes > 0) {
          await supabaseClient.from('investments').insert({
            snapshot_id: snapshotId,
            investment_type: 'pension',
            name: 'BES',
            principal: 0,
            current_value: totalBes,
            pnl: 0,
            currency: 'TRY',
          });
        }

        // Calculate totals
        await calculateAndStoreTotals(snapshotId);

        result.imported++;
      } catch (sheetError) {
        console.error(`[Import Service] Error processing sheet ${sheetName}:`, sheetError);
        result.errors.push(`Error processing sheet ${sheetName}: ${sheetError}`);
        result.failed++;
      }
    }

    result.success = result.imported > 0;
    return result;
  } catch (error) {
    console.error('[Import Service] Error importing Excel:', error);
    result.errors.push(`Import error: ${error}`);
    return result;
  }
};

/**
 * Import from uploaded Excel buffer
 */
export const importExcelBuffer = async (
  userId: string,
  buffer: Buffer
): Promise<ImportResult> => {
  const result: ImportResult = {
    success: false,
    imported: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Parse the buffer
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    // Get or create user accounts
    const { data: existingAccounts } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', userId);

    const accountMap = new Map<string, string>();
    for (const account of existingAccounts || []) {
      accountMap.set(account.name.toLowerCase(), account.id);
    }

    // Create missing accounts
    for (const [, accountInfo] of Object.entries(ACCOUNT_MAPPINGS)) {
      const lowerName = accountInfo.name.toLowerCase();
      if (!accountMap.has(lowerName)) {
        const newAccount = await createAccount(userId, accountInfo.name, accountInfo.type);
        if (newAccount) {
          accountMap.set(lowerName, newAccount.id);
        }
      }
    }

    // Process each sheet (same logic as importProjectExcel)
    for (const sheetName of workbook.SheetNames) {
      const date = parseSheetDate(sheetName);
      if (!date) {
        result.failed++;
        continue;
      }

      const worksheet = workbook.Sheets[sheetName];
      const parsedRows = parseWorksheet(worksheet);

      if (parsedRows.length === 0) {
        result.failed++;
        continue;
      }

      try {
        // Check if snapshot already exists
        const { data: existingSnapshot } = await supabaseClient
          .from('snapshots')
          .select('id')
          .eq('user_id', userId)
          .eq('snapshot_date', date)
          .single();

        let snapshotId: string;

        if (existingSnapshot) {
          snapshotId = existingSnapshot.id;
          await Promise.all([
            supabaseClient.from('account_balances').delete().eq('snapshot_id', snapshotId),
            supabaseClient.from('gold_holdings').delete().eq('snapshot_id', snapshotId),
            supabaseClient.from('investments').delete().eq('snapshot_id', snapshotId),
            supabaseClient.from('snapshot_totals').delete().eq('snapshot_id', snapshotId),
          ]);
        } else {
          const { data: newSnapshot, error } = await supabaseClient
            .from('snapshots')
            .insert({
              user_id: userId,
              snapshot_date: date,
              notes: `Imported from Excel: ${sheetName}`,
            })
            .select()
            .single();

          if (error || !newSnapshot) {
            result.failed++;
            continue;
          }

          snapshotId = newSnapshot.id;
        }

        // Insert data (same as above)
        const balances = parsedRows
          .filter((row) => accountMap.has(row.accountName.toLowerCase()))
          .map((row) => ({
            snapshot_id: snapshotId,
            account_id: accountMap.get(row.accountName.toLowerCase())!,
            amount_try: row.try_amount,
            amount_usd: row.usd_amount,
            amount_eur: row.eur_amount,
            amount_gbp: row.gbp_amount,
          }));

        if (balances.length > 0) {
          await supabaseClient.from('account_balances').insert(balances);
        }

        const totalGoldGrams = parsedRows.reduce((sum, row) => sum + row.gold_grams, 0);
        if (totalGoldGrams > 0) {
          await supabaseClient.from('gold_holdings').insert({
            snapshot_id: snapshotId,
            gold_type: 'gram',
            quantity: totalGoldGrams,
            weight_grams: totalGoldGrams,
          });
        }

        const totalBes = parsedRows.reduce((sum, row) => sum + row.bes_amount, 0);
        if (totalBes > 0) {
          await supabaseClient.from('investments').insert({
            snapshot_id: snapshotId,
            investment_type: 'pension',
            name: 'BES',
            principal: 0,
            current_value: totalBes,
            pnl: 0,
            currency: 'TRY',
          });
        }

        await calculateAndStoreTotals(snapshotId);
        result.imported++;
      } catch {
        result.failed++;
      }
    }

    result.success = result.imported > 0;
    return result;
  } catch (error) {
    console.error('[Import Service] Error importing buffer:', error);
    result.errors.push(`Import error: ${error}`);
    return result;
  }
};
