/**
 * Snapshot Detail Page
 * Shows full breakdown of a snapshot
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { financeApi } from '../services/finance.api';
import { ISnapshotDetail } from '../types/finance.types';
import toast from 'react-hot-toast';

const formatCurrency = (value: number, currency: string = 'TRY'): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

type TabType = 'overview' | 'accounts' | 'gold' | 'investments';

export const SnapshotDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [snapshot, setSnapshot] = useState<ISnapshotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    if (id) {
      loadSnapshot(id);
    }
  }, [id]);

  const loadSnapshot = async (snapshotId: string) => {
    try {
      const data = await financeApi.getSnapshot(snapshotId);
      setSnapshot(data);
    } catch (error) {
      console.error('Error loading snapshot:', error);
      toast.error('Failed to load snapshot');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading snapshot...</p>
        </div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Snapshot Not Found</h2>
          <Link to="/snapshots" className="text-blue-600 hover:underline">
            Back to Snapshots
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'accounts', label: 'Accounts' },
    { id: 'gold', label: 'Gold' },
    { id: 'investments', label: 'Investments' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link to="/snapshots" className="text-gray-500 hover:text-gray-700">
                ← Back
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Snapshot: {formatDate(snapshot.snapshot_date)}
                </h1>
                {snapshot.notes && (
                  <p className="text-sm text-gray-500">{snapshot.notes}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && snapshot.totals && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Cash Holdings</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">TRY</span>
                  <span className="font-semibold">{formatCurrency(snapshot.totals.total_cash_try)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">USD</span>
                  <span className="font-semibold">{formatCurrency(snapshot.totals.total_cash_usd, 'USD')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">EUR</span>
                  <span className="font-semibold">{formatCurrency(snapshot.totals.total_cash_eur, 'EUR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GBP</span>
                  <span className="font-semibold">{formatCurrency(snapshot.totals.total_cash_gbp, 'GBP')}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Gold Holdings</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight</span>
                  <span className="font-semibold">{snapshot.totals.total_gold_grams.toFixed(2)} grams</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Value (TRY)</span>
                  <span className="font-semibold">{formatCurrency(snapshot.totals.total_gold_value_try)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Investments</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">TRY Investments</span>
                  <span className="font-semibold">{formatCurrency(snapshot.totals.total_investments_try)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">USD Investments</span>
                  <span className="font-semibold">{formatCurrency(snapshot.totals.total_investments_usd, 'USD')}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm p-6 text-white md:col-span-2 lg:col-span-3">
              <h3 className="text-sm font-medium text-blue-100 mb-3">Grand Total</h3>
              <div className="flex flex-wrap gap-8">
                <div>
                  <span className="text-blue-100 block">Total (TRY)</span>
                  <span className="text-3xl font-bold">{formatCurrency(snapshot.totals.grand_total_try)}</span>
                </div>
                <div>
                  <span className="text-blue-100 block">Total (USD)</span>
                  <span className="text-3xl font-bold">{formatCurrency(snapshot.totals.grand_total_usd, 'USD')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {snapshot.account_balances.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No account balances recorded.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">TRY</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">USD</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">EUR</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">GBP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {snapshot.account_balances.map((balance) => (
                    <tr key={balance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">
                          {balance.account?.name || 'Unknown Account'}
                        </span>
                        <span className="text-sm text-gray-500 block">
                          {balance.account?.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">{formatCurrency(balance.amount_try)}</td>
                      <td className="px-6 py-4 text-right">{formatCurrency(balance.amount_usd, 'USD')}</td>
                      <td className="px-6 py-4 text-right">{formatCurrency(balance.amount_eur, 'EUR')}</td>
                      <td className="px-6 py-4 text-right">{formatCurrency(balance.amount_gbp, 'GBP')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Gold Tab */}
        {activeTab === 'gold' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {snapshot.gold_holdings.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No gold holdings recorded.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Weight (grams)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {snapshot.gold_holdings.map((holding) => (
                    <tr key={holding.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 capitalize">{holding.gold_type}</td>
                      <td className="px-6 py-4 text-right">{holding.quantity}</td>
                      <td className="px-6 py-4 text-right">{holding.weight_grams.toFixed(2)}g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Investments Tab */}
        {activeTab === 'investments' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {snapshot.investments.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No investments recorded.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Principal</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current Value</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {snapshot.investments.map((investment) => (
                    <tr key={investment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{investment.name}</span>
                        {investment.ticker && (
                          <span className="text-sm text-gray-500 block">{investment.ticker}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 capitalize">{investment.investment_type}</td>
                      <td className="px-6 py-4 text-right">{formatCurrency(investment.principal, investment.currency)}</td>
                      <td className="px-6 py-4 text-right font-semibold">{formatCurrency(investment.current_value, investment.currency)}</td>
                      <td className={`px-6 py-4 text-right font-semibold ${investment.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {investment.pnl >= 0 ? '+' : ''}{formatCurrency(investment.pnl, investment.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SnapshotDetailPage;
