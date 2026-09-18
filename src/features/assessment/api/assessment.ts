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

export const assessmentApi = {
  getQueue: async (organizationId: number) => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/review/queue/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data as LeadAssessment[];
  },

  reviewAssessment: async (organizationId: number, assessmentId: number, body: LeadReview) => {
    const { data } = await apiClient.POST('/api/assessment/organizations/{organization_pk}/{id}/review/', {
      params: { path: { organization_pk: organizationId, id: assessmentId } },
      body,
    });
    return data as LeadAssessment;
  },

  getFamilyAssessments: async (organizationId: number, studentId: number) => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/child/', {
      params: { path: { organization_pk: organizationId }, query: { student_id: studentId } },
    });
    return data as FamilyAssessment[];
  },

  getMyAssessments: async (organizationId: number) => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/teacher/mine/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data as TeacherAssessment[];
  },

  getRubrics: async (organizationId: number) => {
    const { data } = await apiClient.GET('/api/assessment/organizations/{organization_pk}/rubrics/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data as AssessmentRubric[];
  },

  createRubric: async (organizationId: number, body: AssessmentRubricCreate) => {
    const { data } = await apiClient.POST('/api/assessment/organizations/{organization_pk}/rubrics/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    return data as AssessmentRubric;
  },

  updateRubric: async (organizationId: number, rubricId: number, body: PatchedAssessmentRubricUpdate) => {
    const { data } = await apiClient.PATCH('/api/assessment/organizations/{organization_pk}/rubrics/{id}/', {
      params: { path: { organization_pk: organizationId, id: rubricId } },
      body,
    });
    return data as AssessmentRubric;
  },
};
