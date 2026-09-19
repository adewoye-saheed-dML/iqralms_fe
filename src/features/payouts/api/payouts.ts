import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type TeacherPayout = components['schemas']['TeacherPayout'];
export type MyTeacherPayout = components['schemas']['MyTeacherPayout'];
export type Statement = components['schemas']['Statement'];
export type MyStatement = components['schemas']['MyStatement'];
export type PayoutGenerate = components['schemas']['PayoutGenerate'];
export type GenerationResult = components['schemas']['GenerationResult'];
export type SkippedBooking = components['schemas']['SkippedBooking'];
export type PayoutSession = components['schemas']['PayoutSession'];
export type PayoutStatusEnum = components['schemas']['PayoutStatusEnum'];
export type StatementStatusEnum = components['schemas']['StatementStatusEnum'];

export const payoutsApi = {
  getLeadPayouts: async (
    organizationId: number,
    teacherId?: number,
    start?: string,
    end?: string
  ): Promise<TeacherPayout[]> => {
    const { data } = await apiClient.GET('/api/payouts/organizations/{organization_pk}/lead/', {
      params: { 
        path: { organization_pk: organizationId },
        query: {
          ...(teacherId ? { teacher_id: teacherId } : {}),
          ...(start ? { start } : {}),
          ...(end ? { end } : {}),
        },
      },
    });
    return data ?? [];
  },

  getMyPayouts: async (organizationId: number): Promise<MyTeacherPayout[]> => {
    const { data } = await apiClient.GET('/api/payouts/organizations/{organization_pk}/mine/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  getStatement: async (
    organizationId: number,
    teacherId: number,
    start?: string,
    end?: string
  ): Promise<Statement> => {
    const { data } = await apiClient.GET('/api/payouts/organizations/{organization_pk}/statements/', {
      params: { 
        path: { organization_pk: organizationId },
        query: {
          teacher_id: teacherId,
          ...(start ? { start } : {}),
          ...(end ? { end } : {}),
        },
      },
    });
    if (!data) {
      throw new Error('Failed to load statement');
    }
    return data;
  },

  getMyStatement: async (
    organizationId: number,
    start?: string,
    end?: string
  ): Promise<MyStatement> => {
    const { data } = await apiClient.GET('/api/payouts/organizations/{organization_pk}/statements/mine/', {
      params: { 
        path: { organization_pk: organizationId },
        query: {
          ...(start ? { start } : {}),
          ...(end ? { end } : {}),
        },
      },
    });
    if (!data) {
      throw new Error('Failed to load my statement');
    }
    return data;
  },

  generatePayouts: async (
    organizationId: number,
    body: PayoutGenerate
  ): Promise<GenerationResult> => {
    const { data } = await apiClient.POST('/api/payouts/organizations/{organization_pk}/generate/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    if (!data) {
      throw new Error('Failed to generate payouts');
    }
    return data;
  },

  finalizePayout: async (
    organizationId: number,
    payoutId: number
  ): Promise<TeacherPayout> => {
    const { data } = await apiClient.POST('/api/payouts/organizations/{organization_pk}/{id}/finalize/', {
      params: { path: { organization_pk: organizationId, id: payoutId } },
    });
    if (!data) {
      throw new Error('Failed to finalize payout');
    }
    return data;
  },
};
