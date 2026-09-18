import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type Role = components['schemas']['OrganizationRoleEnum'];
export type AssignableRole = components['schemas']['AssignableOrganizationRoleEnum'];
export type Status = components['schemas']['MembershipStatusEnum'];

export type Membership = components['schemas']['OrganizationMembership'];
// The backend OpenAPI lacks a POST endpoint for adding memberships.
export type AddMemberPayload = any;
export type UpdateMemberPayload = components['schemas']['PatchedOrganizationMembershipUpdate'];

export const staffApi = {
  getMemberships: async (organizationId: number): Promise<Membership[]> => {
    const { data } = await apiClient.GET('/api/organizations/{organization_pk}/memberships/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data as Membership[];
  },

  getMembership: async (organizationId: number, memberId: number): Promise<Membership> => {
    const { data } = await apiClient.GET('/api/organizations/{organization_pk}/memberships/', {
      params: { path: { organization_pk: organizationId } },
    });
    const memberships = data as Membership[];
    const member = memberships.find((m) => m.id === memberId);
    if (!member) {
      throw new Error('Member not found');
    }
    return member;
  },

  addMember: async (organizationId: number, data: AddMemberPayload): Promise<Membership> => {
    // @ts-expect-error POST is undocumented in OpenAPI
    const { data: responseData } = await apiClient.POST('/api/organizations/{organization_pk}/memberships/', {
      params: { path: { organization_pk: organizationId } as any },
      body: data,
    });
    return responseData as Membership;
  },

  updateMember: async (
    organizationId: number,
    memberId: number,
    data: UpdateMemberPayload
  ): Promise<Membership> => {
    const { data: responseData } = await apiClient.PATCH('/api/organizations/{organization_pk}/memberships/{id}/', {
      params: { path: { organization_pk: organizationId, id: memberId } },
      body: data,
    });
    return responseData as Membership;
  },
};
