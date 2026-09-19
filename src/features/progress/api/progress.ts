import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type StudentProgress = components['schemas']['StudentProgress'];
export type ProgressSnapshot = components['schemas']['ProgressSnapshot'];

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

  getAllSnapshots: async (
    organizationId: number,
    studentId?: number,
    trackId?: number
  ): Promise<ProgressSnapshot[]> => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/snapshots/all/', {
      params: {
        path: { organization_pk: organizationId },
        query: { student_id: studentId, track_id: trackId },
      },
    });
    return data ?? [];
  },
};
