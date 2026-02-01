/**
 * Create Snapshot Page
 * Form to create a new financial snapshot
 */

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { financeApi } from '../services/finance.api';
import {
  IAccount,
  ICreateSnapshotInput,
  GoldType,
  InvestmentType,
  Currency,
} from '../types/finance.types';
import toast from 'react-hot-toast';

const GOLD_TYPES: { value: GoldType; label: string; weight: number }[] = [
  { value: 'gram', label: 'Gram Gold', weight: 1 },
  { value: 'quarter', label: 'Quarter Gold (Ceyrek)', weight: 1.75 },
  { value: 'half', label: 'Half Gold (Yarim)', weight: 3.5 },
  { value: 'full', label: 'Full Gold (Tam)', weight: 7 },
  { value: 'republic', label: 'Republic Gold (Cumhuriyet)', weight: 7.216 },
];

const INVESTMENT_TYPES: { value: InvestmentType; label: string }[] = [
  { value: 'fund', label: 'Fund' },
  { value: 'bist', label: 'BIST Stock' },
  { value: 'nasdaq', label: 'US Stock' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'pension', label: 'Pension (BES)' },
  { value: 'other', label: 'Other' },
];

const CURRENCIES: Currency[] = ['TRY', 'USD', 'EUR', 'GBP'];

