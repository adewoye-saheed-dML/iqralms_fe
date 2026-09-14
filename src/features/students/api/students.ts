import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type StudentEnrollmentCreate = components['schemas']['StudentEnrollmentCreate'];
export type PatchedStudentEnrollmentUpdate =
  components['schemas']['PatchedStudentEnrollmentUpdate'];

// Since the OpenAPI schema currently lacks a response content schema for StudentEnrollment,
// we define a minimal view model for the frontend to use.
export interface StudentEnrollment {
  id: number;
  user: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  status: 'active' | 'inactive';
}

export const studentsApi = {
  getStudents: (organizationId: number) => {
    return apiClient.get<StudentEnrollment[]>(`/api/organizations/${organizationId}/students/`);
  },

  getStudent: (organizationId: number, enrollmentId: number) => {
    return apiClient.get<StudentEnrollment>(
      `/api/organizations/${organizationId}/students/${enrollmentId}/`
    );
  },

  addStudent: (organizationId: number, data: StudentEnrollmentCreate) => {
    return apiClient.post<void>(`/api/organizations/${organizationId}/students/`, { body: data });
  },

  updateStudentStatus: (
    organizationId: number,
    enrollmentId: number,
    data: PatchedStudentEnrollmentUpdate
  ) => {
    return apiClient.patch<StudentEnrollment>(
      `/api/organizations/${organizationId}/students/${enrollmentId}/`,
      { body: data }
    );
  },
};
