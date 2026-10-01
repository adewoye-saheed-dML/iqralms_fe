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
export type StudentProgress = components['schemas']['StudentProgress'];
export type ProgressSnapshot = components['schemas']['ProgressSnapshot'];
export type ProgressSnapshotCreate = components['schemas']['ProgressSnapshotCreate'];
export type FamilyProgressSnapshot = components['schemas']['FamilyProgressSnapshot'];
export type CriterionAverage = components['schemas']['CriterionAverage'];
export type RecentSummary = components['schemas']['RecentSummary'];

export type SubmissionType = components['schemas']['SubmissionTypeEnum'];
export type SubmissionStatus = components['schemas']['SubmissionStatusEnum'];

/** User-friendly labels for submission types. */
export const SUBMISSION_TYPE_LABELS: Record<SubmissionType, string> = {
  audio_recitation: 'Quran Recitation',
  written_text: 'Written Response',
  file_upload: 'File / Worksheet',
  mixed: 'Mixed Format',
};

/** User-friendly labels for submission statuses. */
export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  submitted: 'Submitted',
  graded: 'Graded',
  resubmission_requested: 'Revision Requested',
};

/** User object shape returned by backend serializers (student, created_by, graded_by). */
export type ApiUserRef = components['schemas']['AssessmentParty'];

/** Helper to get display name from a user object returned by the API. */
export function getDisplayName(
  user: { first_name?: string | null; last_name?: string | null; username?: string | null } | number | null | undefined
): string {
  if (!user) return 'Unknown';
  if (typeof user === 'number') return `User #${user}`;
  const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
  return fullName || user.username || 'Unknown';
}

export type StudentAssignment = components['schemas']['StudentAssignment'];
export type StudentAssignmentCreate = components['schemas']['StudentAssignmentCreate'];
export type AssignmentSubmission = components['schemas']['AssignmentSubmission'];
export type AssignmentSubmissionCreate = components['schemas']['AssignmentSubmissionCreate'];
export type AssignmentGrade = components['schemas']['AssignmentGrade'];
export type WardProgress = components['schemas']['WardProgress'];
export type WardProgressResponse = WardProgress;

export interface RubricCriterionScore {
  criterion: string;
  score: number;
  max_score: number;
  comment?: string;
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
  reference_notes?: string | null;
  max_score?: number;
  due_date?: string | null;
  resource_file?: File | null;
  attachment?: File | null;
  rubric?: number | null;
}

export interface AssignmentSubmissionInput {
  audio_recording?: Blob | File | null;
  audio_file?: Blob | File | null;
  written_response?: string;
  attachment_file?: File | null;
  notes_from_student?: string;
}

export interface AssignmentGradeInput {
  score?: number | null;
  teacher_feedback?: string;
  rubric_scores?: RubricCriterionScore[] | Record<string, unknown>[];
  request_resubmission?: boolean;
  status?: 'graded' | 'resubmission_requested' | 'needs_revision';
}

