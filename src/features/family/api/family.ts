import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type LinkedStudent = components['schemas']['LinkedStudent'];
export type ParentLinkCreate = components['schemas']['ParentLinkCreate'];

export const familyApi = {
  getMyChildren: async (): Promise<LinkedStudent[]> => {
    const { data } = await apiClient.GET('/api/accounts/my-children/');
    return data ?? [];
  },

  getAcademyChildren: async (organizationId: number): Promise<LinkedStudent[]> => {
    const { data } = await apiClient.GET('/api/accounts/organizations/{organization_pk}/children/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  createParentLink: async (body: ParentLinkCreate): Promise<ParentLinkCreate> => {
    const { data } = await apiClient.POST('/api/accounts/parent-links/', {
      body,
    });
    if (!data) {
      throw new Error('Failed to link student');
    }
    return data;
  },
};