export const CreateSnapshotPage: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [snapshotDate, setSnapshotDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [accountBalances, setAccountBalances] = useState<
    Record<string, { try: number; usd: number; eur: number; gbp: number }>
  >({});
  const [goldHoldings, setGoldHoldings] = useState<
    { type: GoldType; quantity: number }[]
  >([]);
  const [investments, setInvestments] = useState<
    {
      type: InvestmentType;
      name: string;
      ticker: string;
      principal: number;
      currentValue: number;
      currency: Currency;
    }[]
  >([]);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await financeApi.getAccounts();
      setAccounts(data);
      // Initialize balance state for each account
      const initialBalances: Record<
        string,
        { try: number; usd: number; eur: number; gbp: number }
      > = {};
      data.forEach((account) => {
        initialBalances[account.id] = { try: 0, usd: 0, eur: 0, gbp: 0 };
      });
      setAccountBalances(initialBalances);
    } catch (error) {
      console.error('Error loading accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountBalanceChange = (
    accountId: string,
    currency: 'try' | 'usd' | 'eur' | 'gbp',
    value: number
  ) => {
    setAccountBalances((prev) => ({
      ...prev,
      [accountId]: {
        ...prev[accountId],
        [currency]: value,
      },
    }));
  };

  const addGoldHolding = () => {
    setGoldHoldings([...goldHoldings, { type: 'gram', quantity: 0 }]);
  };

  const updateGoldHolding = (index: number, field: 'type' | 'quantity', value: any) => {
    const updated = [...goldHoldings];
    updated[index] = { ...updated[index], [field]: value };
    setGoldHoldings(updated);
  };

  const removeGoldHolding = (index: number) => {
    setGoldHoldings(goldHoldings.filter((_, i) => i !== index));
  };

  const addInvestment = () => {
    setInvestments([
      ...investments,
      {
        type: 'fund',
        name: '',
        ticker: '',
        principal: 0,
        currentValue: 0,
        currency: 'TRY',
      },
    ]);
  };

  const updateInvestment = (index: number, field: string, value: any) => {
    const updated = [...investments];
    updated[index] = { ...updated[index], [field]: value };
    setInvestments(updated);
  };

  const removeInvestment = (index: number) => {
    setInvestments(investments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const input: ICreateSnapshotInput = {
        snapshot_date: snapshotDate,
        notes: notes || undefined,
        account_balances: Object.entries(accountBalances)
          .filter(([, bal]) => bal.try > 0 || bal.usd > 0 || bal.eur > 0 || bal.gbp > 0)
          .map(([accountId, bal]) => ({
            account_id: accountId,
            amount_try: bal.try,
            amount_usd: bal.usd,
            amount_eur: bal.eur,
            amount_gbp: bal.gbp,
          })),
        gold_holdings: goldHoldings
          .filter((g) => g.quantity > 0)
          .map((g) => {
            const goldType = GOLD_TYPES.find((t) => t.value === g.type);
            return {
              gold_type: g.type,
              quantity: g.quantity,
              weight_grams: g.quantity * (goldType?.weight || 1),
            };
          }),
        investments: investments
          .filter((i) => i.name && i.currentValue > 0)
          .map((i) => ({
            investment_type: i.type,
            name: i.name,
            ticker: i.ticker || undefined,
            principal: i.principal,
            current_value: i.currentValue,
            pnl: i.currentValue - i.principal,
            currency: i.currency,
          })),
      };

      const snapshot = await financeApi.createSnapshot(input);
      if (snapshot) {
        toast.success('Snapshot created successfully');
        navigate(`/snapshots/${snapshot.id}`);
      } else {
        toast.error('Failed to create snapshot');
      }
    } catch (error) {
      console.error('Error creating snapshot:', error);
      toast.error('Failed to create snapshot');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Link to="/snapshots" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Create New Snapshot</h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={snapshotDate}
                  onChange={(e) => setSnapshotDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes for this snapshot"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Account Balances */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Balances</h2>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">
                    {account.name}
                    <span className="text-sm text-gray-500 ml-2">({account.type})</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">TRY</label>
                      <input
                        type="number"
                        value={accountBalances[account.id]?.try || 0}
                        onChange={(e) =>
                          handleAccountBalanceChange(account.id, 'try', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">USD</label>
                      <input
                        type="number"
                        value={accountBalances[account.id]?.usd || 0}
                        onChange={(e) =>
                          handleAccountBalanceChange(account.id, 'usd', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">EUR</label>
                      <input
                        type="number"
                        value={accountBalances[account.id]?.eur || 0}
                        onChange={(e) =>
                          handleAccountBalanceChange(account.id, 'eur', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">GBP</label>
                      <input
                        type="number"
                        value={accountBalances[account.id]?.gbp || 0}
                        onChange={(e) =>
                          handleAccountBalanceChange(account.id, 'gbp', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gold Holdings */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Gold Holdings</h2>
              <button
                type="button"
                onClick={addGoldHolding}
                className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
              >
                + Add Gold
              </button>
            </div>
            <div className="space-y-3">
              {goldHoldings.map((holding, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Type</label>
                    <select
                      value={holding.type}
                      onChange={(e) => updateGoldHolding(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      {GOLD_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label} ({type.weight}g)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                    <input
                      type="number"
                      value={holding.quantity}
                      onChange={(e) =>
                        updateGoldHolding(index, 'quantity', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeGoldHolding(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {goldHoldings.length === 0 && (
                <p className="text-gray-500 text-sm">No gold holdings added.</p>
              )}
            </div>
          </div>

          {/* Investments */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Investments</h2>
              <button
                type="button"
                onClick={addInvestment}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                + Add Investment
              </button>
            </div>
            <div className="space-y-4">
              {investments.map((investment, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Type</label>
                      <select
                        value={investment.type}
                        onChange={(e) => updateInvestment(index, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        {INVESTMENT_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Name</label>
                      <input
                        type="text"
                        value={investment.name}
                        onChange={(e) => updateInvestment(index, 'name', e.target.value)}
                        placeholder="Investment name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Ticker (optional)</label>
                      <input
                        type="text"
                        value={investment.ticker}
                        onChange={(e) => updateInvestment(index, 'ticker', e.target.value)}
                        placeholder="e.g., AAPL"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Principal</label>
                      <input
                        type="number"
                        value={investment.principal}
                        onChange={(e) =>
                          updateInvestment(index, 'principal', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Current Value</label>
                      <input
                        type="number"
                        value={investment.currentValue}
                        onChange={(e) =>
                          updateInvestment(index, 'currentValue', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Currency</label>
                      <select
                        value={investment.currency}
                        onChange={(e) => updateInvestment(index, 'currency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        {CURRENCIES.map((curr) => (
                          <option key={curr} value={curr}>
                            {curr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() => removeInvestment(index)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {investments.length === 0 && (
                <p className="text-gray-500 text-sm">No investments added.</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link
              to="/snapshots"
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Create Snapshot'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateSnapshotPage;
