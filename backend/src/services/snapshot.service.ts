/**
 * Snapshot Service
 * Handles financial snapshot CRUD operations
 */

import { supabaseClient } from '../config/supabase';
import {
  ISnapshot,
  ISnapshotDetail,
  ISnapshotSummary,
  ICreateSnapshotInput,
  IAccount,
  IAccountBalance,
  IGoldHolding,
  IInvestment,
  ISnapshotTotals,
} from '../types/finance.types';

/**
 * Get all snapshots for a user (summary view)
 */
export const getSnapshotsByUserId = async (userId: string): Promise<ISnapshotSummary[]> => {
  try {
    const { data: snapshots, error: snapshotsError } = await supabaseClient
      .from('snapshots')
      .select(`
        id,
        snapshot_date,
        snapshot_totals (
          grand_total_try,
          grand_total_usd
        )
      `)
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false });

    if (snapshotsError) {
      console.error('[Snapshot Service] Error fetching snapshots:', snapshotsError);
      return [];
    }

    return (snapshots || []).map((s: any) => ({
      id: s.id,
      snapshot_date: s.snapshot_date,
      grand_total_try: s.snapshot_totals?.grand_total_try || 0,
      grand_total_usd: s.snapshot_totals?.grand_total_usd || 0,
    }));
  } catch (error) {
    console.error('[Snapshot Service] Error fetching snapshots:', error);
    return [];
  }
};

/**
 * Get single snapshot with full details
 */
export const getSnapshotById = async (
  snapshotId: string,
  userId: string
): Promise<ISnapshotDetail | null> => {
  try {
    // First verify ownership
    const { data: snapshot, error: snapshotError } = await supabaseClient
      .from('snapshots')
      .select('*')
      .eq('id', snapshotId)
      .eq('user_id', userId)
      .single();

    if (snapshotError || !snapshot) {
      return null;
    }

    // Fetch related data in parallel
    const [balancesResult, goldResult, investmentsResult, totalsResult] = await Promise.all([
      supabaseClient
        .from('account_balances')
        .select(`
          *,
          account:accounts (*)
        `)
        .eq('snapshot_id', snapshotId),
      supabaseClient.from('gold_holdings').select('*').eq('snapshot_id', snapshotId),
      supabaseClient.from('investments').select('*').eq('snapshot_id', snapshotId),
      supabaseClient.from('snapshot_totals').select('*').eq('snapshot_id', snapshotId).single(),
    ]);

    return {
      ...snapshot,
      account_balances: (balancesResult.data || []) as (IAccountBalance & { account: IAccount })[],
      gold_holdings: (goldResult.data || []) as IGoldHolding[],
      investments: (investmentsResult.data || []) as IInvestment[],
      totals: totalsResult.data as ISnapshotTotals | undefined,
    };
  } catch (error) {
    console.error('[Snapshot Service] Error fetching snapshot detail:', error);
    return null;
  }
};

/**
 * Create a new snapshot with all related data
 */
export const createSnapshot = async (
  userId: string,
  input: ICreateSnapshotInput
): Promise<ISnapshotDetail | null> => {
  try {
    // Create the snapshot
    const { data: snapshot, error: snapshotError } = await supabaseClient
      .from('snapshots')
      .insert({
        user_id: userId,
        snapshot_date: input.snapshot_date,
        notes: input.notes,
      })
      .select()
      .single();

    if (snapshotError || !snapshot) {
      console.error('[Snapshot Service] Error creating snapshot:', snapshotError);
      return null;
    }

    // Insert account balances
    if (input.account_balances && input.account_balances.length > 0) {
      const { error: balancesError } = await supabaseClient.from('account_balances').insert(
        input.account_balances.map((balance) => ({
          snapshot_id: snapshot.id,
          account_id: balance.account_id,
          amount_try: balance.amount_try || 0,
          amount_usd: balance.amount_usd || 0,
          amount_eur: balance.amount_eur || 0,
          amount_gbp: balance.amount_gbp || 0,
        }))
      );

      if (balancesError) {
        console.error('[Snapshot Service] Error creating account balances:', balancesError);
      }
    }

    // Insert gold holdings
    if (input.gold_holdings && input.gold_holdings.length > 0) {
      const { error: goldError } = await supabaseClient.from('gold_holdings').insert(
        input.gold_holdings.map((gold) => ({
          snapshot_id: snapshot.id,
          gold_type: gold.gold_type,
          quantity: gold.quantity,
          weight_grams: gold.weight_grams,
        }))
      );

      if (goldError) {
        console.error('[Snapshot Service] Error creating gold holdings:', goldError);
      }
    }

    // Insert investments
    if (input.investments && input.investments.length > 0) {
      const { error: investmentsError } = await supabaseClient.from('investments').insert(
        input.investments.map((inv) => ({
          snapshot_id: snapshot.id,
          investment_type: inv.investment_type,
          name: inv.name,
          ticker: inv.ticker,
          principal: inv.principal || 0,
          current_value: inv.current_value || 0,
          pnl: inv.pnl || 0,
          currency: inv.currency || 'TRY',
        }))
      );

      if (investmentsError) {
        console.error('[Snapshot Service] Error creating investments:', investmentsError);
      }
    }

    // Calculate and store totals
    await calculateAndStoreTotals(snapshot.id);

    // Return the full snapshot
    return await getSnapshotById(snapshot.id, userId);
  } catch (error) {
    console.error('[Snapshot Service] Error creating snapshot:', error);
    return null;
  }
};

