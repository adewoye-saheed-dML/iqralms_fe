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
  getLeadPayouts: (organizationId: number, teacherId?: number) =>
    apiClient.get<TeacherPayout[]>(
      `/api/payouts/organizations/${organizationId}/lead/`,
      { params: teacherId ? { teacher_id: teacherId } : undefined }
    ),

  getMyPayouts: (organizationId: number) =>
    apiClient.get<MyTeacherPayout[]>(
      `/api/payouts/organizations/${organizationId}/mine/`
    ),

  getStatement: (organizationId: number, teacherId: number, start: string, end: string) =>
    apiClient.get<Statement>(
      `/api/payouts/organizations/${organizationId}/statements/`,
      { params: { teacher_id: teacherId, start, end } }
    ),

  getMyStatement: (organizationId: number, start: string, end: string) =>
    apiClient.get<MyStatement>(
      `/api/payouts/organizations/${organizationId}/statements/mine/`,
      { params: { start, end } }
    ),

  generatePayouts: (organizationId: number, data: PayoutGenerate) =>
    apiClient.post<GenerationResult>(
      `/api/payouts/organizations/${organizationId}/generate/`,
      { body: data }
    ),

  finalizePayout: (organizationId: number, payoutId: number) =>
    apiClient.post<TeacherPayout>(
      `/api/payouts/organizations/${organizationId}/${payoutId}/finalize/`
    ),
};
