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
  getLeadPayouts: async (organizationId: number, teacherId?: number) => {
    const { data } = await apiClient.GET('/api/payouts/organizations/{organization_pk}/lead/', {
      params: { 
        path: { organization_pk: organizationId },
        query: teacherId ? { teacher_id: teacherId } : {}
      }
    });
    return data as TeacherPayout[];
  },

  getMyPayouts: async (organizationId: number) => {
    const { data } = await apiClient.GET('/api/payouts/organizations/{organization_pk}/mine/', {
      params: { path: { organization_pk: organizationId } }
    });
    return data as MyTeacherPayout[];
  },

  getStatement: async (organizationId: number, teacherId: number, start: string, end: string) => {
    const { data } = await apiClient.GET('/api/payouts/organizations/{organization_pk}/statements/', {
      params: { 
        path: { organization_pk: organizationId },
        query: { teacher_id: teacherId, start, end } 
      }
    });
    return data as Statement;
  },

  getMyStatement: async (organizationId: number, start: string, end: string) => {
    const { data } = await apiClient.GET('/api/payouts/organizations/{organization_pk}/statements/mine/', {
      params: { 
        path: { organization_pk: organizationId },
        query: { start, end } 
      }
    });
    return data as MyStatement;
  },

  generatePayouts: async (organizationId: number, body: PayoutGenerate) => {
    const { data } = await apiClient.POST('/api/payouts/organizations/{organization_pk}/generate/', {
      params: { path: { organization_pk: organizationId } },
      body
    });
    return data as GenerationResult;
  },

  finalizePayout: async (organizationId: number, payoutId: number) => {
    const { data } = await apiClient.POST('/api/payouts/organizations/{organization_pk}/{id}/finalize/', {
      params: { path: { organization_pk: organizationId, id: payoutId } }
    });
    return data as TeacherPayout;
  }
};
