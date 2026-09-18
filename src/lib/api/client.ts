import createClient, { Middleware } from 'openapi-fetch';
import type { paths } from './schema';
import { getToken } from '@/lib/auth/token';
import { ApiError } from './errors';

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
        throw new ApiError(response.status, response.statusText);
      }
      
      const errorData = data as Record<string, unknown>;
      const detail = typeof errorData?.detail === 'string' ? errorData.detail : response.statusText;
      throw new ApiError(response.status, detail, data);
    }
    return response;
  }
};

export const apiClient = createClient<paths>({ baseUrl: API_BASE_URL });
apiClient.use(authAndErrorMiddleware);
