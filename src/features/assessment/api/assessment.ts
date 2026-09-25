import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type SessionAssessmentCreate = components['schemas']['SessionAssessmentCreate'];
export type TeacherAssessment = components['schemas']['TeacherAssessment'];
export type FamilyAssessment = components['schemas']['FamilyAssessment'];
export type LeadAssessment = components['schemas']['LeadAssessment'];
export type AssessmentRubric = components['schemas']['AssessmentRubric'];
export type AssessmentRubricCreate = components['schemas']['AssessmentRubricCreate'];
export type PatchedAssessmentRubricUpdate = components['schemas']['PatchedAssessmentRubricUpdate'];
export type LeadReview = components['schemas']['LeadReview'];
export type TeacherReport = components['schemas']['TeacherReport'];

export const assessmentApi = {
  getQueue: async (organizationId: number): Promise<LeadAssessment[]> => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/review/queue/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  reviewAssessment: async (
    organizationId: number,
    assessmentId: number,
    body: LeadReview
  ): Promise<LeadAssessment> => {
    const { data } = await apiClient.POST('/api/assessment/organizations/{organization_pk}/{id}/review/', {
      params: { path: { organization_pk: organizationId, id: assessmentId } },
      body,
    });
    if (!data) {
      throw new Error('Failed to review assessment');
    }
    return data;
  },

  submitAssessment: async (
    organizationId: number,
    bookingId: number,
    body: SessionAssessmentCreate
  ): Promise<TeacherAssessment> => {
    const { data } = await apiClient.POST(
      '/api/assessment/organizations/{organization_pk}/bookings/{booking_id}/',
      {
        params: { path: { organization_pk: organizationId, booking_id: bookingId } },
        body,
      }
    );
    if (!data) {
      throw new Error('Failed to submit assessment');
    }
    return data;
  },

  getStudentAssessments: async (organizationId: number): Promise<FamilyAssessment[]> => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/mine/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  getTeacherAssessments: async (organizationId: number): Promise<TeacherAssessment[]> => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/teacher/mine/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  getChildAssessments: async (organizationId: number, studentId: number): Promise<FamilyAssessment[]> => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/child/', {
      params: { path: { organization_pk: organizationId }, query: { student_id: studentId } },
    });
    return data ?? [];
  },

  getAssessmentDetail: async (organizationId: number, assessmentId: number): Promise<TeacherAssessment> => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/{id}/', {
      params: { path: { organization_pk: organizationId, id: assessmentId } },
    });
    if (!data) {
      throw new Error('Assessment not found');
    }
    return data;
  },

  getFamilyAssessments: async (organizationId: number, studentId: number): Promise<FamilyAssessment[]> => {
    return assessmentApi.getChildAssessments(organizationId, studentId);
  },

  getMyAssessments: async (organizationId: number): Promise<TeacherAssessment[]> => {
    return assessmentApi.getTeacherAssessments(organizationId);
  },

  getRubrics: async (organizationId: number): Promise<AssessmentRubric[]> => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/rubrics/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  createRubric: async (organizationId: number, body: AssessmentRubricCreate): Promise<AssessmentRubric> => {
    const { data } = await apiClient.POST('/api/assessment/organizations/{organization_pk}/rubrics/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    if (!data) {
      throw new Error('Failed to create rubric');
    }
    return data;
  },

  updateRubric: async (
    organizationId: number,
    rubricId: number,
    body: PatchedAssessmentRubricUpdate
  ): Promise<AssessmentRubric> => {
    const { data } = await apiClient.PATCH('/api/assessment/organizations/{organization_pk}/rubrics/{id}/', {
      params: { path: { organization_pk: organizationId, id: rubricId } },
      body,
    });
    if (!data) {
      throw new Error('Failed to update rubric');
    }
    return data;
  },

  getTeacherReports: async (
    organizationId: number,
    params?: { from?: string; to?: string; track_id?: number }
  ): Promise<TeacherReport[]> => {
    const { data } = await apiClient.GET(
      '/api/assessment/organizations/{organization_pk}/reports/teachers/',
      {
        params: {
          path: { organization_pk: organizationId },
          query: params,
        },
      }
    );
    return data ?? [];
  },
};
