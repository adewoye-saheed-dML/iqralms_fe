import { apiClient } from '@/lib/api/client';
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
};
export type InvitationRegisterResponse = components['schemas']['OrganizationInvitationRegisterResponse'];

export const invitationsApi = {
  list: async (organizationId: number): Promise<Invitation[]> => {
    const { data } = await apiClient.GET(
      '/api/organizations/{organization_pk}/invitations/',
      { params: { path: { organization_pk: organizationId } } },
    );
    return data ?? [];
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
