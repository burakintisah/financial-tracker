/**
 * Analysis API Service
 * Handles all API calls related to stock analysis
 */

import axios, { AxiosError } from 'axios';
import {
  Market,
  Timeframe,
  IStockAnalysis,
  IStockInfo,
  IAnalysisResponse,
  ITrendingResponse,
  IHealthResponse,
} from '../types/analysis.types';

const API_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds timeout for AI calls
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get analysis for a single stock
 */
export async function getAnalysis(
  market: Market,
  ticker: string,
  timeframe: Timeframe
): Promise<{ analysis: IStockAnalysis; cached: boolean }> {
  try {
    const response = await apiClient.get<IAnalysisResponse>(
      `/api/analysis/${market}/${ticker}/${timeframe}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get analysis');
    }

    return {
      analysis: response.data.data,
      cached: response.data.cached || false,
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded. Please wait before making more requests.');
      }
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
}

/**
 * Get trending stocks for a market
 */
export async function getTrendingStocks(market: Market): Promise<IStockInfo[]> {
  try {
    const response = await apiClient.get<ITrendingResponse>(
      `/api/analysis/trending/${market}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Failed to get trending stocks');
    }

    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.error || error.message);
    }
    throw error;
  }
}

/**
 * Get analysis health status
 */
export async function getAnalysisHealth(): Promise<IHealthResponse> {
  try {
    const response = await apiClient.get<IHealthResponse>('/api/health/analysis');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        success: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
    throw error;
  }
}

/**
 * Test AI service
 */
export async function testAIService(): Promise<{
  success: boolean;
  responseTime: number;
  analysis?: IStockAnalysis;
  error?: string;
}> {
  try {
    const response = await apiClient.get('/api/analysis/test');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        success: false,
        responseTime: 0,
        error: error.response?.data?.error || error.message,
      };
    }
    throw error;
  }
}

export const analysisApi = {
  getAnalysis,
  getTrendingStocks,
  getAnalysisHealth,
  testAIService,
};

export default analysisApi;
