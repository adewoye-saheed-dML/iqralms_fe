import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type StudentList = components['schemas']['StudentList'];
export type StudentDetail = components['schemas']['StudentDetail'];
export type StudentEnrollmentCreate = components['schemas']['StudentEnrollmentCreate'];
export type PatchedStudentEnrollmentUpdate =
  components['schemas']['PatchedStudentEnrollmentUpdate'];

export const studentsApi = {
  getStudents: async (organizationId: number): Promise<StudentList[]> => {
    const { data } = await apiClient.GET('/api/organizations/{organization_pk}/students/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  getStudent: async (organizationId: number, enrollmentId: number): Promise<StudentDetail> => {
    const { data } = await apiClient.GET('/api/organizations/{organization_pk}/students/{id}/', {
      params: { path: { organization_pk: organizationId, id: enrollmentId } },
    });
    if (!data) {
      throw new Error('Student enrollment not found');
    }
    return data;
  },

  addStudent: async (organizationId: number, body: StudentEnrollmentCreate): Promise<StudentList> => {
    const { data } = await apiClient.POST('/api/organizations/{organization_pk}/students/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    if (!data) {
      throw new Error('Failed to create student enrollment');
    }
    return data;
  },

  updateStudentStatus: async (
    organizationId: number,
    enrollmentId: number,
    body: PatchedStudentEnrollmentUpdate
  ): Promise<StudentDetail> => {
    const { data } = await apiClient.PATCH('/api/organizations/{organization_pk}/students/{id}/', {
      params: { path: { organization_pk: organizationId, id: enrollmentId } },
      body,
    });
    if (!data) {
      throw new Error('Failed to update student enrollment');
    }
    return data;
  },
};
