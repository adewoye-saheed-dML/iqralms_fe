import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

export interface PasswordResetPayload {
  email: string;
}

export interface PasswordResetConfirmPayload {
  uid: string;
  token: string;
  new_password1: string;
  new_password2: string;
}

export const passwordResetApi = {
  async requestReset(email: string): Promise<{ detail: string }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost')}/api/auth/password/reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorMsg =
          typeof data === 'object' && data !== null
            ? (data as Record<string, unknown>).detail ||
              (data as Record<string, unknown>).email ||
              (data as Record<string, unknown>).non_field_errors ||
              'Unable to process password reset request.'
            : 'Unable to process password reset request.';
        throw new ApiError(response.status, Array.isArray(errorMsg) ? errorMsg.join(' ') : String(errorMsg), data);
      }

      return {
        detail:
          (data as { detail?: string })?.detail ||
          'Password reset e-mail has been sent.',
      };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, 'Network error. Please try again.', err);
    }
  },

  async confirmReset(payload: PasswordResetConfirmPayload): Promise<{ detail: string }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost')}/api/auth/password/reset/confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorMsg =
          typeof data === 'object' && data !== null
            ? (data as Record<string, unknown>).detail ||
              (data as Record<string, unknown>).new_password1 ||
              (data as Record<string, unknown>).token ||
              (data as Record<string, unknown>).non_field_errors ||
              'Password reset failed. The link may have expired or is invalid.'
            : 'Password reset failed. The link may have expired or is invalid.';
        throw new ApiError(response.status, Array.isArray(errorMsg) ? errorMsg.join(' ') : String(errorMsg), data);
      }

      return {
        detail:
          (data as { detail?: string })?.detail ||
          'Password has been reset with the new password.',
      };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, 'Network error. Please try again.', err);
    }
  },
};
