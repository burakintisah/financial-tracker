/**
 * Snapshots Page
 * Lists all financial snapshots
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { financeApi } from '../services/finance.api';
import { ISnapshotSummary } from '../types/finance.types';
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

export const SnapshotsPage: React.FC = () => {
  const [snapshots, setSnapshots] = useState<ISnapshotSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    loadSnapshots();
  }, []);

  const loadSnapshots = async () => {
    try {
      const data = await financeApi.getSnapshots();
      setSnapshots(data);
    } catch (error) {
      console.error('Error loading snapshots:', error);
      toast.error('Failed to load snapshots');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this snapshot?')) {
      return;
    }

    setDeleting(id);
    try {
      const success = await financeApi.deleteSnapshot(id);
      if (success) {
        toast.success('Snapshot deleted');
        setSnapshots(snapshots.filter((s) => s.id !== id));
      } else {
        toast.error('Failed to delete snapshot');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete snapshot');
    } finally {
      setDeleting(null);
    }
  };

  const handleImportExcel = async () => {
    setImporting(true);
    try {
      const result = await financeApi.importProjectExcel();
      if (result.imported > 0) {
        toast.success(`Imported ${result.imported} snapshots`);
        loadSnapshots();
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
          <p className="text-gray-600">Loading snapshots...</p>
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
              <Link to="/dashboard" className="text-gray-500 hover:text-gray-700">
                ← Back
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Financial Snapshots</h1>
            </div>
            <div className="flex gap-3">
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
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {snapshots.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Snapshots Yet</h2>
            <p className="text-gray-500 mb-6">
              Create your first snapshot or import data from Excel.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/snapshots/new"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Snapshot
              </Link>
              <button
                onClick={handleImportExcel}
                disabled={importing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Import Excel
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total (TRY)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total (USD)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {snapshots.map((snapshot) => (
                  <tr key={snapshot.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(snapshot.snapshot_date)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(snapshot.grand_total_try)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-gray-600">
                        {formatCurrency(snapshot.grand_total_usd, 'USD')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/snapshots/${snapshot.id}`}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(snapshot.id)}
                          disabled={deleting === snapshot.id}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                        >
                          {deleting === snapshot.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default SnapshotsPage;
