import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../auth-provider';
import { apiClient } from '@/lib/api/client';
import { setToken, getToken, removeToken } from '../token';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/errors';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

function TestComponent() {
  const { user, isLoading, login, logout } = useAuth();
  if (isLoading) return <div>Loading...</div>;
  if (!user) {
    return (
      <div>
        <div>Not Logged In</div>
        <button onClick={() => login({ username: 'test', password: 'password' }).catch(() => {})}>Login</button>
      </div>
    );
  }
  return (
    <div>
      <div>Logged in as {user.username}</div>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    removeToken();
    queryClient.clear();
  });

  const renderAuth = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    );

  it('bootstraps current user successfully', async () => {
    vi.mocked(apiClient.GET).mockResolvedValueOnce({ data: { id: 1, username: 'testuser' } } as any);
    renderAuth();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Logged in as testuser')).toBeInTheDocument();
    });
  });

  it('handles invalid auth (401) during bootstrap by returning null user', async () => {
    vi.mocked(apiClient.GET).mockRejectedValueOnce(new ApiError(401, 'Unauthorized'));
    renderAuth();
    
    await waitFor(() => {
      expect(screen.getByText('Not Logged In')).toBeInTheDocument();
    });
  });

  it('handles forbidden (403) during bootstrap by returning null user', async () => {
    vi.mocked(apiClient.GET).mockRejectedValueOnce(new ApiError(403, 'Forbidden'));
    renderAuth();
    
    await waitFor(() => {
      expect(screen.getByText('Not Logged In')).toBeInTheDocument();
    });
  });

  it('performs successful login', async () => {
    vi.mocked(apiClient.GET).mockRejectedValueOnce(new ApiError(401, 'Unauthorized')); // Initial load fails
    renderAuth();
    
    await waitFor(() => {
      expect(screen.getByText('Not Logged In')).toBeInTheDocument();
    });

    vi.mocked(apiClient.POST).mockResolvedValueOnce({ data: { key: 'new-token-123' } } as any);
    vi.mocked(apiClient.GET).mockResolvedValueOnce({ data: { id: 1, username: 'newuser' } } as any); // Post-login fetch

    act(() => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(apiClient.POST).toHaveBeenCalledWith('/api/auth/login/', {
        body: { username: 'test', password: 'password' },
      });
      expect(getToken()).toBe('new-token-123');
      expect(screen.getByText('Logged in as newuser')).toBeInTheDocument();
    });
  });

  it('handles invalid login', async () => {
    vi.mocked(apiClient.GET).mockRejectedValueOnce(new ApiError(401, 'Unauthorized'));
    renderAuth();
    
    await waitFor(() => {
      expect(screen.getByText('Not Logged In')).toBeInTheDocument();
    });

    vi.mocked(apiClient.POST).mockRejectedValueOnce(new ApiError(400, 'Invalid credentials'));

    act(() => {
      screen.getByText('Login').click();
    });

    // Token should not be set
    await waitFor(() => {
      expect(getToken()).toBeNull();
    });
  });

  it('performs logout and clears state', async () => {
    vi.mocked(apiClient.GET).mockResolvedValueOnce({ data: { id: 1, username: 'testuser' } } as any);
    setToken('some-token');
    renderAuth();

    await waitFor(() => {
      expect(screen.getByText('Logged in as testuser')).toBeInTheDocument();
    });

    vi.mocked(apiClient.POST).mockResolvedValueOnce({ data: {} } as any);
    
    act(() => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(apiClient.POST).toHaveBeenCalledWith('/api/auth/logout/');
      expect(getToken()).toBeNull();
      expect(screen.getByText('Not Logged In')).toBeInTheDocument();
    });
  });
});
