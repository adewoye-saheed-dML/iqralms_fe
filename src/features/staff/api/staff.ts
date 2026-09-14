import { apiClient } from '@/lib/api/client';

export type Role = 'owner' | 'admin' | 'staff' | 'teacher';
export type AssignableRole = 'admin' | 'staff' | 'teacher';
export type Status = 'active' | 'suspended';

export interface Membership {
  id: number;
  organization: number;
  user: number;
  username: string;
  role: Role;
  role_display: string;
  status: Status;
  status_display: string;
  created_at: string;
  updated_at: string;
}

export interface AddMemberPayload {
  user: number;
  role: AssignableRole;
}

export interface UpdateMemberPayload {
  role?: AssignableRole;
  status?: Status;
}

export const staffApi = {
  getMemberships: async (organizationId: number): Promise<Membership[]> => {
    return apiClient.get(`/api/organizations/${organizationId}/memberships/`);
  },

  getMembership: async (organizationId: number, memberId: number): Promise<Membership> => {
    // Backend doesn't have a specific retrieve endpoint for a single member in this route (only PATCH)
    // Wait, the API schema has:
    // /api/organizations/{organization_pk}/memberships/{id}/ PATCH
    // Does it have a GET?
    // Let me check if GET is available for single membership.
    // If not, we fetch the list and find it.
    const memberships = await apiClient.get<Membership[]>(
      `/api/organizations/${organizationId}/memberships/`
    );
    const member = memberships.find((m) => m.id === memberId);
    if (!member) {
      throw new Error('Member not found');
    }
    return member;
  },

  addMember: async (organizationId: number, data: AddMemberPayload): Promise<Membership> => {
    return apiClient.post(`/api/organizations/${organizationId}/memberships/`, data);
  },

  updateMember: async (
    organizationId: number,
    memberId: number,
    data: UpdateMemberPayload
  ): Promise<Membership> => {
    return apiClient.patch(`/api/organizations/${organizationId}/memberships/${memberId}/`, data);
  },
};
