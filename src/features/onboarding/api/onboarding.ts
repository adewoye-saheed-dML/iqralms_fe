import { apiClient } from '@/lib/api/client';
import { components } from '@/lib/api/schema';

export type Organization = components['schemas']['Organization'];
export type Track = components['schemas']['Track'];

export type CreateOrganizationPayload = components['schemas']['Organization'];
export type CreateTrackPayload = components['schemas']['TrackWrite'];

export const onboardingApi = {
  createAcademy: async (payload: CreateOrganizationPayload) => {
    const { data } = await apiClient.POST('/api/organizations/', {
      body: payload,
    });
    return data as Organization;
  },

  getTracks: async (organizationId: number) => {
    const { data } = await apiClient.GET('/api/curriculum/organizations/{organization_pk}/tracks/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data as Track[];
  },

  createTrack: async (organizationId: number, payload: CreateTrackPayload) => {
    const { data } = await apiClient.POST('/api/curriculum/organizations/{organization_pk}/tracks/', {
      params: { path: { organization_pk: organizationId } },
      body: payload,
    });
    return data as Track;
  },
};
