import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterPage from '../register/page';
import LoginPage from '../login/page';
import * as AuthProvider from '@/lib/auth/auth-provider';

const pushMock = vi.fn();
let searchParamsMock: string | null = null;

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({
    get: (key: string) => {
      if (key === 'returnUrl') return searchParamsMock;
      return null;
    },
  }),
}));

describe('Auth Redirects', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    searchParamsMock = null;
  });

  describe('Register Page', () => {
    it('redirects to /app/dashboard when already authenticated', async () => {
      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 1, username: 'testuser' },
        isLoading: false,
        refreshAuth: vi.fn(),
      } as ReturnType<typeof AuthProvider.useAuth>);

      render(<RegisterPage />);

      await waitFor(() => {
        expect(pushMock).toHaveBeenCalledWith('/app/dashboard');
      });
    });
  });

  describe('Login Page', () => {
    it('redirects to /app/dashboard when authenticated and no returnUrl', async () => {
      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 1, username: 'testuser' },
        isLoading: false,
        refreshAuth: vi.fn(),
      } as ReturnType<typeof AuthProvider.useAuth>);

      render(<LoginPage />);

      await waitFor(() => {
        expect(pushMock).toHaveBeenCalledWith('/app/dashboard');
      });
    });

    it('redirects to internal returnUrl when authenticated', async () => {
      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 1, username: 'testuser' },
        isLoading: false,
        refreshAuth: vi.fn(),
      } as ReturnType<typeof AuthProvider.useAuth>);
      searchParamsMock = '/app/students';

      render(<LoginPage />);

      await waitFor(() => {
        expect(pushMock).toHaveBeenCalledWith('/app/students');
      });
    });

    it('ignores external returnUrl and redirects to /app/dashboard', async () => {
      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 1, username: 'testuser' },
        isLoading: false,
        refreshAuth: vi.fn(),
      } as ReturnType<typeof AuthProvider.useAuth>);
      searchParamsMock = 'https://malicious.com/app';

      render(<LoginPage />);

      await waitFor(() => {
        expect(pushMock).toHaveBeenCalledWith('/app/dashboard');
      });
    });
  });
});
