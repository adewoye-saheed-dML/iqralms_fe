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
    return data as TeacherConfiguration[];
  },

  getTeacherConfiguration: async (organizationId: number, memberId: number): Promise<TeacherConfiguration> => {
    const { data } = await apiClient.GET('/api/accounts/organizations/{organization_pk}/teacher-configurations/{id}/', {
      params: { path: { organization_pk: organizationId, id: memberId } },
    });
    return data as TeacherConfiguration;
  },

  createTeacherConfiguration: async (organizationId: number, body: TeacherConfigurationCreate): Promise<TeacherConfiguration> => {
    const { data } = await apiClient.POST('/api/accounts/organizations/{organization_pk}/teacher-configurations/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    return data as TeacherConfiguration;
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
    return data as TeacherConfiguration;
  },

  getTeacherTracks: async (organizationId: number): Promise<TeacherTrack[]> => {
    const { data } = await apiClient.GET('/api/curriculum/organizations/{organization_pk}/teachers/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data as TeacherTrack[];
  },
};
