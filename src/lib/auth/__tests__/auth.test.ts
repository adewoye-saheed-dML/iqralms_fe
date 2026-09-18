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
    const fetchMock = vi.fn().mockImplementation(async (url: string | URL | Request, config?: RequestInit) => {
      const urlStr = url.toString();
      if (urlStr.includes('/api/auth/login/')) {
        return {
          ok: true,
          status: 200,
          clone: () => ({ json: async () => ({ key: 'test-token-123' }) }),
          json: async () => ({ key: 'test-token-123' }),
          headers: new Headers(),
        } as unknown as Response;
      }
      if (urlStr.includes('/api/accounts/me/')) {
        // Only succeed if the token is passed
        const requestHeaders = config?.headers ? new Headers(config.headers) : new Headers();
        // Since we are mocking fetch, the middleware would have set the header on the Request object 
        // if it used new Request(), but openapi-fetch modifies the request headers natively.
        // Actually we need to check request headers from Request object or config.
        let authHeader = requestHeaders.get('Authorization');
        if (url instanceof Request) {
          authHeader = url.headers.get('Authorization') || authHeader;
        }
        
        if (authHeader === 'Token test-token-123') {
          return {
            ok: true,
            status: 200,
            clone: () => ({ json: async () => ({ id: 1, username: 'testuser' }) }),
            json: async () => ({ id: 1, username: 'testuser' }),
            headers: new Headers(),
          } as unknown as Response;
        }
        return {
          ok: false,
          status: 401,
          clone: () => ({ json: async () => ({ detail: 'Unauthorized' }) }),
          json: async () => ({ detail: 'Unauthorized' }),
          headers: new Headers(),
        } as unknown as Response;
      }
      return { 
        ok: false, 
        status: 404, 
        clone: () => ({ json: async () => ({}) }),
        json: async () => ({}),
        headers: new Headers(),
      } as unknown as Response;
    });
    vi.stubGlobal('fetch', fetchMock);

    // 2. Perform Login POST
    const { data: loginResponse } = await apiClient.POST('/api/auth/login/', {
      body: { username: 'testuser', password: 'password' },
    });

    // @ts-ignore
    expect(loginResponse.key).toBe('test-token-123');

    // 3. Establish credential/session
    setToken(loginResponse?.key!);
    expect(getToken()).toBe('test-token-123');

    // 4. Perform GET /api/accounts/me/
    const { data: meResponse } = await apiClient.GET('/api/accounts/me/');

    // 5. Authenticated user returned
    expect(meResponse?.username).toBe('testuser');

    // 6. Verify fetch was called with the correct headers
    const meCall = fetchMock.mock.calls.find((call) =>
      call[0].toString().includes('/api/accounts/me/')
    );
    expect(meCall).toBeDefined();
    let meCallAuthHeader = '';
    if (meCall[0] instanceof Request) {
      meCallAuthHeader = meCall[0].headers.get('Authorization') || '';
    } else {
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
