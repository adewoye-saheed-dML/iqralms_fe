import createClient, { Middleware } from 'openapi-fetch';
import type { paths } from './schema';
import { getToken, removeToken } from '@/lib/auth/token';
import { ApiError, normalizeErrorMessage } from './errors';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost');

const authAndErrorMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = getToken();
    if (token) {
      request.headers.set('Authorization', `Token ${token}`);
    }
    request.headers.set('Accept', 'application/json');
    return request;
  },
  async onResponse({ response }) {
    if (!response.ok) {
      let data: unknown;
      try {
        data = await response.clone().json();
      } catch {
        try {
          data = await response.clone().text();
        } catch {
          data = undefined;
        }
      }

      // If 401 Unauthorized, ensure stale/invalid token is removed from storage
      if (response.status === 401) {
        removeToken();
      }

      const message = normalizeErrorMessage(response.status, data, response.statusText);
      throw new ApiError(response.status, message, data);
    }
    return response;
  }
};

export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
  fetch: (input: Request) => fetch(input),
});
apiClient.use(authAndErrorMiddleware);