export function resolveAssessmentMediaUrl(url: string | null): string | null {
  if (!url) return null;
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:8000');
  const baseUrl = rawBaseUrl.replace(/\/+$/, '');
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
      track_id?: number;
      student_id?: number;
      submission_type?: SubmissionType;
    }
  ): Promise<StudentAssignment[]> => {
    const { data } = await apiClient.GET(
      '/api/assessment/organizations/{organization_pk}/assignments/',
      {
        params: {
          path: { organization_pk: organizationId },
          query: params,
        },
      }
    );
    return (data as StudentAssignment[]) ?? [];
  },

  createAssignment: async (
    organizationId: number,
    input: StudentAssignmentInput
  ): Promise<StudentAssignment> => {
    const file = input.resource_file || input.attachment;
    if (file) {
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
      if (input.max_score !== undefined) formData.append('max_score', String(input.max_score));
      if (input.due_date) formData.append('due_date', input.due_date);
      if (input.rubric) formData.append('rubric', String(input.rubric));
      formData.append('resource_file', file);

      const { data } = await apiClient.POST(
        '/api/assessment/organizations/{organization_pk}/assignments/',
        {
          params: { path: { organization_pk: organizationId } },
          body: formData as unknown as StudentAssignmentCreate,
        }
      );
      if (!data) throw new Error('Failed to create assignment');
      return data;
    }

    const { data } = await apiClient.POST(
      '/api/assessment/organizations/{organization_pk}/assignments/',
      {
        params: {
          path: { organization_pk: organizationId },
        },
        body: {
          title: input.title,
          description: input.description ?? '',
          submission_type: input.submission_type,
          track: input.track ?? null,
          level: input.level ?? null,
          assigned_student: input.assigned_student ?? null,
          surah_number: input.surah_number ?? null,
          ayah_start: input.ayah_start ?? null,
          ayah_end: input.ayah_end ?? null,
          max_score: input.max_score ?? 100,
          due_date: input.due_date ?? null,
          rubric: input.rubric ?? null,
        },
      }
    );
    if (!data) throw new Error('Failed to create assignment');
    return data;
  },

  deleteAssignment: async (organizationId: number, assignmentId: number): Promise<void> => {
    await apiClient.DELETE(
      '/api/assessment/organizations/{organization_pk}/assignments/{id}/',
      {
        params: {
          path: { organization_pk: organizationId, id: assignmentId },
        },
      }
    );
  },

  submitAssignment: async (
    organizationId: number,
    assignmentId: number,
    input: AssignmentSubmissionInput
  ): Promise<AssignmentSubmission> => {
    const formData = new FormData();

    const audio = input.audio_recording || input.audio_file;
    if (audio) {
      const filename = audio instanceof File ? audio.name : 'recitation.webm';
      formData.append('audio_recording', audio, filename);
    }
    if (input.written_response) {
      formData.append('written_response', input.written_response);
    }
    if (input.attachment_file) {
      formData.append('attachment_file', input.attachment_file);
    }

    const { data } = await apiClient.POST(
      '/api/assessment/organizations/{organization_pk}/assignments/{assignment_id}/submit/',
      {
        params: {
          path: { organization_pk: organizationId, assignment_id: assignmentId },
        },
        body: formData as unknown as AssignmentSubmissionCreate,
      }
    );
    if (!data) throw new Error('Failed to submit assignment');
    return data;
  },

  getSubmissions: async (
    organizationId: number,
    params?: {
      assignment_id?: number;
      student_id?: number;
      status?: SubmissionStatus;
    }
  ): Promise<AssignmentSubmission[]> => {
    const { data } = await apiClient.GET(
      '/api/assessment/organizations/{organization_pk}/submissions/',
      {
        params: {
          path: { organization_pk: organizationId },
          query: params,
        },
      }
    );
    return (data as AssignmentSubmission[]) ?? [];
  },

  gradeSubmission: async (
    organizationId: number,
    submissionId: number,
    input: AssignmentGradeInput
  ): Promise<AssignmentSubmission> => {
    const isRevision =
      input.request_resubmission ??
      (input.status === 'resubmission_requested' || input.status === 'needs_revision');

    const { data } = await apiClient.POST(
      '/api/assessment/organizations/{organization_pk}/submissions/{id}/grade/',
      {
        params: {
          path: { organization_pk: organizationId, id: submissionId },
        },
        body: {
          score: input.score ?? null,
          teacher_feedback: input.teacher_feedback ?? '',
          rubric_scores: (input.rubric_scores as any) ?? [],
          request_resubmission: !!isRevision,
        },
      }
    );
    if (!data) throw new Error('Failed to grade submission');
    return data as AssignmentSubmission;
  },

  getWardProgress: async (
    organizationId: number,
    studentId?: number
  ): Promise<WardProgressResponse> => {
    const { data } = await apiClient.GET(
      '/api/assessment/organizations/{organization_pk}/ward-progress/',
      {
        params: {
          path: { organization_pk: organizationId },
          query: { student_id: studentId },
        },
      }
    );
    if (!data) throw new Error('Failed to fetch ward progress');
    return data as WardProgressResponse;
  },

  // ---- Progress Endpoints (Session-based assessment progress) ----

  getMyProgress: async (
    organizationId: number,
    params: { track_id: number; from?: string; to?: string }
  ): Promise<StudentProgress> => {
    const { data } = await apiClient.GET(
      '/api/assessment/organizations/{organization_pk}/progress/mine/',
      {
        params: {
          path: { organization_pk: organizationId },
          query: params,
        },
      }
    );
    if (!data) throw new Error('Failed to fetch progress');
    return data;
  },

  getChildProgress: async (
    organizationId: number,
    params: { student_id: number; track_id: number; from?: string; to?: string }
  ): Promise<StudentProgress> => {
    const { data } = await apiClient.GET(
      '/api/assessment/organizations/{organization_pk}/progress/child/',
      {
        params: {
          path: { organization_pk: organizationId },
          query: params,
        },
      }
    );
    if (!data) throw new Error('Failed to fetch child progress');
    return data;
  },

  getTeachingProgress: async (
    organizationId: number,
    params: { student_id: number; track_id: number; from?: string; to?: string }
  ): Promise<StudentProgress> => {
    const { data } = await apiClient.GET(
      '/api/assessment/organizations/{organization_pk}/progress/teaching/',
      {
        params: {
          path: { organization_pk: organizationId },
          query: params,
        },
      }
    );
    if (!data) throw new Error('Failed to fetch teaching progress');
    return data;
  },

  // ---- Snapshot Endpoints ----

  getSnapshots: async (
    organizationId: number,
    params?: { student_id?: number; track_id?: number }
  ): Promise<ProgressSnapshot[]> => {
    const { data } = await apiClient.GET(
      '/api/assessment/organizations/{organization_pk}/snapshots/',
      {
        params: {
          path: { organization_pk: organizationId },
          query: params,
        },
      }
    );
    return data ?? [];
  },

  createSnapshot: async (
    organizationId: number,
    body: ProgressSnapshotCreate
  ): Promise<ProgressSnapshot> => {
    const { data } = await apiClient.POST(
      '/api/assessment/organizations/{organization_pk}/snapshots/',
      {
        params: { path: { organization_pk: organizationId } },
        body,
      }
    );
    if (!data) throw new Error('Failed to create snapshot');
    return data;
  },

  getAllSnapshots: async (
    organizationId: number,
    params?: { student_id?: number; track_id?: number }
  ): Promise<ProgressSnapshot[]> => {
    const { data } = await apiClient.GET(
      '/api/assessment/organizations/{organization_pk}/snapshots/all/',
      {
        params: {
          path: { organization_pk: organizationId },
          query: params,
        },
      }
    );
    return data ?? [];
  },

  getMySnapshots: async (
    organizationId: number,
    params?: { track_id?: number }
  ): Promise<FamilyProgressSnapshot[]> => {
    const { data } = await apiClient.GET(
      '/api/assessment/organizations/{organization_pk}/snapshots/mine/',
      {
        params: {
          path: { organization_pk: organizationId },
          query: params,
        },
      }
    );
    return data ?? [];
  },

  getChildSnapshots: async (
    organizationId: number,
    params: { student_id: number; track_id?: number }
  ): Promise<FamilyProgressSnapshot[]> => {
    const { data } = await apiClient.GET(
      '/api/assessment/organizations/{organization_pk}/snapshots/child/',
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
