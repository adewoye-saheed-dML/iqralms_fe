import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type TrackBrief = components['schemas']['TrackBrief'];
export type Track = components['schemas']['Track'];
export type TrackWrite = components['schemas']['TrackWrite'];
export type PatchedTrackWrite = components['schemas']['PatchedTrackWrite'];

export type Level = components['schemas']['Level'];
export type LevelCreate = components['schemas']['LevelCreate'];
export type PatchedLevelUpdate = components['schemas']['PatchedLevelUpdate'];

export const curriculumApi = {
  getTracks: async (organizationId: number) => {
    const { data } = await apiClient.GET('/api/curriculum/organizations/{organization_pk}/tracks/', {
      params: { path: { organization_pk: organizationId } },
    });
    return (data ?? []) as TrackBrief[];
  },

  getTrack: async (organizationId: number, trackId: number) => {
    const { data } = await apiClient.GET('/api/curriculum/organizations/{organization_pk}/tracks/{id}/', {
      params: { path: { organization_pk: organizationId, id: trackId } },
    });
    if (!data) throw new Error('Track not found');
    return data as Track;
  },

  createTrack: async (organizationId: number, body: TrackWrite) => {
    const { data } = await apiClient.POST('/api/curriculum/organizations/{organization_pk}/tracks/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    return data as Track;
  },

  updateTrack: async (organizationId: number, trackId: number, body: PatchedTrackWrite) => {
    const { data } = await apiClient.PATCH('/api/curriculum/organizations/{organization_pk}/tracks/{id}/', {
      params: { path: { organization_pk: organizationId, id: trackId } },
      body,
    });
    return data as Track;
  },

  getLevels: async (organizationId: number, trackId?: number) => {
    const { data } = await apiClient.GET('/api/curriculum/organizations/{organization_pk}/levels/', {
      params: {
        path: { organization_pk: organizationId },
        query: trackId !== undefined ? { track: String(trackId) } : undefined,
      },
    });
    return (data ?? []) as Level[];
  },

  getLevel: async (organizationId: number, levelId: number) => {
    const { data } = await apiClient.GET('/api/curriculum/organizations/{organization_pk}/levels/{id}/', {
      params: { path: { organization_pk: organizationId, id: levelId } },
    });
    return data as Level;
  },

  createLevel: async (organizationId: number, body: LevelCreate) => {
    const { data } = await apiClient.POST('/api/curriculum/organizations/{organization_pk}/levels/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    return data as Level;
  },

  updateLevel: async (organizationId: number, levelId: number, body: PatchedLevelUpdate) => {
    const { data } = await apiClient.PATCH('/api/curriculum/organizations/{organization_pk}/levels/{id}/', {
      params: { path: { organization_pk: organizationId, id: levelId } },
      body,
    });
    return data as Level;
  },
};
