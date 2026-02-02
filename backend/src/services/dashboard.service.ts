/**
 * Dashboard Service
 * Provides aggregated data for the dashboard
 */

import { supabaseClient } from '../config/supabase';
import {
  IDashboardSummary,
  ITimelinePoint,
  IAssetDistribution,
} from '../types/finance.types';

/**
 * Get dashboard summary for a user
 */
export const getDashboardSummary = async (userId: string): Promise<IDashboardSummary> => {
  try {
    // Get latest snapshot with totals
    const { data: latestSnapshot, error: snapshotError } = await supabaseClient
      .from('snapshots')
      .select(`
        id,
        snapshot_date,
        snapshot_totals (
          grand_total_try,
          grand_total_usd,
          total_cash_try,
          total_cash_usd,
          total_cash_eur,
          total_cash_gbp,
          total_investments_try,
          total_investments_usd
        )
      `)
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();

    // Get total snapshot count
    const { count } = await supabaseClient
      .from('snapshots')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (snapshotError || !latestSnapshot) {
      return {
        total_try: 0,
        total_usd: 0,
        total_cash_try: 0,
        total_investments_try: 0,
        snapshot_count: count || 0,
      };
    }

    const totals = latestSnapshot.snapshot_totals as any;

    return {
      latest_snapshot: {
        id: latestSnapshot.id,
        snapshot_date: latestSnapshot.snapshot_date,
        grand_total_try: totals?.grand_total_try || 0,
        grand_total_usd: totals?.grand_total_usd || 0,
      },
      total_try: totals?.grand_total_try || 0,
      total_usd: totals?.grand_total_usd || 0,
      total_cash_try:
        (totals?.total_cash_try || 0) +
        (totals?.total_cash_usd || 0) * 32.5 +
        (totals?.total_cash_eur || 0) * 35.5 +
        (totals?.total_cash_gbp || 0) * 41.0,
      total_investments_try:
        (totals?.total_investments_try || 0) + (totals?.total_investments_usd || 0) * 32.5,
      snapshot_count: count || 0,
    };
  } catch (error) {
    console.error('[Dashboard Service] Error getting summary:', error);
    return {
      total_try: 0,
      total_usd: 0,
      total_cash_try: 0,
      total_investments_try: 0,
      snapshot_count: 0,
    };
  }
};

/**
 * Get timeline data for charts
 */
export const getTimeline = async (
  userId: string,
  months: number = 12
): Promise<ITimelinePoint[]> => {
  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const { data: snapshots, error } = await supabaseClient
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
      .gte('snapshot_date', startDate.toISOString().split('T')[0])
      .lte('snapshot_date', endDate.toISOString().split('T')[0])
      .order('snapshot_date', { ascending: true });

    if (error || !snapshots) {
      return [];
    }

    return snapshots.map((s: any) => ({
      date: s.snapshot_date,
      total_try: s.snapshot_totals?.grand_total_try || 0,
      total_usd: s.snapshot_totals?.grand_total_usd || 0,
    }));
  } catch (error) {
    console.error('[Dashboard Service] Error getting timeline:', error);
    return [];
  }
};

/**
 * Get asset distribution for pie chart
 */
export const getAssetDistribution = async (userId: string): Promise<IAssetDistribution[]> => {
  try {
    // Get latest snapshot
    const { data: latestSnapshot, error: snapshotError } = await supabaseClient
      .from('snapshots')
      .select('id')
      .eq('user_id', userId)
      .order('snapshot_date', { ascending: false })
      .limit(1)
      .single();

    if (snapshotError || !latestSnapshot) {
      return [];
    }

    // Get totals for the latest snapshot
    const { data: totals, error: totalsError } = await supabaseClient
      .from('snapshot_totals')
      .select('*')
      .eq('snapshot_id', latestSnapshot.id)
      .single();

    if (totalsError || !totals) {
      return [];
    }

    // Exchange rates
    const USD_TRY = 32.5;
    const EUR_TRY = 35.5;
    const GBP_TRY = 41.0;

    // Calculate values in TRY
    const cashTry =
      (parseFloat(totals.total_cash_try) || 0) +
      (parseFloat(totals.total_cash_usd) || 0) * USD_TRY +
      (parseFloat(totals.total_cash_eur) || 0) * EUR_TRY +
      (parseFloat(totals.total_cash_gbp) || 0) * GBP_TRY;

    const goldTry = parseFloat(totals.total_gold_value_try) || 0;

    const investmentsTry =
      (parseFloat(totals.total_investments_try) || 0) +
      (parseFloat(totals.total_investments_usd) || 0) * USD_TRY;

    const total = cashTry + goldTry + investmentsTry;

    if (total === 0) {
      return [];
    }

    const distribution: IAssetDistribution[] = [];

    if (cashTry > 0) {
      distribution.push({
        category: 'Cash',
        value: cashTry,
        percentage: (cashTry / total) * 100,
      });
    }

    if (goldTry > 0) {
      distribution.push({
        category: 'Gold',
        value: goldTry,
        percentage: (goldTry / total) * 100,
      });
    }

    if (investmentsTry > 0) {
      distribution.push({
        category: 'Investments',
        value: investmentsTry,
        percentage: (investmentsTry / total) * 100,
      });
    }

    return distribution;
  } catch (error) {
    console.error('[Dashboard Service] Error getting asset distribution:', error);
    return [];
  }
};
