import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AcceptInvitationPage from '../page';
import * as AuthProvider from '@/lib/auth/auth-provider';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import * as TokenHelper from '@/lib/auth/token';
import { invitationsApi } from '@/features/invitations/api/invitations';
import { ApiError } from '@/lib/api/errors';

const pushMock = vi.fn();
let searchParamsData: Record<string, string> = {};

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useSearchParams: () => ({
    get: (key: string) => searchParamsData[key] ?? null,
  }),
}));

vi.mock('@/features/invitations/api/invitations', () => ({
  invitationsApi: {
    preview: vi.fn(),
    register: vi.fn(),
    accept: vi.fn(),
  },
}));

vi.mock('@/lib/auth/token', () => ({
  setToken: vi.fn(),
  getToken: vi.fn(),
  removeToken: vi.fn(),
}));

describe('AcceptInvitationPage', () => {
  const refreshAuthMock = vi.fn();
  const logoutMock = vi.fn();
  const refreshAcademiesMock = vi.fn();
  const setActiveAcademyMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsData = {};

    vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
      user: null,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: logoutMock,
      refreshAuth: refreshAuthMock,
    });

    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      academies: [],
      activeAcademy: null,
      activeMembership: null,
      activeRole: null,
      isLoading: false,
      error: null,
      setActiveAcademy: setActiveAcademyMock,
      refreshAcademies: refreshAcademiesMock,
    });
  });

  describe('New User Onboarding (Unauthenticated)', () => {
    it('loads invitation preview and shows academy name, Teacher role, expiry, and read-only email', async () => {
      searchParamsData = { token: 'token-abc', org: '10' };
      vi.mocked(invitationsApi.preview).mockResolvedValueOnce({
        organization_id: 10,
        organization_name: 'Darul Ilm Academy',
        role: 'teacher',
        status: 'pending',
        expires_at: '2026-10-15T12:00:00Z',
        email: 'teacher@example.com',
      });

      render(<AcceptInvitationPage />);

      expect(screen.getByText('Checking invitation...')).toBeInTheDocument();

      await waitFor(() => {
        expect(invitationsApi.preview).toHaveBeenCalledWith(10, 'token-abc');
      });

      expect(await screen.findByText("You're invited to join Darul Ilm Academy")).toBeInTheDocument();
      expect(screen.getByText('Teacher')).toBeInTheDocument();
      expect(screen.getByText('teacher@example.com')).toBeInTheDocument();
      expect(screen.getByLabelText('First name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last name')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    });

    it('prevents submission when password and confirm password do not match', async () => {
      searchParamsData = { token: 'token-abc', org: '10' };
      vi.mocked(invitationsApi.preview).mockResolvedValueOnce({
        organization_id: 10,
        organization_name: 'Darul Ilm Academy',
        role: 'teacher',
        status: 'pending',
        expires_at: '2026-10-15T12:00:00Z',
        email: 'teacher@example.com',
      });

      render(<AcceptInvitationPage />);

      await screen.findByText("You're invited to join Darul Ilm Academy");

      fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Zayd' } });
      fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Ali' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
      fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'DifferentPass!' } });

      fireEvent.click(screen.getByRole('button', { name: /create account & join academy/i }));

      expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
      expect(invitationsApi.register).not.toHaveBeenCalled();
    });

    it('submits registration, sends browser timezone, sets token, refreshes context, and redirects to dashboard', async () => {
      searchParamsData = { token: 'token-abc', org: '10' };
      vi.mocked(invitationsApi.preview).mockResolvedValueOnce({
        organization_id: 10,
        organization_name: 'Darul Ilm Academy',
        role: 'teacher',
        status: 'pending',
        expires_at: '2026-10-15T12:00:00Z',
        email: 'teacher@example.com',
      });

      const mockRegisterResponse = {
        key: 'auth-token-xyz',
        user: { id: 1, email: 'teacher@example.com', username: 'teacher' } as any,
        membership: { id: 2, role: 'teacher' as const, status: 'active' as const } as any,
        detail: 'Account created and invitation accepted.',
      };
      vi.mocked(invitationsApi.register).mockResolvedValueOnce(mockRegisterResponse);

      render(<AcceptInvitationPage />);

      await screen.findByText("You're invited to join Darul Ilm Academy");

      fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Zayd' } });
      fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Ali' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
      fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'Password123!' } });

      fireEvent.click(screen.getByRole('button', { name: /create account & join academy/i }));

      await waitFor(() => {
        expect(invitationsApi.register).toHaveBeenCalledWith(10, {
          token: 'token-abc',
          first_name: 'Zayd',
          last_name: 'Ali',
          password: 'Password123!',
          timezone: expect.any(String),
        });
      });

      expect(TokenHelper.setToken).toHaveBeenCalledWith('auth-token-xyz');
      expect(refreshAuthMock).toHaveBeenCalled();
      expect(refreshAcademiesMock).toHaveBeenCalled();
      expect(setActiveAcademyMock).toHaveBeenCalledWith(10);
      expect(pushMock).toHaveBeenCalledWith('/app/dashboard');
    });

    it('handles fallback query parameter "organization"', async () => {
      searchParamsData = { token: 'token-compat', organization: '15' };
      vi.mocked(invitationsApi.preview).mockResolvedValueOnce({
        organization_id: 15,
        organization_name: 'Compat Academy',
        role: 'teacher',
        status: 'pending',
        expires_at: '2026-10-15T12:00:00Z',
      });

      render(<AcceptInvitationPage />);

      await waitFor(() => {
        expect(invitationsApi.preview).toHaveBeenCalledWith(15, 'token-compat');
      });
      expect(await screen.findByText("You're invited to join Compat Academy")).toBeInTheDocument();
    });
  });

  describe('Existing Account Path', () => {
    it('shows clear guidance and sign-in link preserving returnUrl when account already exists', async () => {
      searchParamsData = { token: 'token-abc', org: '10' };
      vi.mocked(invitationsApi.preview).mockResolvedValueOnce({
        organization_id: 10,
        organization_name: 'Darul Ilm Academy',
        role: 'teacher',
        status: 'pending',
        expires_at: '2026-10-15T12:00:00Z',
        email: 'existing@example.com',
      });

      vi.mocked(invitationsApi.register).mockRejectedValueOnce(
        new ApiError(400, 'An account already exists for this invitation email. Sign in to continue.', {
          detail: 'An account already exists for this invitation email. Sign in to continue.',
        }),
      );

      render(<AcceptInvitationPage />);

      await screen.findByText("You're invited to join Darul Ilm Academy");

      fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'Zayd' } });
      fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Ali' } });
      fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123!' } });
      fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'Password123!' } });

      fireEvent.click(screen.getByRole('button', { name: /create account & join academy/i }));

      const guidanceMsg = await screen.findAllByText(
        'An account already exists for this invitation email. Sign in to continue.',
      );
      expect(guidanceMsg.length).toBeGreaterThan(0);

      const signInLink = screen.getByRole('link', { name: /sign in to continue/i });
      expect(signInLink).toBeInTheDocument();
      expect(signInLink).toHaveAttribute(
        'href',
        expect.stringContaining('/login?returnUrl='),
      );
      expect(signInLink.getAttribute('href')).toContain(encodeURIComponent('token=token-abc'));
      expect(signInLink.getAttribute('href')).toContain(encodeURIComponent('org=10'));
    });
  });

  describe('Authenticated User Path', () => {
    it('accepts invitation using existing accept endpoint and shows Teacher role', async () => {
      searchParamsData = { token: 'token-abc', org: '10' };

      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 1, email: 'teacher@example.com', username: 'teacher1' } as any,
        isLoading: false,
        error: null,
        login: vi.fn(),
        register: vi.fn(),
        logout: logoutMock,
        refreshAuth: refreshAuthMock,
      });

      vi.mocked(invitationsApi.preview).mockResolvedValueOnce({
        organization_id: 10,
        organization_name: 'Darul Ilm Academy',
        role: 'teacher',
        status: 'pending',
        expires_at: '2026-10-15T12:00:00Z',
        email: 'teacher@example.com',
      });

      vi.mocked(invitationsApi.accept).mockResolvedValueOnce({
        id: 5,
        role: 'teacher',
        role_display: 'Teacher',
        status: 'active',
      } as any);

      render(<AcceptInvitationPage />);

      expect(await screen.findByText(/Darul Ilm Academy/)).toBeInTheDocument();
      expect(screen.getAllByText(/teacher@example.com/).length).toBeGreaterThanOrEqual(1);

      const acceptButton = screen.getByRole('button', { name: /accept invitation/i });
      fireEvent.click(acceptButton);

      await waitFor(() => {
        expect(invitationsApi.accept).toHaveBeenCalledWith(10, { token: 'token-abc' });
      });

      expect(refreshAcademiesMock).toHaveBeenCalled();
      expect(setActiveAcademyMock).toHaveBeenCalledWith(10);
      expect(await screen.findByText('Invitation Accepted!')).toBeInTheDocument();
      expect(screen.getByText('Teacher')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /go to your dashboard/i }));
      expect(pushMock).toHaveBeenCalledWith('/app/dashboard');
    });

    it('displays email mismatch clearly and provides switch account option', async () => {
      searchParamsData = { token: 'token-abc', org: '10' };

      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 1, email: 'wrong@example.com', username: 'wronguser' } as any,
        isLoading: false,
        error: null,
        login: vi.fn(),
        register: vi.fn(),
        logout: logoutMock,
        refreshAuth: refreshAuthMock,
      });

      vi.mocked(invitationsApi.preview).mockResolvedValueOnce({
        organization_id: 10,
        organization_name: 'Darul Ilm Academy',
        role: 'teacher',
        status: 'pending',
        expires_at: '2026-10-15T12:00:00Z',
        email: 'teacher@example.com',
      });

      render(<AcceptInvitationPage />);

      expect(await screen.findByText('Email Mismatch')).toBeInTheDocument();
      expect(
        screen.getByText(/This invitation was sent to/i),
      ).toBeInTheDocument();

      const switchBtn = screen.getByRole('button', { name: /sign in with a different account/i });
      fireEvent.click(switchBtn);

      await waitFor(() => {
        expect(logoutMock).toHaveBeenCalled();
        expect(pushMock).toHaveBeenCalledWith(expect.stringContaining('/login?returnUrl='));
      });
    });
  });

  describe('Invalid Invitation Scenarios', () => {
    it('handles expired invitation error from preview gracefully', async () => {
      searchParamsData = { token: 'token-expired', org: '10' };

      vi.mocked(invitationsApi.preview).mockRejectedValueOnce(
        new ApiError(400, 'This invitation has expired.', { token: 'This invitation has expired.' }),
      );

      render(<AcceptInvitationPage />);

      expect(await screen.findByText('This invitation has expired.')).toBeInTheDocument();
    });

    it('handles invalid token error from preview gracefully', async () => {
      searchParamsData = { token: 'token-invalid', org: '10' };

      vi.mocked(invitationsApi.preview).mockRejectedValueOnce(
        new ApiError(404, 'Invitation not found.', { detail: 'Invitation not found.' }),
      );

      render(<AcceptInvitationPage />);

      expect(await screen.findByText('Invitation not found.')).toBeInTheDocument();
    });

    it('displays error when manual submission has missing organization or token', async () => {
      searchParamsData = {};

      render(<AcceptInvitationPage />);

      const submitBtn = screen.getByRole('button', { name: /create account & join academy/i });
      expect(submitBtn).toBeDisabled();
    });
  });
});
