import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../../api/client';
import { setToken, getToken, removeToken } from '../token';

describe('Authentication Flow', () => {
  beforeEach(() => {
    removeToken();
    vi.restoreAllMocks();
  });

  it('proves the authentication chain: login -> credential established -> me -> authenticated', async () => {
    // 1. Mock fetch with real Response objects
    const fetchMock = vi.fn().mockImplementation(async (url: string | URL | Request, config?: RequestInit) => {
      const urlStr = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;
      if (urlStr.includes('/api/auth/login/')) {
        return new Response(JSON.stringify({ key: 'test-token-123' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (urlStr.includes('/api/accounts/me/')) {
        const requestHeaders = config?.headers ? new Headers(config.headers) : new Headers();
        let authHeader = requestHeaders.get('Authorization');
        if (url instanceof Request) {
          authHeader = url.headers.get('Authorization') || authHeader;
        }
        
        if (authHeader === 'Token test-token-123') {
          return new Response(JSON.stringify({ id: 1, username: 'testuser' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        return new Response(JSON.stringify({ detail: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ detail: 'Not Found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchMock);

    // 2. Perform Login POST
    const { data: loginResponse } = await apiClient.POST('/api/auth/login/', {
      body: { username: 'testuser', password: 'password' },
    });

    expect(loginResponse?.key).toBe('test-token-123');

    // 3. Establish credential/session
    if (loginResponse?.key) {
      setToken(loginResponse.key);
    }
    expect(getToken()).toBe('test-token-123');

    // 4. Perform GET /api/accounts/me/
    const { data: meResponse } = await apiClient.GET('/api/accounts/me/');

    // 5. Authenticated user returned
    expect(meResponse?.username).toBe('testuser');

    // 6. Verify fetch was called with the correct headers
    const meCall = fetchMock.mock.calls.find((call) => {
      const u = call[0];
      const s = typeof u === 'string' ? u : u instanceof URL ? u.href : u.url;
      return s.includes('/api/accounts/me/');
    });
    expect(meCall).toBeDefined();
    let meCallAuthHeader = '';
    if (meCall && meCall[0] instanceof Request) {
      meCallAuthHeader = meCall[0].headers.get('Authorization') || '';
    } else if (meCall) {
      meCallAuthHeader = new Headers(meCall[1]?.headers).get('Authorization') || '';
    }
    expect(meCallAuthHeader).toBe('Token test-token-123');
  });

  it('clears auth state on logout', () => {
    setToken('test-token-123');
    expect(getToken()).toBe('test-token-123');

    removeToken();
    expect(getToken()).toBeNull();
  });
});
