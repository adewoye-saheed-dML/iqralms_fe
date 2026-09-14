import { ApiError } from './errors';
import { getToken } from '@/lib/auth/token';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

type RequestConfig = Omit<RequestInit, 'body'> & {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
};

async function fetchClient<T>(
  endpoint: string,
  { body, params, headers, ...customConfig }: RequestConfig = {}
): Promise<T> {
  // Use window.location.origin in browser, or http://localhost in test/SSR
  const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  const url = new URL(`${API_BASE_URL}${endpoint}`, base);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const token = getToken();

  const config: RequestInit = {
    ...customConfig,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...headers,
    },
  };

  // Handle token or cookie auth if needed here
  // For cookies (which Django commonly uses for session auth), we must include credentials
  config.credentials = 'include';

  if (body) {
    config.body = JSON.stringify(body);
  }

  // Extract CSRF token from cookies for mutating requests
  if (config.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method.toUpperCase())) {
    if (typeof document !== 'undefined') {
      const csrfCookie = document.cookie.split('; ').find((row) => row.startsWith('csrftoken='));
      if (csrfCookie) {
        const csrfToken = csrfCookie.split('=')[1];
        (config.headers as Record<string, string>)['X-CSRFToken'] = csrfToken;
      }
    }
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), config);
  } catch {
    throw new Error('Network error');
  }

  if (response.status === 204) {
    return {} as T;
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
    }
    return {} as T;
  }

  if (!response.ok) {
    const errorData = data as Record<string, unknown>;
    const detail = typeof errorData?.detail === 'string' ? errorData.detail : response.statusText;
    throw new ApiError(response.status, detail, data);
  }

  return data as T;
}

export const apiClient = {
  get: <T>(endpoint: string, config?: Omit<RequestConfig, 'method'>) =>
    fetchClient<T>(endpoint, { ...config, method: 'GET' }),
  post: <T>(endpoint: string, config?: Omit<RequestConfig, 'method'>) =>
    fetchClient<T>(endpoint, { ...config, method: 'POST' }),
  put: <T>(endpoint: string, config?: Omit<RequestConfig, 'method'>) =>
    fetchClient<T>(endpoint, { ...config, method: 'PUT' }),
  patch: <T>(endpoint: string, config?: Omit<RequestConfig, 'method'>) =>
    fetchClient<T>(endpoint, { ...config, method: 'PATCH' }),
  delete: <T>(endpoint: string, config?: Omit<RequestConfig, 'method'>) =>
    fetchClient<T>(endpoint, { ...config, method: 'DELETE' }),
};
