/**
 * Finance API Service
 */

import axios from 'axios';
import {
  ISnapshotSummary,
  ISnapshotDetail,
  IDashboardSummary,
  ITimelinePoint,
  IAssetDistribution,
  IAccount,
  ICreateSnapshotInput,
} from '../types/finance.types';

const API_URL = import.meta.env.VITE_API_URL || '';

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export const financeApi = {
  // Dashboard
  getDashboardSummary: async (): Promise<IDashboardSummary> => {
    const response = await api.get<ApiResponse<IDashboardSummary>>('/api/dashboard/summary');
    return response.data.data!;
  },

  getTimeline: async (months: number = 12): Promise<ITimelinePoint[]> => {
    const response = await api.get<ApiResponse<ITimelinePoint[]>>(
      `/api/dashboard/timeline?months=${months}`
    );
    return response.data.data || [];
  },

  getDistribution: async (): Promise<IAssetDistribution[]> => {
    const response = await api.get<ApiResponse<IAssetDistribution[]>>('/api/dashboard/distribution');
    return response.data.data || [];
  },

  // Snapshots
  getSnapshots: async (): Promise<ISnapshotSummary[]> => {
    const response = await api.get<ApiResponse<ISnapshotSummary[]>>('/api/snapshots');
    return response.data.data || [];
  },

  getSnapshot: async (id: string): Promise<ISnapshotDetail | null> => {
    const response = await api.get<ApiResponse<ISnapshotDetail>>(`/api/snapshots/${id}`);
    return response.data.data || null;
  },

  createSnapshot: async (input: ICreateSnapshotInput): Promise<ISnapshotDetail | null> => {
    const response = await api.post<ApiResponse<ISnapshotDetail>>('/api/snapshots', input);
    return response.data.data || null;
  },

  deleteSnapshot: async (id: string): Promise<boolean> => {
    const response = await api.delete<ApiResponse<void>>(`/api/snapshots/${id}`);
    return response.data.success;
  },

  // Accounts
  getAccounts: async (): Promise<IAccount[]> => {
    const response = await api.get<ApiResponse<IAccount[]>>('/api/accounts');
    return response.data.data || [];
  },

  createAccount: async (
    name: string,
    type: string,
    institution?: string
  ): Promise<IAccount | null> => {
    const response = await api.post<ApiResponse<IAccount>>('/api/accounts', {
      name,
      type,
      institution,
    });
    return response.data.data || null;
  },

  // Import
  importProjectExcel: async (): Promise<{
    imported: number;
    failed: number;
    errors: string[];
  }> => {
    const response = await api.post<
      ApiResponse<{ imported: number; failed: number; errors: string[] }>
    >('/api/import/project-excel');
    return response.data.data || { imported: 0, failed: 0, errors: [] };
  },
};

export default financeApi;
