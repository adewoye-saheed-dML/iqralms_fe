import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import type { components } from '@/lib/api/schema';

export type Invitation = components['schemas']['OrganizationInvitation'];
export type InvitationCreate = components['schemas']['OrganizationInvitationCreate'];
export type InvitationAccept = components['schemas']['OrganizationInvitationAccept'];
export type InvitationPreview = components['schemas']['OrganizationInvitationPreview'] & {
  readonly email?: string;
};
export type InvitationRole = components['schemas']['InvitableOrganizationRoleEnum'];
export type InvitationRegister = Omit<components['schemas']['OrganizationInvitationRegister'], 'username'> & {
  username?: string;
  age?: number;
  parent_email?: string;
};
export type InvitationRegisterResponse = components['schemas']['OrganizationInvitationRegisterResponse'];

export interface BatchInvitationResult {
  successful: Array<{ email: string; invitation: Invitation }>;
  failed: Array<{ email: string; reason: string }>;
}

export function parseEmailList(rawInput: string): {
  valid: string[];
  invalid: string[];
  duplicates: string[];
} {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const tokens = rawInput
    .split(/[\s,;]+/)
    .map((t) => t.trim().replace(/^<|>$/g, '').toLowerCase())
    .filter(Boolean);

  const seen = new Set<string>();
  const valid: string[] = [];
  const invalid: string[] = [];
  const duplicates: string[] = [];

  for (const token of tokens) {
    if (seen.has(token)) {
      if (!duplicates.includes(token)) {
        duplicates.push(token);
      }
      continue;
    }
    seen.add(token);

    if (emailRegex.test(token)) {
      valid.push(token);
    } else {
      invalid.push(token);
    }
  }

  return { valid, invalid, duplicates };
}

export const invitationsApi = {
  list: async (organizationId: number): Promise<Invitation[]> => {
    const { data } = await apiClient.GET(
      '/api/organizations/{organization_pk}/invitations/',
      { params: { path: { organization_pk: organizationId } } },
    );
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object' && Array.isArray((data as { results?: Invitation[] }).results)) {
      return (data as { results: Invitation[] }).results;
    }
    return [];
  },

  create: async (
    organizationId: number,
    body: InvitationCreate,
  ): Promise<Invitation> => {
    const { data } = await apiClient.POST(
      '/api/organizations/{organization_pk}/invitations/',
      {
        params: { path: { organization_pk: organizationId } },
        body,
      },
    );
    if (!data) {
      throw new Error('Failed to create invitation');
    }
    return data;
  },

  createBatch: async (
    organizationId: number,
    emails: string[],
    role: InvitationRole,
    onProgress?: (progress: { completed: number; total: number; currentEmail: string }) => void,
  ): Promise<BatchInvitationResult> => {
    const successful: Array<{ email: string; invitation: Invitation }> = [];
    const failed: Array<{ email: string; reason: string }> = [];

    for (let i = 0; i < emails.length; i++) {
      const email = emails[i].trim();
      onProgress?.({ completed: i, total: emails.length, currentEmail: email });
      try {
        const invitation = await invitationsApi.create(organizationId, { email, role });
        successful.push({ email, invitation });
      } catch (err: unknown) {
        let reason = 'Failed to send invitation';
        if (err instanceof ApiError) {
          reason = err.message || reason;
        } else if (err instanceof Error) {
          reason = err.message;
        }
        failed.push({ email, reason });
      }
    }
    onProgress?.({ completed: emails.length, total: emails.length, currentEmail: '' });
    return { successful, failed };
  },

  accept: async (
    organizationId: number,
    body: InvitationAccept,
  ): Promise<components['schemas']['OrganizationMembership']> => {
    const { data } = await apiClient.POST(
      '/api/organizations/{organization_pk}/invitations/accept/',
      {
        params: { path: { organization_pk: organizationId } },
        body,
      },
    );
    if (!data) {
      throw new Error('Failed to accept invitation');
    }
    return data;
  },

  register: async (
    organizationId: number,
    body: InvitationRegister,
  ): Promise<InvitationRegisterResponse> => {
    const { data } = await apiClient.POST(
      '/api/organizations/{organization_pk}/invitations/register/',
      {
        params: { path: { organization_pk: organizationId } },
        body: body as components['schemas']['OrganizationInvitationRegister'],
      },
    );
    if (!data) {
      throw new Error('Failed to register and accept invitation');
    }
    return data;
  },

  preview: async (organizationId: number, token: string): Promise<InvitationPreview> => {
    const { data } = await apiClient.GET(
      '/api/organizations/{organization_pk}/invitations/preview/',
      {
        params: {
          path: { organization_pk: organizationId },
          query: { token },
        },
      },
    );
    if (!data) {
      throw new Error('Failed to load invitation preview');
    }
    return data;
  },

  resend: async (
    organizationId: number,
    invitationId: number,
  ): Promise<Invitation> => {
    const { data } = await apiClient.POST(
      '/api/organizations/{organization_pk}/invitations/{id}/resend/',
      {
        params: {
          path: { organization_pk: organizationId, id: invitationId },
        },
      },
    );
    if (!data) {
      throw new Error('Failed to resend invitation');
    }
    return data;
  },

  revoke: async (
    organizationId: number,
    invitationId: number,
  ): Promise<Invitation> => {
    const { data } = await apiClient.POST(
      '/api/organizations/{organization_pk}/invitations/{id}/revoke/',
      {
        params: {
          path: { organization_pk: organizationId, id: invitationId },
        },
      },
    );
    if (!data) {
      throw new Error('Failed to revoke invitation');
    }
    return data;
  },
};
