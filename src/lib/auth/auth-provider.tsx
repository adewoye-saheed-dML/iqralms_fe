'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { components } from '@/lib/api/schema';

type User = components['schemas']['User'];

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const {
    data: user = null,
    isLoading,
    error,
  } = useQuery<User | null, Error>({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      try {
        return await apiClient.get<User>('/api/accounts/me/');
      } catch (err: unknown) {
        // If 401/403, we return null rather than throw
        const apiErr = err as { status?: number };
        if (apiErr?.status === 401 || apiErr?.status === 403) {
          return null;
        }
        throw err;
      }
    },
  });

  const logout = React.useCallback(async () => {
    // Assuming backend clears cookie on this endpoint
    try {
      await apiClient.post('/api/auth/logout/');
    } catch {
      // Ignore errors on logout
    }
    queryClient.setQueryData(['auth', 'user'], null);
    queryClient.invalidateQueries();
  }, [queryClient]);

  const refreshAuth = React.useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
  }, [queryClient]);

  const value = React.useMemo(
    () => ({
      user,
      isLoading,
      error,
      logout,
      refreshAuth,
    }),
    [user, isLoading, error, logout, refreshAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
