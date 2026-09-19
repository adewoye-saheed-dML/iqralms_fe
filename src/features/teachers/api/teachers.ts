import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type TeacherConfiguration = components['schemas']['OrganizationTeacherConfiguration'];
export type TeacherConfigurationCreate = components['schemas']['OrganizationTeacherConfigurationCreate'];
export type TeacherConfigurationUpdate = components['schemas']['PatchedOrganizationTeacherConfigurationUpdate'];
export type TeacherTrack = components['schemas']['TeacherTrack'];

export const teachersApi = {
  getTeacherConfigurations: async (organizationId: number): Promise<TeacherConfiguration[]> => {
    const { data } = await apiClient.GET('/api/accounts/organizations/{organization_pk}/teacher-configurations/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  getTeacherConfiguration: async (organizationId: number, memberId: number): Promise<TeacherConfiguration> => {
    const { data } = await apiClient.GET('/api/accounts/organizations/{organization_pk}/teacher-configurations/{id}/', {
      params: { path: { organization_pk: organizationId, id: memberId } },
    });
    if (!data) {
      throw new Error('Teacher configuration not found');
    }
    return data;
  },

  createTeacherConfiguration: async (organizationId: number, body: TeacherConfigurationCreate): Promise<TeacherConfiguration> => {
    const { data } = await apiClient.POST('/api/accounts/organizations/{organization_pk}/teacher-configurations/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    if (!data) {
      throw new Error('Failed to create teacher configuration');
    }
    return data;
  },

  updateTeacherConfiguration: async (
    organizationId: number,
    memberId: number,
    body: TeacherConfigurationUpdate
  ): Promise<TeacherConfiguration> => {
    const { data } = await apiClient.PATCH('/api/accounts/organizations/{organization_pk}/teacher-configurations/{id}/', {
      params: { path: { organization_pk: organizationId, id: memberId } },
      body,
    });
    if (!data) {
      throw new Error('Failed to update teacher configuration');
    }
    return data;
  },

  getTeacherTracks: async (organizationId: number): Promise<TeacherTrack[]> => {
    const { data } = await apiClient.GET('/api/curriculum/organizations/{organization_pk}/teachers/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },
};
