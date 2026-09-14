import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../api/client';
import { setToken, getToken, removeToken } from '../token';

describe('Authentication Flow', () => {
  beforeEach(() => {
    removeToken();
    vi.restoreAllMocks();
  });

  it('proves the authentication chain: login -> credential established -> me -> authenticated', async () => {
    // 1. Mock fetch for the whole chain
    const fetchMock = vi.fn().mockImplementation(async (url: string, config: RequestInit) => {
      if (url.includes('/api/auth/login/')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ key: 'test-token-123' }),
        };
      }
      if (url.includes('/api/accounts/me/')) {
        // Only succeed if the token is passed
        const authHeader = (config.headers as Record<string, string>)?.['Authorization'];
        if (authHeader === 'Token test-token-123') {
          return {
            ok: true,
            status: 200,
            json: async () => ({ id: 1, username: 'testuser' }),
          };
        }
        return {
          ok: false,
          status: 401,
          json: async () => ({ detail: 'Unauthorized' }),
        };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    });
    vi.stubGlobal('fetch', fetchMock);

    // 2. Perform Login POST
    const loginResponse = await apiClient.post<{ key: string }>('/api/auth/login/', {
      body: { username: 'testuser', password: 'password' },
    });

    expect(loginResponse.key).toBe('test-token-123');

    // 3. Establish credential/session
    setToken(loginResponse.key);
    expect(getToken()).toBe('test-token-123');

    // 4. Perform GET /api/accounts/me/
    const meResponse = await apiClient.get<{ id: number; username: string }>('/api/accounts/me/');

    // 5. Authenticated user returned
    expect(meResponse.username).toBe('testuser');

    // 6. Verify fetch was called with the correct headers
    const meCallConfig = fetchMock.mock.calls.find((call) =>
      call[0].includes('/api/accounts/me/')
    )[1];
    expect(meCallConfig.headers['Authorization']).toBe('Token test-token-123');
  });

  it('clears auth state on logout', () => {
    setToken('test-token-123');
    expect(getToken()).toBe('test-token-123');

    removeToken();
    expect(getToken()).toBeNull();
  });
});
