import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type Role = components['schemas']['OrganizationRoleEnum'];
export type AssignableRole = components['schemas']['AssignableOrganizationRoleEnum'];
export type Status = components['schemas']['MembershipStatusEnum'];

export type Membership = components['schemas']['OrganizationMembership'];
export type UpdateMemberPayload = components['schemas']['PatchedOrganizationMembershipUpdate'];

export type Invitation = components['schemas']['OrganizationInvitation'];
export type InvitationCreate = components['schemas']['OrganizationInvitationCreate'];
export type InvitationAccept = components['schemas']['OrganizationInvitationAccept'];

export const staffApi = {
  getMemberships: async (organizationId: number): Promise<Membership[]> => {
    const { data } = await apiClient.GET('/api/organizations/{organization_pk}/memberships/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  getMembership: async (organizationId: number, memberId: number): Promise<Membership> => {
    const { data } = await apiClient.GET('/api/organizations/{organization_pk}/memberships/', {
      params: { path: { organization_pk: organizationId } },
    });
    const memberships = data ?? [];
    const member = memberships.find((m) => m.id === memberId);
    if (!member) {
      throw new Error('Member not found');
    }
    return member;
  },

  updateMember: async (
    organizationId: number,
    memberId: number,
    body: UpdateMemberPayload
  ): Promise<Membership> => {
    const { data: responseData } = await apiClient.PATCH('/api/organizations/{organization_pk}/memberships/{id}/', {
      params: { path: { organization_pk: organizationId, id: memberId } },
      body,
    });
    if (!responseData) {
      throw new Error('Failed to update membership');
    }
    return responseData;
  },

  getInvitations: async (organizationId: number): Promise<Invitation[]> => {
    const { data } = await apiClient.GET('/api/organizations/{organization_pk}/invitations/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  inviteStaff: async (organizationId: number, body: InvitationCreate): Promise<Invitation> => {
    const { data } = await apiClient.POST('/api/organizations/{organization_pk}/invitations/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    if (!data) {
      throw new Error('Failed to create invitation');
    }
    return data;
  },

  acceptInvitation: async (organizationId: number, body: InvitationAccept): Promise<Membership> => {
    const { data } = await apiClient.POST('/api/organizations/{organization_pk}/invitations/accept/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    if (!data) {
      throw new Error('Failed to accept invitation');
    }
    return data;
  },
};
