import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type StudentProgress = components['schemas']['StudentProgress'];
export type ProgressSnapshot = components['schemas']['ProgressSnapshot'];
export type FamilyProgressSnapshot = components['schemas']['FamilyProgressSnapshot'];

export const progressApi = {
  getMyProgress: (organizationId: number, trackId?: number) =>
    apiClient.get<StudentProgress[]>(
      `/api/assessment/organizations/${organizationId}/progress/mine/`,
      { params: trackId ? { track_id: trackId } : undefined }
    ),

  getChildProgress: (organizationId: number, studentId: number, trackId?: number) =>
    apiClient.get<StudentProgress[]>(
      `/api/assessment/organizations/${organizationId}/progress/child/`,
      { params: { student_id: studentId, ...(trackId ? { track_id: trackId } : {}) } }
    ),

  getAllSnapshots: (organizationId: number, studentId?: number, trackId?: number) =>
    apiClient.get<ProgressSnapshot[]>(
      `/api/assessment/organizations/${organizationId}/snapshots/all/`,
      { params: { ...(studentId ? { student_id: studentId } : {}), ...(trackId ? { track_id: trackId } : {}) } }
    ),

  getMySnapshots: (organizationId: number, trackId?: number) =>
    apiClient.get<FamilyProgressSnapshot[]>(
      `/api/assessment/organizations/${organizationId}/snapshots/mine/`,
      { params: trackId ? { track_id: trackId } : undefined }
    ),

  getChildSnapshots: (organizationId: number, studentId: number, trackId?: number) =>
    apiClient.get<FamilyProgressSnapshot[]>(
      `/api/assessment/organizations/${organizationId}/snapshots/child/`,
      { params: { student_id: studentId, ...(trackId ? { track_id: trackId } : {}) } }
    ),
};
