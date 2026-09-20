import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type Organization = components['schemas']['Organization'];
export type Track = components['schemas']['TrackBrief'];

export type CreateOrganizationPayload = Omit<Organization, 'id'> & {
  id?: number;
};
export type CreateTrackPayload = components['schemas']['TrackWrite'];

export const onboardingApi = {
  createAcademy: async (payload: CreateOrganizationPayload): Promise<Organization> => {
    const { data } = await apiClient.POST('/api/organizations/', {
      body: payload as components['schemas']['Organization'],
    });
    if (!data) {
      throw new Error('Failed to create academy');
    }
    return data;
  },

  getTracks: async (organizationId: number): Promise<Track[]> => {
    const { data } = await apiClient.GET('/api/curriculum/organizations/{organization_pk}/tracks/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  createTrack: async (organizationId: number, payload: CreateTrackPayload): Promise<Track> => {
    const { data } = await apiClient.POST('/api/curriculum/organizations/{organization_pk}/tracks/', {
      params: { path: { organization_pk: organizationId } },
      body: payload,
    });
    if (!data) {
      throw new Error('Failed to create track');
    }
    return data;
  },
};
