/**
 * Authentication API Service
 */

import axios from 'axios';
import { IUser } from '../types/auth.types';

const API_URL = import.meta.env.VITE_API_URL || '';

interface AuthResponse {
  success: boolean;
  user?: IUser;
  token?: string;
  error?: string;
}

export const authApi = {
  /**
   * Login with Google credential
   */
  googleLogin: async (credential: string): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/google`, {
      credential,
    });
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (token: string): Promise<AuthResponse> => {
    const response = await axios.get<AuthResponse>(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  /**
   * Logout
   */
  logout: async (token: string): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(
      `${API_URL}/api/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};

export default authApi;
