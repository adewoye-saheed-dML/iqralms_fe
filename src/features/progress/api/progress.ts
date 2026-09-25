import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type StudentProgress = components['schemas']['StudentProgress'];
export type ProgressSnapshot = components['schemas']['ProgressSnapshot'];
export type FamilyProgressSnapshot = components['schemas']['FamilyProgressSnapshot'];
export type ProgressSnapshotCreate = components['schemas']['ProgressSnapshotCreate'];

export const progressApi = {
  getMyProgress: async (
    organizationId: number,
    trackId: number,
    from?: string,
    to?: string
  ): Promise<StudentProgress | null> => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/progress/mine/', {
      params: {
        path: { organization_pk: organizationId },
        query: { track_id: trackId, from, to },
      },
    });
    return data ?? null;
  },

  getTeachingProgress: async (
    organizationId: number,
    studentId: number,
    trackId: number,
    from?: string,
    to?: string
  ): Promise<StudentProgress | null> => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/progress/teaching/', {
      params: {
        path: { organization_pk: organizationId },
        query: { student_id: studentId, track_id: trackId, from, to },
      },
    });
    return data ?? null;
  },

  getChildProgress: async (
    organizationId: number,
    studentId: number,
    trackId: number,
    from?: string,
    to?: string
  ): Promise<StudentProgress | null> => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/progress/child/', {
      params: {
        path: { organization_pk: organizationId },
        query: { student_id: studentId, track_id: trackId, from, to },
      },
    });
    return data ?? null;
  },

  getMySnapshots: async (
    organizationId: number,
    trackId?: number
  ): Promise<FamilyProgressSnapshot[]> => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/snapshots/mine/', {
      params: {
        path: { organization_pk: organizationId },
        query: { track_id: trackId },
      },
    });
    return data ?? [];
  },

  getChildSnapshots: async (
    organizationId: number,
    studentId: number,
    trackId?: number
  ): Promise<FamilyProgressSnapshot[]> => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/snapshots/child/', {
      params: {
        path: { organization_pk: organizationId },
        query: { student_id: studentId, track_id: trackId },
      },
    });
    return data ?? [];
  },

  getAcademySnapshots: async (
    organizationId: number,
    studentId?: number,
    trackId?: number
  ): Promise<ProgressSnapshot[]> => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/snapshots/', {
      params: {
        path: { organization_pk: organizationId },
        query: { student_id: studentId, track_id: trackId },
      },
    });
    return data ?? [];
  },

  getAllSnapshots: async (
    organizationId: number,
    studentId?: number,
    trackId?: number
  ): Promise<ProgressSnapshot[]> => {
    return progressApi.getAcademySnapshots(organizationId, studentId, trackId);
  },

  createSnapshot: async (
    organizationId: number,
    body: ProgressSnapshotCreate
  ): Promise<ProgressSnapshot> => {
    const { data } = await apiClient.POST('/api/assessment/organizations/{organization_pk}/snapshots/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    if (!data) {
      throw new Error('Failed to create progress snapshot');
    }
    return data;
  },
};