/**
 * Delete a snapshot
 */
export const deleteSnapshot = async (snapshotId: string, userId: string): Promise<boolean> => {
  try {
    const { error } = await supabaseClient
      .from('snapshots')
      .delete()
      .eq('id', snapshotId)
      .eq('user_id', userId);

    if (error) {
      console.error('[Snapshot Service] Error deleting snapshot:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Snapshot Service] Error deleting snapshot:', error);
    return false;
  }
};

/**
 * Calculate and store totals for a snapshot
 */
export const calculateAndStoreTotals = async (snapshotId: string): Promise<void> => {
  try {
    // Fetch all data for the snapshot
    const [balancesResult, goldResult, investmentsResult] = await Promise.all([
      supabaseClient.from('account_balances').select('*').eq('snapshot_id', snapshotId),
      supabaseClient.from('gold_holdings').select('*').eq('snapshot_id', snapshotId),
      supabaseClient.from('investments').select('*').eq('snapshot_id', snapshotId),
    ]);

    const balances = balancesResult.data || [];
    const goldHoldings = goldResult.data || [];
    const investments = investmentsResult.data || [];

    // Calculate cash totals
    const totalCashTry = balances.reduce((sum, b) => sum + (parseFloat(b.amount_try) || 0), 0);
    const totalCashUsd = balances.reduce((sum, b) => sum + (parseFloat(b.amount_usd) || 0), 0);
    const totalCashEur = balances.reduce((sum, b) => sum + (parseFloat(b.amount_eur) || 0), 0);
    const totalCashGbp = balances.reduce((sum, b) => sum + (parseFloat(b.amount_gbp) || 0), 0);

    // Calculate gold totals
    const totalGoldGrams = goldHoldings.reduce(
      (sum, g) => sum + (parseFloat(g.weight_grams) || 0),
      0
    );
    // Estimate gold value (using approximate gold price per gram in TRY)
    const goldPricePerGram = 2500; // This should be fetched from an API in production
    const totalGoldValueTry = totalGoldGrams * goldPricePerGram;

    // Calculate investment totals
    const tryInvestments = investments.filter((i) => i.currency === 'TRY');
    const usdInvestments = investments.filter((i) => i.currency === 'USD');

    const totalInvestmentsTry = tryInvestments.reduce(
      (sum, i) => sum + (parseFloat(i.current_value) || 0),
      0
    );
    const totalInvestmentsUsd = usdInvestments.reduce(
      (sum, i) => sum + (parseFloat(i.current_value) || 0),
      0
    );

    // Exchange rates (should be fetched from an API in production)
    const exchangeRates = {
      USD_TRY: 32.5,
      EUR_TRY: 35.5,
      GBP_TRY: 41.0,
    };

    // Calculate grand totals
    const grandTotalTry =
      totalCashTry +
      totalCashUsd * exchangeRates.USD_TRY +
      totalCashEur * exchangeRates.EUR_TRY +
      totalCashGbp * exchangeRates.GBP_TRY +
      totalGoldValueTry +
      totalInvestmentsTry +
      totalInvestmentsUsd * exchangeRates.USD_TRY;

    const grandTotalUsd = grandTotalTry / exchangeRates.USD_TRY;

    // Upsert totals
    const { error } = await supabaseClient.from('snapshot_totals').upsert(
      {
        snapshot_id: snapshotId,
        total_cash_try: totalCashTry,
        total_cash_usd: totalCashUsd,
        total_cash_eur: totalCashEur,
        total_cash_gbp: totalCashGbp,
        total_gold_grams: totalGoldGrams,
        total_gold_value_try: totalGoldValueTry,
        total_investments_try: totalInvestmentsTry,
        total_investments_usd: totalInvestmentsUsd,
        grand_total_try: grandTotalTry,
        grand_total_usd: grandTotalUsd,
        exchange_rates: exchangeRates,
      },
      { onConflict: 'snapshot_id' }
    );

    if (error) {
      console.error('[Snapshot Service] Error storing totals:', error);
    }
  } catch (error) {
    console.error('[Snapshot Service] Error calculating totals:', error);
  }
};

/**
 * Get user's accounts
 */
export const getAccountsByUserId = async (userId: string): Promise<IAccount[]> => {
  try {
    const { data, error } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('[Snapshot Service] Error fetching accounts:', error);
      return [];
    }

    return data as IAccount[];
  } catch (error) {
    console.error('[Snapshot Service] Error fetching accounts:', error);
    return [];
  }
};

/**
 * Create a new account
 */
export const createAccount = async (
  userId: string,
  name: string,
  type: string,
  institution?: string
): Promise<IAccount | null> => {
  try {
    const { data, error } = await supabaseClient
      .from('accounts')
      .insert({
        user_id: userId,
        name,
        type,
        institution,
      })
      .select()
      .single();

    if (error) {
      console.error('[Snapshot Service] Error creating account:', error);
      return null;
    }

    return data as IAccount;
  } catch (error) {
    console.error('[Snapshot Service] Error creating account:', error);
    return null;
  }
};
