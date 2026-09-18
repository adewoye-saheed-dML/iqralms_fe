import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type StudentProgress = components['schemas']['StudentProgress'];
export type ProgressSnapshot = components['schemas']['ProgressSnapshot'];
export type FamilyProgressSnapshot = components['schemas']['FamilyProgressSnapshot'];

export const progressApi = {
  getMyProgress: async (organizationId: number) => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/progress/mine/', {
      params: { path: { organization_pk: organizationId } },
    });
    // @ts-expect-error type assertion
    return data as StudentProgress[];
  },

  getFamilyProgress: async (organizationId: number) => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/progress/child/', {
      params: { path: { organization_pk: organizationId } },
    });
    // @ts-expect-error type assertion
    return data as FamilyProgressSnapshot[];
  },
  
  getAllSnapshots: async (organizationId: number) => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/snapshots/all/', {
      params: { path: { organization_pk: organizationId } },
    });
    // @ts-expect-error type assertion
    return data as ProgressSnapshot[];
  },
};
