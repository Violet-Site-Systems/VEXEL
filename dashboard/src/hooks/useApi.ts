// SPDX-License-Identifier: SBL-1.0 AND EAL-1.0 AND CGL-1.0
/**
 * Custom hook for API data fetching
 */
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';
import { Agent, DashboardStats } from '../types';

export function useApi<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    fetch();
  }, [fetch, ...dependencies]);

  return { data, loading, error, refetch: fetch };
}

export function useAgents() {
  return useApi<Agent[]>(() => apiService.getAgents(), []);
}

export function useDashboardStats() {
  return useApi<DashboardStats>(() => apiService.getDashboardStats(), []);
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('vexel_token')
  );
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          apiService.setToken(token);
          const result = await apiService.verifyToken();
          if (result.valid) {
            setUser(result.user);
          } else {
            setToken(null);
            localStorage.removeItem('vexel_token');
          }
        } catch (err) {
          setToken(null);
          localStorage.removeItem('vexel_token');
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = useCallback(async (userId: string, role: string) => {
    try {
      const result = await apiService.login(userId, role);
      setToken(result.token);
      setUser(result.user);
      localStorage.setItem('vexel_token', result.token);
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vexel_token');
  }, []);

  return { token, user, loading, login, logout, isAuthenticated: !!token };
}
