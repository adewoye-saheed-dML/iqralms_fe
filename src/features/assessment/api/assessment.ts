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
  createAssessment: (organizationId: number, bookingId: number, data: SessionAssessmentCreate) =>
    apiClient.post<TeacherAssessment>(
      `/api/assessment/organizations/${organizationId}/bookings/${bookingId}/`,
      { body: data }
    ),

  getTeacherAssessments: (organizationId: number) =>
    apiClient.get<TeacherAssessment[]>(
      `/api/assessment/organizations/${organizationId}/teacher/mine/`
    ),

  getMyAssessments: (organizationId: number) =>
    apiClient.get<FamilyAssessment[]>(
      `/api/assessment/organizations/${organizationId}/mine/`
    ),

  getChildAssessments: (organizationId: number, studentId: number) =>
    apiClient.get<FamilyAssessment[]>(
      `/api/assessment/organizations/${organizationId}/child/`,
      { params: { student_id: studentId } }
    ),

  getReviewQueue: (organizationId: number) =>
    apiClient.get<LeadAssessment[]>(
      `/api/assessment/organizations/${organizationId}/review/queue/`
    ),

  getAssessment: (organizationId: number, assessmentId: number) =>
    apiClient.get<LeadAssessment>(
      `/api/assessment/organizations/${organizationId}/${assessmentId}/`
    ),

  reviewAssessment: (organizationId: number, assessmentId: number, data: LeadReview) =>
    apiClient.post<LeadAssessment>(
      `/api/assessment/organizations/${organizationId}/${assessmentId}/review/`,
      { body: data }
    ),

  getRubrics: (organizationId: number) =>
    apiClient.get<AssessmentRubric[]>(
      `/api/assessment/organizations/${organizationId}/rubrics/`
    ),

  getRubric: (organizationId: number, rubricId: number) =>
    apiClient.get<AssessmentRubric>(
      `/api/assessment/organizations/${organizationId}/rubrics/${rubricId}/`
    ),
};
