import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type StudentEnrollmentCreate = components['schemas']['StudentEnrollmentCreate'];
export type PatchedStudentEnrollmentUpdate =
  components['schemas']['PatchedStudentEnrollmentUpdate'];

// Since the OpenAPI schema currently lacks a response content schema for StudentEnrollment,
// we define a minimal view model for the frontend to use. This records the mismatch.
export interface StudentEnrollmentView {
  id: number;
  user: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  status: 'active' | 'inactive';
}

export const studentsApi = {
  getStudents: async (organizationId: number) => {
    const { data } = await apiClient.GET('/api/organizations/{organization_pk}/students/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data as unknown as StudentEnrollmentView[];
  },

  getStudent: async (organizationId: number, enrollmentId: number) => {
    const { data } = await apiClient.GET('/api/organizations/{organization_pk}/students/{id}/', {
      params: { path: { organization_pk: organizationId, id: enrollmentId } },
    });
    return data as unknown as StudentEnrollmentView;
  },

  addStudent: async (organizationId: number, body: StudentEnrollmentCreate) => {
    const { data } = await apiClient.POST('/api/organizations/{organization_pk}/students/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    return data as void;
  },

  updateStudentStatus: async (
    organizationId: number,
    enrollmentId: number,
    body: PatchedStudentEnrollmentUpdate
  ) => {
    const { data } = await apiClient.PATCH('/api/organizations/{organization_pk}/students/{id}/', {
      params: { path: { organization_pk: organizationId, id: enrollmentId } },
      body,
    });
    return data as unknown as StudentEnrollmentView;
  },
};
