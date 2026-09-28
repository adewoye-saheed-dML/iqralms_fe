import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordPage from '../forgot-password/page';
import ResetPasswordPage from '../reset-password/page';
import { passwordResetApi } from '@/features/auth/api/password-reset';

// Mock next/navigation
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock('@/features/auth/api/password-reset', () => ({
  passwordResetApi: {
    requestReset: vi.fn(),
    confirmReset: vi.fn(),
  },
}));

describe('Password Reset Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  describe('ForgotPasswordPage', () => {
    it('renders the forgot password form', () => {
      render(<ForgotPasswordPage />);
      expect(screen.getByText('Forgot password?')).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset instructions/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /back to sign in/i })).toHaveAttribute('href', '/login');
    });

    it('submits email and displays success instructions', async () => {
      vi.mocked(passwordResetApi.requestReset).mockResolvedValue({
        detail: 'Password reset e-mail has been sent.',
      });

      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

      const submitBtn = screen.getByRole('button', { name: /send reset instructions/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(passwordResetApi.requestReset).toHaveBeenCalledWith('user@example.com');
        expect(screen.getByText('Reset instructions sent')).toBeInTheDocument();
        expect(screen.getByText(/user@example.com/i)).toBeInTheDocument();
      });
    });

    it('displays error if request fails', async () => {
      vi.mocked(passwordResetApi.requestReset).mockRejectedValue(new Error('Network error. Please try again.'));

      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });

      const submitBtn = screen.getByRole('button', { name: /send reset instructions/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Network error. Please try again.')).toBeInTheDocument();
      });
    });
  });

  describe('ResetPasswordPage', () => {
    it('shows alert when uid or token are missing in search params', () => {
      mockSearchParams = new URLSearchParams();
      render(<ResetPasswordPage />);

      expect(screen.getByText('Missing or Invalid Reset Link')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /request new reset link/i })).toHaveAttribute(
        'href',
        '/forgot-password'
      );
    });

    it('renders password input fields when uid and token exist', () => {
      mockSearchParams = new URLSearchParams('uid=Mg&token=cctj10-12345');
      render(<ResetPasswordPage />);

      expect(screen.getByLabelText(/^new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save new password/i })).toBeInTheDocument();
    });

    it('validates password mismatch before calling api', async () => {
      mockSearchParams = new URLSearchParams('uid=Mg&token=cctj10-12345');
      render(<ResetPasswordPage />);

      const passInput = screen.getByLabelText(/^new password/i);
      const confirmInput = screen.getByLabelText(/confirm new password/i);

      fireEvent.change(passInput, { target: { value: 'password123' } });
      fireEvent.change(confirmInput, { target: { value: 'differentpassword' } });

      const submitBtn = screen.getByRole('button', { name: /save new password/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
        expect(passwordResetApi.confirmReset).not.toHaveBeenCalled();
      });
    });

    it('submits successfully and redirects to login', async () => {
      mockSearchParams = new URLSearchParams('uid=Mg&token=cctj10-12345');
      vi.mocked(passwordResetApi.confirmReset).mockResolvedValue({
        detail: 'Password has been reset with the new password.',
      });

      render(<ResetPasswordPage />);

      const passInput = screen.getByLabelText(/^new password/i);
      const confirmInput = screen.getByLabelText(/confirm new password/i);

      fireEvent.change(passInput, { target: { value: 'SecurePass123!' } });
      fireEvent.change(confirmInput, { target: { value: 'SecurePass123!' } });

      const submitBtn = screen.getByRole('button', { name: /save new password/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(passwordResetApi.confirmReset).toHaveBeenCalledWith({
          uid: 'Mg',
          token: 'cctj10-12345',
          new_password1: 'SecurePass123!',
          new_password2: 'SecurePass123!',
        });
        expect(screen.getByText('Password Reset Successfully')).toBeInTheDocument();
      });
    });
  });
});
