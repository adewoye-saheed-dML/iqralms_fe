import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';
import { getToken } from '@/lib/auth/token';
import { ApiError, normalizeErrorMessage } from '@/lib/api/errors';

export type SessionAssessmentCreate = components['schemas']['SessionAssessmentCreate'];
export type TeacherAssessment = components['schemas']['TeacherAssessment'];
export type FamilyAssessment = components['schemas']['FamilyAssessment'];
export type LeadAssessment = components['schemas']['LeadAssessment'];
export type AssessmentRubric = components['schemas']['AssessmentRubric'];
export type AssessmentRubricCreate = components['schemas']['AssessmentRubricCreate'];
export type PatchedAssessmentRubricUpdate = components['schemas']['PatchedAssessmentRubricUpdate'];
export type LeadReview = components['schemas']['LeadReview'];
export type TeacherReport = components['schemas']['TeacherReport'];

export type SubmissionType = 'recitation' | 'written' | 'file' | 'mixed';
export type SubmissionStatus = 'pending' | 'submitted' | 'graded' | 'needs_revision';

export interface StudentAssignment {
  id: number;
  organization: number;
  created_by: number;
  created_by_name: string;
  track: number | null;
  track_name: string | null;
  level: number | null;
  level_name: string | null;
  assigned_student: number | null;
  assigned_student_name: string | null;
  title: string;
  description: string;
  submission_type: SubmissionType;
  surah_number: number | null;
  ayah_start: number | null;
  ayah_end: number | null;
  reference_notes: string;
  attachment: string | null;
  attachment_url: string | null;
  max_score: number;
  due_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  submissions_count: number;
  my_submission?: AssignmentSubmission | null;
}

export interface RubricCriterionScore {
  criterion: string;
  score: number;
  max_score: number;
  comment?: string;
}

