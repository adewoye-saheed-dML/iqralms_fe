import { apiClient } from '@/lib/api/client';
import { components } from '@/lib/api/schema';

type Organization = components['schemas']['Organization'];
type Track = components['schemas']['Track'];

export interface CreateOrganizationPayload {
  name: string;
  slug: string;
  timezone: string;
}

export interface CreateTrackPayload {
  name: string;
  slug: string;
}

export const onboardingApi = {
  createAcademy: async (payload: CreateOrganizationPayload) => {
    return apiClient.post<Organization>('/api/organizations/', {
      body: payload,
    });
  },

  getTracks: async (organizationId: number) => {
    return apiClient.get<Track[]>(`/api/curriculum/organizations/${organizationId}/tracks/`);
  },

  createTrack: async (organizationId: number, payload: CreateTrackPayload) => {
    return apiClient.post<Track>(`/api/curriculum/organizations/${organizationId}/tracks/`, {
      body: payload,
    });
  },
};
