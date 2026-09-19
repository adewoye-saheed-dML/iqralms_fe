'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { components } from '@/lib/api/schema';
import { setToken, removeToken } from '@/lib/auth/token';
import { ApiError } from '@/lib/api/errors';

type User = components['schemas']['User'];
type LoginParams = components['schemas']['Login'];
type RegisterParams = components['schemas']['Register'];

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (credentials: LoginParams) => Promise<void>;
  register: (data: RegisterParams) => Promise<void>;
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
        const { data, error: apiErr } = await apiClient.GET('/api/accounts/me/');
        // openapi-fetch will not throw on 4xx/5xx by default if we don't have middleware that throws. 
        // Wait, our middleware THROWS on !response.ok! So it will throw an ApiError.
        if (apiErr) {
           throw apiErr;
        }
        return data as User;
      } catch (err: unknown) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          removeToken();
          return null;
        }
        throw err;
      }
    },
  });

  const login = React.useCallback(async (credentials: LoginParams) => {
    const { data } = await apiClient.POST('/api/auth/login/', {
      body: credentials,
    });
    const key = data?.key; // login returns Token with key: string
    if (key) {
      setToken(key);
      await queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
    }
  }, [queryClient]);

  const register = React.useCallback(async (data: RegisterParams) => {
    await apiClient.POST('/api/auth/register/', {
      body: data,
    });
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await apiClient.POST('/api/auth/logout/');
    } catch {
      // Ignore errors on logout
    }
    removeToken();
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
      login,
      register,
      logout,
      refreshAuth,
    }),
    [user, isLoading, error, login, register, logout, refreshAuth]
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
