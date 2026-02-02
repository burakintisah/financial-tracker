/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { IUser, IAuthContext } from '../types/auth.types';
import { authApi } from '../services/auth.api';

const AuthContext = createContext<IAuthContext | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getCurrentUser(storedToken);
      if (response.success && response.user) {
        setUser(response.user);
        setToken(storedToken);
      } else {
        // Token is invalid
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credential: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.googleLogin(credential);
      if (response.success && response.user && response.token) {
        localStorage.setItem(TOKEN_KEY, response.token);
        setToken(response.token);
        setUser(response.user);
      } else {
        throw new Error('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
