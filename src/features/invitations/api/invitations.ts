import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type Invitation = components['schemas']['OrganizationInvitation'];
export type InvitationCreate = components['schemas']['OrganizationInvitationCreate'];
export type InvitationAccept = components['schemas']['OrganizationInvitationAccept'];
export type InvitationPreview = components['schemas']['OrganizationInvitationPreview'];
export type InvitationRole = components['schemas']['InvitableOrganizationRoleEnum'];

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