export interface AssignmentSubmission {
  id: number;
  assignment: number;
  assignment_title: string;
  assignment_details: {
    submission_type: SubmissionType;
    surah_number: number | null;
    ayah_start: number | null;
    ayah_end: number | null;
    max_score: number;
    due_date: string | null;
  };
  student: number;
  student_name: string;
  status: SubmissionStatus;
  audio_file: string | null;
  audio_file_url: string | null;
  written_response: string;
  attachment_file: string | null;
  attachment_file_url: string | null;
  notes_from_student: string;
  submitted_at: string;
  score: number | null;
  rubric_scores: RubricCriterionScore[] | Record<string, unknown> | null;
  teacher_feedback: string;
  graded_by: number | null;
  graded_by_name: string | null;
  graded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentAssignmentInput {
  title: string;
  description?: string;
  submission_type: SubmissionType;
  track?: number | null;
  level?: number | null;
  assigned_student?: number | null;
  surah_number?: number | null;
  ayah_start?: number | null;
  ayah_end?: number | null;
  reference_notes?: string;
  attachment?: File | null;
  max_score?: number;
  due_date?: string | null;
  is_active?: boolean;
}

export interface AssignmentSubmissionInput {
  audio_file?: Blob | File | null;
  written_response?: string;
  attachment_file?: File | null;
  notes_from_student?: string;
}

export interface AssignmentGradeInput {
  score: number;
  teacher_feedback?: string;
  status?: 'graded' | 'needs_revision';
  rubric_scores?: RubricCriterionScore[];
}

export interface WardProgressResponse {
  student: {
    id: number;
    name: string;
    email: string;
  };
  stats: {
    total_assigned: number;
    submitted_count: number;
    graded_count: number;
    average_score: number | null;
  };
  items: Array<{
    assignment: StudentAssignment;
    submission: AssignmentSubmission | null;
  }>;
}

function getApiBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8000');
  return url.replace(/\/+$/, '');
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Token ${token}`);
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (!response.ok) {
    let payload: unknown;
    try {
      payload = await response.clone().json();
    } catch {
      try {
        payload = await response.clone().text();
      } catch {
        payload = undefined;
      }
    }
    const message = normalizeErrorMessage(response.status, payload, response.statusText);
    throw new ApiError(response.status, message, payload);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return (await response.json()) as T;
}

export function resolveAssessmentMediaUrl(url: string | null): string | null {
  if (!url) return null;
  const baseUrl = getApiBaseUrl();
  const token = getToken();
  let fullUrl = url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;

  if (token) {
    try {
      const parsed = new URL(fullUrl, baseUrl || 'http://127.0.0.1:8000');
      parsed.searchParams.set('token', token);
      fullUrl = parsed.toString();
    } catch {
      const separator = fullUrl.includes('?') ? '&' : '?';
      fullUrl = `${fullUrl}${separator}token=${encodeURIComponent(token)}`;
    }
  }
  return fullUrl;
}

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

  // ---- Student Assignments & Submissions ----

  getAssignments: async (
    organizationId: number,
    params?: {
      track?: number;
      level?: number;
      student_id?: number;
      submission_type?: SubmissionType;
      is_active?: boolean;
    }
  ): Promise<StudentAssignment[]> => {
    const query = new URLSearchParams();
    if (params?.track) query.set('track', String(params.track));
    if (params?.level) query.set('level', String(params.level));
    if (params?.student_id) query.set('student_id', String(params.student_id));
    if (params?.submission_type) query.set('submission_type', params.submission_type);
    if (params?.is_active !== undefined) query.set('is_active', String(params.is_active));

    const qs = query.toString();
    const endpoint = `${getApiBaseUrl()}/api/assessment/organizations/${organizationId}/assignments/${qs ? `?${qs}` : ''}`;
    return requestJson<StudentAssignment[]>(endpoint, { method: 'GET' });
  },

  createAssignment: async (
    organizationId: number,
    input: StudentAssignmentInput
  ): Promise<StudentAssignment> => {
    const endpoint = `${getApiBaseUrl()}/api/assessment/organizations/${organizationId}/assignments/`;
    let body: BodyInit;
    const headers: Record<string, string> = {};

    if (input.attachment) {
      const formData = new FormData();
      formData.append('title', input.title);
      if (input.description) formData.append('description', input.description);
      formData.append('submission_type', input.submission_type);
      if (input.track) formData.append('track', String(input.track));
      if (input.level) formData.append('level', String(input.level));
      if (input.assigned_student) formData.append('assigned_student', String(input.assigned_student));
      if (input.surah_number) formData.append('surah_number', String(input.surah_number));
      if (input.ayah_start) formData.append('ayah_start', String(input.ayah_start));
      if (input.ayah_end) formData.append('ayah_end', String(input.ayah_end));
      if (input.reference_notes) formData.append('reference_notes', input.reference_notes);
      if (input.max_score !== undefined) formData.append('max_score', String(input.max_score));
      if (input.due_date) formData.append('due_date', input.due_date);
      if (input.is_active !== undefined) formData.append('is_active', String(input.is_active));
      formData.append('attachment', input.attachment);
      body = formData;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({
        title: input.title,
        description: input.description ?? '',
        submission_type: input.submission_type,
        track: input.track ?? null,
        level: input.level ?? null,
        assigned_student: input.assigned_student ?? null,
        surah_number: input.surah_number ?? null,
        ayah_start: input.ayah_start ?? null,
        ayah_end: input.ayah_end ?? null,
        reference_notes: input.reference_notes ?? '',
        max_score: input.max_score ?? 100,
        due_date: input.due_date ?? null,
        is_active: input.is_active ?? true,
      });
    }

    return requestJson<StudentAssignment>(endpoint, {
      method: 'POST',
      headers,
      body,
    });
  },

  deleteAssignment: async (organizationId: number, assignmentId: number): Promise<void> => {
    const endpoint = `${getApiBaseUrl()}/api/assessment/organizations/${organizationId}/assignments/${assignmentId}/`;
    await requestJson<void>(endpoint, { method: 'DELETE' });
  },

  submitAssignment: async (
    organizationId: number,
    assignmentId: number,
    input: AssignmentSubmissionInput
  ): Promise<AssignmentSubmission> => {
    const endpoint = `${getApiBaseUrl()}/api/assessment/organizations/${organizationId}/assignments/${assignmentId}/submit/`;
    const formData = new FormData();

    if (input.audio_file) {
      const filename = input.audio_file instanceof File ? input.audio_file.name : 'recitation.webm';
      formData.append('audio_file', input.audio_file, filename);
    }
    if (input.written_response) {
      formData.append('written_response', input.written_response);
    }
    if (input.attachment_file) {
      formData.append('attachment_file', input.attachment_file);
    }
    if (input.notes_from_student) {
      formData.append('notes_from_student', input.notes_from_student);
    }

    return requestJson<AssignmentSubmission>(endpoint, {
      method: 'POST',
      body: formData,
    });
  },

  getSubmissions: async (
    organizationId: number,
    params?: {
      assignment_id?: number;
      student_id?: number;
      status?: SubmissionStatus;
    }
  ): Promise<AssignmentSubmission[]> => {
    const query = new URLSearchParams();
    if (params?.assignment_id) query.set('assignment_id', String(params.assignment_id));
    if (params?.student_id) query.set('student_id', String(params.student_id));
    if (params?.status) query.set('status', params.status);

    const qs = query.toString();
    const endpoint = `${getApiBaseUrl()}/api/assessment/organizations/${organizationId}/submissions/${qs ? `?${qs}` : ''}`;
    return requestJson<AssignmentSubmission[]>(endpoint, { method: 'GET' });
  },

  gradeSubmission: async (
    organizationId: number,
    submissionId: number,
    input: AssignmentGradeInput
  ): Promise<AssignmentSubmission> => {
    const endpoint = `${getApiBaseUrl()}/api/assessment/organizations/${organizationId}/submissions/${submissionId}/grade/`;
    return requestJson<AssignmentSubmission>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
  },

  getWardProgress: async (
    organizationId: number,
    studentId?: number
  ): Promise<WardProgressResponse> => {
    const query = new URLSearchParams();
    if (studentId) query.set('student_id', String(studentId));
    const qs = query.toString();
    const endpoint = `${getApiBaseUrl()}/api/assessment/organizations/${organizationId}/ward-progress/${qs ? `?${qs}` : ''}`;
    return requestJson<WardProgressResponse>(endpoint, { method: 'GET' });
  },
};
