const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token =
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    sessionStorage.getItem(TOKEN_KEY) ||
    sessionStorage.getItem('token') ||
    sessionStorage.getItem('access_token');
  
  if (!token || token === 'undefined' || token === 'null') {
    return null;
  }
  return token;
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem('access_token');
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('access_token');
}

