/**
 * Dashboard Page
 * Shows financial summary with charts
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useTheme, themeClasses, getThemeClass } from '../contexts/ThemeContext';
import { financeApi } from '../services/finance.api';
import {
  IDashboardSummary,
  ITimelinePoint,
  IAssetDistribution,
} from '../types/finance.types';
import toast from 'react-hot-toast';

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444'];

const formatCurrency = (value: number, currency: string = 'TRY'): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [summary, setSummary] = useState<IDashboardSummary | null>(null);
  const [timeline, setTimeline] = useState<ITimelinePoint[]>([]);
  const [distribution, setDistribution] = useState<IAssetDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [summaryData, timelineData, distributionData] = await Promise.all([
        financeApi.getDashboardSummary(),
        financeApi.getTimeline(12),
        financeApi.getDistribution(),
      ]);

      setSummary(summaryData);
      setTimeline(timelineData);
      setDistribution(distributionData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleImportExcel = async () => {
    setImporting(true);
    try {
      const result = await financeApi.importProjectExcel();
      if (result.imported > 0) {
        toast.success(`Imported ${result.imported} snapshots`);
        loadDashboardData();
      } else {
        toast.error(result.errors[0] || 'No data was imported');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import Excel file');
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className={`animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mx-auto mb-4 ${
            isDark ? 'border-gold-400' : 'border-navy-600'
          }`} />
          <p className={isDark ? 'text-navy-200' : 'text-slate-600'}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Welcome Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className={`rounded-xl p-6 border ${getThemeClass(themeClasses.card, isDark)}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-navy-800'}`}>
                Dashboard
              </h1>
              <p className={`text-sm ${isDark ? 'text-navy-300' : 'text-slate-500'}`}>
                Welcome back, {user?.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`rounded-xl p-6 border ${getThemeClass(themeClasses.card, isDark)}`}>
            <p className={`text-sm mb-1 ${isDark ? 'text-navy-400' : 'text-slate-500'}`}>Total Net Worth (TRY)</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-navy-800'}`}>
              {formatCurrency(summary?.total_try || 0)}
            </p>
          </div>
          <div className={`rounded-xl p-6 border ${getThemeClass(themeClasses.card, isDark)}`}>
            <p className={`text-sm mb-1 ${isDark ? 'text-navy-400' : 'text-slate-500'}`}>Total Net Worth (USD)</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-navy-800'}`}>
              {formatCurrency(summary?.total_usd || 0, 'USD')}
            </p>
          </div>
          <div className={`rounded-xl p-6 border ${getThemeClass(themeClasses.card, isDark)}`}>
            <p className={`text-sm mb-1 ${isDark ? 'text-navy-400' : 'text-slate-500'}`}>Cash (TRY)</p>
            <p className="text-2xl font-bold text-emerald-500">
              {formatCurrency(summary?.total_cash_try || 0)}
            </p>
          </div>
          <div className={`rounded-xl p-6 border ${getThemeClass(themeClasses.card, isDark)}`}>
            <p className={`text-sm mb-1 ${isDark ? 'text-navy-400' : 'text-slate-500'}`}>Investments (TRY)</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-gold-400' : 'text-navy-600'}`}>
              {formatCurrency(summary?.total_investments_try || 0)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={handleImportExcel}
            disabled={importing}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${getThemeClass(themeClasses.button.primary, isDark)} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Importing...
              </>
            ) : (
              <>
                <span>📊</span>
                Import Excel
              </>
            )}
          </button>
          <Link
            to="/snapshots/new"
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2 transition-colors"
          >
            <span>+</span>
            New Snapshot
          </Link>
          <Link
            to="/snapshots"
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${getThemeClass(themeClasses.button.secondary, isDark)}`}
          >
            <span>📋</span>
            View All Snapshots ({summary?.snapshot_count || 0})
          </Link>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timeline Chart */}
          <div className={`rounded-xl p-6 border ${getThemeClass(themeClasses.card, isDark)}`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-navy-800'}`}>Net Worth Timeline</h2>
            {timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(1)}M`
                    }
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value) || 0), 'Total TRY']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('tr-TR')}
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: isDark ? '#f8fafc' : '#1e293b',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total_try"
                    stroke={isDark ? '#fbbf24' : '#3B82F6'}
                    strokeWidth={2}
                    dot={{ fill: isDark ? '#fbbf24' : '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={`h-[300px] flex items-center justify-center ${isDark ? 'text-navy-400' : 'text-slate-500'}`}>
                No timeline data available. Import your Excel file to see trends.
              </div>
            )}
          </div>

          {/* Distribution Chart */}
          <div className={`rounded-xl p-6 border ${getThemeClass(themeClasses.card, isDark)}`}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-navy-800'}`}>Asset Distribution</h2>
            {distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ payload }) =>
                      `${payload.category} (${payload.percentage.toFixed(1)}%)`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value) || 0)}
                    contentStyle={{
                      backgroundColor: isDark ? '#1e293b' : '#ffffff',
                      border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: isDark ? '#f8fafc' : '#1e293b',
                    }}
                  />
                  <Legend wrapperStyle={{ color: isDark ? '#f8fafc' : '#1e293b' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={`h-[300px] flex items-center justify-center ${isDark ? 'text-navy-400' : 'text-slate-500'}`}>
                No distribution data available. Import your Excel file to see breakdown.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
