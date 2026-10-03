import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import type { components } from '@/lib/api/schema';

export type StudentList = components['schemas']['StudentList'];
export type StudentDetail = components['schemas']['StudentDetail'];
export type StudentEnrollmentCreate = components['schemas']['StudentEnrollmentCreate'];
export type PatchedStudentEnrollmentUpdate =
  components['schemas']['PatchedStudentEnrollmentUpdate'];

export const studentsApi = {
  getAcademyStudents: async (organizationId: number): Promise<StudentList[]> => {
    const { data } = await apiClient.GET('/api/organizations/{organization_pk}/students/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  getMyStudents: async (organizationId: number): Promise<StudentList[]> => {
    const { data } = await apiClient.GET('/api/organizations/{organization_pk}/students/mine/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  getStudents: async (organizationId: number): Promise<StudentList[]> => {
    return studentsApi.getAcademyStudents(organizationId);
  },

  getStudent: async (organizationId: number, enrollmentId: number): Promise<StudentDetail> => {
    try {
      const { data } = await apiClient.GET('/api/organizations/{organization_pk}/students/{id}/', {
        params: { path: { organization_pk: organizationId, id: enrollmentId } },
      });
      if (data) {
        return data;
      }
    } catch (err: unknown) {
      // If 403 Forbidden (e.g. caller is teacher, parent, or staff not permitted to call /students/{id}/),
      // fallback to role-accessible /students/mine/.
      if (err instanceof ApiError && err.status === 403) {
        const myStudents = await studentsApi.getMyStudents(organizationId);
        const match = myStudents.find((s) => s.id === enrollmentId || s.user_id === enrollmentId);
        if (match) {
          return match as unknown as StudentDetail;
        }
        throw new ApiError(404, 'Student enrollment not found in your assigned students');
      }
      throw err;
    }
    throw new ApiError(404, 'Student enrollment not found');
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
