import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invitationsApi } from '../invitations';
import { apiClient } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
}));

describe('invitationsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    it('calls GET with organization path and returns invitations', async () => {
      const mockInvitations = [
        {
          id: 1,
          email: 'teacher@example.com',
          role: 'teacher',
          status: 'pending',
          expires_at: '2026-10-01T00:00:00Z',
          created_at: '2026-09-20T00:00:00Z',
          email_delivery_status: 'delivered',
        },
      ];
      vi.mocked(apiClient.GET).mockResolvedValueOnce({ data: mockInvitations } as any);

      const result = await invitationsApi.list(10);

      expect(apiClient.GET).toHaveBeenCalledWith(
        '/api/organizations/{organization_pk}/invitations/',
        { params: { path: { organization_pk: 10 } } },
      );
      expect(result).toEqual(mockInvitations);
    });

    it('returns empty array when data is null', async () => {
      vi.mocked(apiClient.GET).mockResolvedValueOnce({ data: null } as any);

      const result = await invitationsApi.list(10);
      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('calls POST to create invitation', async () => {
      const mockCreated = {
        id: 2,
        email: 'teacher@example.com',
        role: 'teacher' as const,
        status: 'pending' as const,
        expires_at: '2026-10-01T00:00:00Z',
        created_at: '2026-09-20T00:00:00Z',
        email_delivery_status: 'pending',
      };
      vi.mocked(apiClient.POST).mockResolvedValueOnce({ data: mockCreated } as any);

      const result = await invitationsApi.create(10, {
        email: 'teacher@example.com',
        role: 'teacher',
      });

      expect(apiClient.POST).toHaveBeenCalledWith(
        '/api/organizations/{organization_pk}/invitations/',
        {
          params: { path: { organization_pk: 10 } },
          body: { email: 'teacher@example.com', role: 'teacher' },
        },
      );
      expect(result).toEqual(mockCreated);
    });

    it('throws error when response data is null', async () => {
      vi.mocked(apiClient.POST).mockResolvedValueOnce({ data: null } as any);

      await expect(
        invitationsApi.create(10, { email: 'test@example.com', role: 'teacher' }),
      ).rejects.toThrow('Failed to create invitation');
    });
  });

  describe('accept', () => {
    it('calls POST to accept invitation', async () => {
      const mockMembership = {
        id: 5,
        role: 'teacher' as const,
        status: 'active' as const,
      };
      vi.mocked(apiClient.POST).mockResolvedValueOnce({ data: mockMembership } as any);

      const result = await invitationsApi.accept(10, { token: 'token-123' });

      expect(apiClient.POST).toHaveBeenCalledWith(
        '/api/organizations/{organization_pk}/invitations/accept/',
        {
          params: { path: { organization_pk: 10 } },
          body: { token: 'token-123' },
        },
      );
      expect(result).toEqual(mockMembership);
    });
  });

  describe('preview', () => {
    it('calls GET to preview invitation with token query parameter', async () => {
      const mockPreview = {
        organization_id: 10,
        organization_name: 'Test Academy',
        role: 'teacher',
        status: 'pending',
        expires_at: '2026-10-01T00:00:00Z',
        email: 'teacher@example.com',
      };
      vi.mocked(apiClient.GET).mockResolvedValueOnce({ data: mockPreview } as any);

      const result = await invitationsApi.preview(10, 'token-123');

      expect(apiClient.GET).toHaveBeenCalledWith(
        '/api/organizations/{organization_pk}/invitations/preview/',
        {
          params: {
            path: { organization_pk: 10 },
            query: { token: 'token-123' },
          },
        },
      );
      expect(result).toEqual(mockPreview);
    });

    it('throws error when preview data is null', async () => {
      vi.mocked(apiClient.GET).mockResolvedValueOnce({ data: null } as any);

      await expect(invitationsApi.preview(10, 'token-123')).rejects.toThrow(
        'Failed to load invitation preview',
      );
    });
  });

  describe('register', () => {
    it('calls POST to register and accept invitation in one step', async () => {
      const mockResponse = {
        key: 'drf-auth-token-key-abc',
        user: { id: 7, email: 'teacher@example.com', username: 'teacher' } as any,
        membership: { id: 12, role: 'teacher' as const, status: 'active' as const } as any,
        detail: 'Account created and invitation accepted.',
      };
      vi.mocked(apiClient.POST).mockResolvedValueOnce({ data: mockResponse } as any);

      const registerBody = {
        token: 'token-123',
        first_name: 'Jane',
        last_name: 'Doe',
        password: 'SecurePassword123!',
        timezone: 'Africa/Lagos',
      };

      const result = await invitationsApi.register(10, registerBody);

      expect(apiClient.POST).toHaveBeenCalledWith(
        '/api/organizations/{organization_pk}/invitations/register/',
        {
          params: { path: { organization_pk: 10 } },
          body: registerBody,
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it('throws error when register data is null', async () => {
      vi.mocked(apiClient.POST).mockResolvedValueOnce({ data: null } as any);

      await expect(
        invitationsApi.register(10, {
          token: 'token-123',
          first_name: 'Jane',
          last_name: 'Doe',
          password: 'Password123!',
          timezone: 'UTC',
        }),
      ).rejects.toThrow('Failed to register and accept invitation');
    });
  });

  describe('resend', () => {
    it('calls POST to resend invitation', async () => {
      const mockInvitation = { id: 3 } as any;
      vi.mocked(apiClient.POST).mockResolvedValueOnce({ data: mockInvitation });

      const result = await invitationsApi.resend(10, 3);
      expect(apiClient.POST).toHaveBeenCalledWith(
        '/api/organizations/{organization_pk}/invitations/{id}/resend/',
        { params: { path: { organization_pk: 10, id: 3 } } },
      );
      expect(result).toEqual(mockInvitation);
    });
  });

  describe('revoke', () => {
    it('calls POST to revoke invitation', async () => {
      const mockInvitation = { id: 3 } as any;
      vi.mocked(apiClient.POST).mockResolvedValueOnce({ data: mockInvitation });

      const result = await invitationsApi.revoke(10, 3);
      expect(apiClient.POST).toHaveBeenCalledWith(
        '/api/organizations/{organization_pk}/invitations/{id}/revoke/',
        { params: { path: { organization_pk: 10, id: 3 } } },
      );
      expect(result).toEqual(mockInvitation);
    });
  });
});
