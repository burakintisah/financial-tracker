/**
 * Finance Types
 */

export type AccountType = 'bank' | 'brokerage' | 'crypto' | 'pension' | 'other';
export type GoldType = 'gram' | 'quarter' | 'half' | 'full' | 'republic' | 'other';
export type InvestmentType = 'fund' | 'bist' | 'nasdaq' | 'crypto' | 'pension' | 'other';
export type Currency = 'TRY' | 'USD' | 'EUR' | 'GBP';

export interface IAccount {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  institution?: string;
  is_active: boolean;
}

export interface ISnapshotSummary {
  id: string;
  snapshot_date: string;
  grand_total_try: number;
  grand_total_usd: number;
}

export interface IAccountBalance {
  id: string;
  snapshot_id: string;
  account_id: string;
  amount_try: number;
  amount_usd: number;
  amount_eur: number;
  amount_gbp: number;
  account?: IAccount;
}

export interface IGoldHolding {
  id: string;
  snapshot_id: string;
  gold_type: GoldType;
  quantity: number;
  weight_grams: number;
}

export interface IInvestment {
  id: string;
  snapshot_id: string;
  investment_type: InvestmentType;
  name: string;
  ticker?: string;
  principal: number;
  current_value: number;
  pnl: number;
  currency: Currency;
}

export interface ISnapshotTotals {
  total_cash_try: number;
  total_cash_usd: number;
  total_cash_eur: number;
  total_cash_gbp: number;
  total_gold_grams: number;
  total_gold_value_try: number;
  total_investments_try: number;
  total_investments_usd: number;
  grand_total_try: number;
  grand_total_usd: number;
  exchange_rates: Record<string, number>;
}

export interface ISnapshotDetail {
  id: string;
  user_id: string;
  snapshot_date: string;
  notes?: string;
  account_balances: IAccountBalance[];
  gold_holdings: IGoldHolding[];
  investments: IInvestment[];
  totals?: ISnapshotTotals;
}

export interface IDashboardSummary {
  latest_snapshot?: ISnapshotSummary;
  total_try: number;
  total_usd: number;
  total_cash_try: number;
  total_investments_try: number;
  snapshot_count: number;
}

export interface ITimelinePoint {
  date: string;
  total_try: number;
  total_usd: number;
}

export interface IAssetDistribution {
  category: string;
  value: number;
  percentage: number;
}

export interface ICreateSnapshotInput {
  snapshot_date: string;
  notes?: string;
  account_balances: {
    account_id: string;
    amount_try?: number;
    amount_usd?: number;
    amount_eur?: number;
    amount_gbp?: number;
  }[];
  gold_holdings: {
    gold_type: GoldType;
    quantity: number;
    weight_grams: number;
  }[];
  investments: {
    investment_type: InvestmentType;
    name: string;
    ticker?: string;
    principal?: number;
    current_value?: number;
    pnl?: number;
    currency?: Currency;
  }[];
}
