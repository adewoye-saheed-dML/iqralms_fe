import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type Membership = components['schemas']['OrganizationMembership'];
export type UpdateMemberPayload =
  components['schemas']['PatchedOrganizationMembershipUpdate'];

export const membershipsApi = {
  list: async (organizationId: number): Promise<Membership[]> => {
    const { data } = await apiClient.GET(
      '/api/organizations/{organization_pk}/memberships/',
      { params: { path: { organization_pk: organizationId } } },
    );
    return data ?? [];
  },

  get: async (organizationId: number, memberId: number): Promise<Membership> => {
    const { data } = await apiClient.GET(
      '/api/organizations/{organization_pk}/memberships/',
      { params: { path: { organization_pk: organizationId } } },
    );
    const member = (data ?? []).find((item) => item.id === memberId);
    if (!member) {
      throw new Error('Member not found');
    }
    return member;
  },

  update: async (
    organizationId: number,
    memberId: number,
    body: UpdateMemberPayload,
  ): Promise<Membership> => {
    const { data } = await apiClient.PATCH(
      '/api/organizations/{organization_pk}/memberships/{id}/',
      {
        params: {
          path: { organization_pk: organizationId, id: memberId },
        },
        body,
      },
    );
    if (!data) {
      throw new Error('Failed to update membership');
    }
    return data;
  },
};
