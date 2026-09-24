import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type TrackBrief = components['schemas']['TrackBrief'];
export type Track = components['schemas']['Track'];
export type TrackWrite = components['schemas']['TrackWrite'];
export type PatchedTrackWrite = components['schemas']['PatchedTrackWrite'];

export type Level = components['schemas']['Level'];
export type LevelCreate = components['schemas']['LevelCreate'];
export type PatchedLevelUpdate = components['schemas']['PatchedLevelUpdate'];

export type PlacementResult = components['schemas']['PlacementResult'];
export type PlacementSubmit = components['schemas']['PlacementSubmit'];
export type PlacementReview = components['schemas']['PlacementReview'];
export type PlacementAudioAccess = components['schemas']['PlacementAudioAccess'];
export type TeacherTrack = components['schemas']['TeacherTrack'];
export type TeacherTrackCreate = components['schemas']['TeacherTrackCreate'];

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

  // Placements API
  submitPlacement: async (organizationId: number, body: PlacementSubmit): Promise<PlacementResult> => {
    const { data } = await apiClient.POST('/api/curriculum/organizations/{organization_pk}/placements/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    if (!data) throw new Error('Failed to submit placement assessment');
    return data;
  },

  getMyPlacements: async (organizationId: number): Promise<PlacementResult[]> => {
    const { data } = await apiClient.GET('/api/curriculum/organizations/{organization_pk}/placements/mine/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  getChildPlacements: async (organizationId: number): Promise<PlacementResult[]> => {
    const { data } = await apiClient.GET('/api/curriculum/organizations/{organization_pk}/placements/children/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  getPendingPlacements: async (organizationId: number): Promise<PlacementResult[]> => {
    const { data } = await apiClient.GET('/api/curriculum/organizations/{organization_pk}/placements/pending/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  reviewPlacement: async (
    organizationId: number,
    placementId: number,
    body: PlacementReview
  ): Promise<PlacementResult> => {
    const { data } = await apiClient.POST(
      '/api/curriculum/organizations/{organization_pk}/placements/{id}/review/',
      {
        params: { path: { organization_pk: organizationId, id: placementId } },
        body,
      }
    );
    if (!data) throw new Error('Failed to review placement');
    return data;
  },

  getPlacementAudioUrl: async (
    organizationId: number,
    placementId: number
  ): Promise<PlacementAudioAccess> => {
    const { data } = await apiClient.GET(
      '/api/curriculum/organizations/{organization_pk}/placements/{id}/audio-url/',
      {
        params: { path: { organization_pk: organizationId, id: placementId } },
      }
    );
    if (!data) throw new Error('Failed to retrieve placement audio URL');
    return data;
  },

  // Teacher Assignments API
  getMyTeachingTracks: async (organizationId: number): Promise<TeacherTrack[]> => {
    const { data } = await apiClient.GET('/api/curriculum/organizations/{organization_pk}/teachers/mine/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  getAcademyTeacherTracks: async (organizationId: number): Promise<TeacherTrack[]> => {
    const { data } = await apiClient.GET('/api/curriculum/organizations/{organization_pk}/teachers/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  getTeacherTrackAssignment: async (organizationId: number, assignmentId: number): Promise<TeacherTrack> => {
    const { data } = await apiClient.GET('/api/curriculum/organizations/{organization_pk}/teachers/{id}/', {
      params: { path: { organization_pk: organizationId, id: assignmentId } },
    });
    if (!data) throw new Error('Failed to retrieve teacher track assignment');
    return data;
  },

  assignTeacherTrack: async (organizationId: number, body: TeacherTrackCreate): Promise<TeacherTrack> => {
    const { data } = await apiClient.POST('/api/curriculum/organizations/{organization_pk}/teachers/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    if (!data) throw new Error('Failed to assign teacher to track');
    return data;
  },
};
