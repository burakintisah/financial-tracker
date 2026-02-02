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
  const { user, logout } = useAuth();
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Financial Tracker</h1>
                <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/snapshots"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Snapshots
              </Link>
              <Link
                to="/analysis"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Stock Analysis
              </Link>
              <button
                onClick={logout}
                className="text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Net Worth (TRY)</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary?.total_try || 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Total Net Worth (USD)</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary?.total_usd || 0, 'USD')}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Cash (TRY)</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(summary?.total_cash_try || 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Investments (TRY)</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary?.total_investments_try || 0)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={handleImportExcel}
            disabled={importing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <span>+</span>
            New Snapshot
          </Link>
          <Link
            to="/snapshots"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <span>📋</span>
            View All Snapshots ({summary?.snapshot_count || 0})
          </Link>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timeline Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Net Worth Timeline</h2>
            {timeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      `${(value / 1000000).toFixed(1)}M`
                    }
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value) || 0), 'Total TRY']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('tr-TR')}
                  />
                  <Line
                    type="monotone"
                    dataKey="total_try"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No timeline data available. Import your Excel file to see trends.
              </div>
            )}
          </div>

          {/* Distribution Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Distribution</h2>
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
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
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
