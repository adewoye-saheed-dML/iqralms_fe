import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type Track = components['schemas']['Track'];
export type TrackWrite = components['schemas']['TrackWrite'];
export type PatchedTrackWrite = components['schemas']['PatchedTrackWrite'];

export type Level = components['schemas']['Level'];
export type LevelCreate = components['schemas']['LevelCreate'];
export type PatchedLevelUpdate = components['schemas']['PatchedLevelUpdate'];

export const curriculumApi = {
  // --- Tracks ---

  getTracks: (organizationId: number) => {
    return apiClient.get<Track[]>(`/api/curriculum/organizations/${organizationId}/tracks/`);
  },

  getTrack: (organizationId: number, trackId: number) => {
    return apiClient.get<Track>(
      `/api/curriculum/organizations/${organizationId}/tracks/${trackId}/`
    );
  },

  createTrack: (organizationId: number, data: TrackWrite) => {
    return apiClient.post<Track>(`/api/curriculum/organizations/${organizationId}/tracks/`, {
      body: data,
    });
  },

  updateTrack: (organizationId: number, trackId: number, data: PatchedTrackWrite) => {
    return apiClient.patch<Track>(
      `/api/curriculum/organizations/${organizationId}/tracks/${trackId}/`,
      {
        body: data,
      }
    );
  },

  // --- Levels ---
  // The backend uses a flat level list but accepts `?track=<id>` to narrow it.

  getLevels: (organizationId: number, trackId?: number) => {
    return apiClient.get<Level[]>(`/api/curriculum/organizations/${organizationId}/levels/`, {
      params: trackId ? { track: trackId } : undefined,
    });
  },

  createLevel: (organizationId: number, data: LevelCreate) => {
    return apiClient.post<Level>(`/api/curriculum/organizations/${organizationId}/levels/`, {
      body: data,
    });
  },

  updateLevel: (organizationId: number, levelId: number, data: PatchedLevelUpdate) => {
    return apiClient.patch<Level>(
      `/api/curriculum/organizations/${organizationId}/levels/${levelId}/`,
      {
        body: data,
      }
    );
  },
};
