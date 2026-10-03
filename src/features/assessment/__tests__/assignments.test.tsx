import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AssignmentsListView } from '../components/assignments-list-view';
import { CreateAssignmentModal } from '../components/create-assignment-modal';
import { AssignmentSubmissionModal } from '../components/assignment-submission-modal';
import { GradeSubmissionModal } from '../components/grade-submission-modal';
import { ParentWardAssessmentView } from '../components/parent-ward-assessment-view';
import { OwnerAssessmentOversight } from '../components/owner-assessment-oversight';
import { assessmentApi, StudentAssignment, AssignmentSubmission } from '../api/assessment';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth, useOptionalAuth } from '@/lib/auth/auth-provider';
import { familyApi } from '@/features/family/api/family';
import { curriculumApi } from '@/features/curriculum/api/curriculum';
import { studentsApi } from '@/features/students/api/students';

vi.mock('@/lib/academy/academy-provider', () => ({
  useAcademy: vi.fn(),
}));

vi.mock('@/lib/auth/auth-provider', () => ({
  useAuth: vi.fn(),
  useOptionalAuth: vi.fn(),
}));

vi.mock('../api/assessment', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/assessment')>();
  return {
    ...actual,
    assessmentApi: {
      ...actual.assessmentApi,
      getAssignments: vi.fn(),
      createAssignment: vi.fn(),
      deleteAssignment: vi.fn(),
      submitAssignment: vi.fn(),
      gradeSubmission: vi.fn(),
      getSubmissions: vi.fn(),
      getWardProgress: vi.fn(),
    },
    resolveAssessmentMediaUrl: vi.fn((url) => (url ? `http://localhost:8000${url}` : null)),
  };
});

vi.mock('@/features/family/api/family', () => ({
  familyApi: {
    getMyChildren: vi.fn(),
    getAcademyChildren: vi.fn(),
  },
}));

vi.mock('@/features/curriculum/api/curriculum', () => ({
  curriculumApi: {
    getTracks: vi.fn(),
    getMyTeachingTracks: vi.fn(),
  },
}));

vi.mock('@/features/students/api/students', () => ({
  studentsApi: {
    getMyStudents: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Assignments and Homework Submissions', () => {
  const mockAssignment: StudentAssignment = {
    id: 10,
    created_by: { id: 2, username: 'ahmad', first_name: 'Ustadh', last_name: 'Ahmad' },
    track: 1,
    track_name: 'Quran Memorization',
    level: 2,
    level_name: 'Juz 30',
    assigned_student: null,
    assigned_student_name: null,
    title: 'Surah Al-Mulk Recitation Practice',
    description: 'Recite verses 1 through 10 with clear Tajweed.',
    submission_type: 'audio_recitation',
    surah_number: 67,
    ayah_start: 1,
    ayah_end: 10,
    resource_file: null,
    max_score: 100,
    due_date: '2026-10-15T18:00:00Z',
    created_at: '2026-09-29T10:00:00Z',
    updated_at: '2026-09-29T10:00:00Z',
    submissions_count: 3,
    pending_submissions_count: 0,
    my_submission: null,
  };

  const mockSubmission: AssignmentSubmission = {
    id: 55,
    assignment: 10,
    assignment_title: 'Surah Al-Mulk Recitation Practice',
    max_score: 100,
    submission_type: 'audio_recitation',
    surah_number: 67,
    ayah_start: 1,
    ayah_end: 10,
    student: { id: 5, username: 'zayd', first_name: 'Zayd', last_name: 'Ali' },
    status: 'submitted',
    audio_recording: '/media/audio/recitation.webm',
    written_response: 'I practiced verse 5 multiple times.',
    attachment_file: null,
    submitted_at: '2026-09-29T14:30:00Z',
    score: null,
    rubric_scores: null,
    teacher_feedback: '',
    graded_by: null,
    graded_at: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAcademy).mockReturnValue({
      academyId: 1,
      activeAcademy: { id: 1, name: 'Darul Quran Academy' },
      activeRole: 'teacher',
    } as any);

    const teacherUser = { id: 2, role: 'lead', full_name: 'Ustadh Ahmad', email: 'teacher@quran.com' };
    vi.mocked(useAuth).mockReturnValue({
      user: teacherUser,
    } as any);

    vi.mocked(useOptionalAuth).mockReturnValue({
      user: teacherUser,
    } as any);

    vi.mocked(assessmentApi.getAssignments).mockResolvedValue([mockAssignment]);
    vi.mocked(assessmentApi.getSubmissions).mockResolvedValue([mockSubmission]);
    vi.mocked(curriculumApi.getTracks).mockResolvedValue([{ id: 1, name: 'Quran Memorization', slug: 'quran-memorization' } as any]);
    vi.mocked(curriculumApi.getMyTeachingTracks).mockResolvedValue([
      { id: 1, membership: 1, user: 2, username: 'ahmad', organization: 1, track: 1, track_slug: 'quran-memorization', active: true, created_at: '', updated_at: '' } as any,
    ]);
    vi.mocked(studentsApi.getMyStudents).mockResolvedValue([
      { id: 101, user_id: 5, username: 'zayd', first_name: 'Zayd', last_name: 'Ali', email: 'zayd@example.com', track_id: 1, date_of_birth: '2010-01-01', is_minor: true, enrollment_status: 'active', created_at: '', updated_at: '' } as any,
    ]);
  });

  it('renders assignments list with Quran reference info and teacher controls', async () => {
    renderWithProviders(<AssignmentsListView />);

    await waitFor(() => {
      expect(screen.getByText('Surah Al-Mulk Recitation Practice')).toBeInTheDocument();
      expect(screen.getByText(/Teacher: Ustadh Ahmad/)).toBeInTheDocument();
      expect(screen.getByText(/Surah #67/)).toBeInTheDocument();
      expect(screen.getByText(/Ayat 1 - 10/)).toBeInTheDocument();
      expect(screen.getByText('Create Assignment')).toBeInTheDocument();
    });
  });

  it('renders student submission modal with recitation guidelines', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 5, role: 'student', full_name: 'Zayd Ali' },
    } as any);

    renderWithProviders(
      <AssignmentSubmissionModal
        open={true}
        onOpenChange={vi.fn()}
        assignment={mockAssignment}
        submission={null}
      />
    );

    expect(screen.getByText('Surah Al-Mulk Recitation Practice')).toBeInTheDocument();
    expect(screen.getByText(/Recitation Audio Recording/)).toBeInTheDocument();
    expect(screen.getByText('Submit Homework')).toBeInTheDocument();
  });

  it('renders teacher grading modal with audio player and score inputs', async () => {
    renderWithProviders(
      <GradeSubmissionModal
        open={true}
        onOpenChange={vi.fn()}
        submission={mockSubmission}
      />
    );

    expect(screen.getByText('Grade Student Submission')).toBeInTheDocument();
    expect(screen.getByText(/Zayd Ali/)).toBeInTheDocument();
    expect(screen.getByText('Student Recitation Audio')).toBeInTheDocument();
    expect(screen.getByText(/I practiced verse 5 multiple times/)).toBeInTheDocument();
    expect(screen.getByText('Save Grade & Feedback')).toBeInTheDocument();
  });

  it('renders parent ward progress view with stats and audio recordings', async () => {
    vi.mocked(useAcademy).mockReturnValue({
      activeAcademy: { id: 1, name: 'Darul Quran Academy' },
      activeRole: 'parent',
    } as any);

    vi.mocked(useAuth).mockReturnValue({
      user: { id: 8, role: 'parent', first_name: 'Abu', last_name: 'Zayd', email: 'parent@quran.com' },
    } as any);

    vi.mocked(familyApi.getAcademyChildren).mockResolvedValue([
      { id: 5, first_name: 'Zayd', last_name: 'Ali', email: 'zayd@student.com' } as any,
    ]);

    vi.mocked(assessmentApi.getWardProgress).mockResolvedValue({
      student: { id: 5, username: 'zayd', first_name: 'Zayd', last_name: 'Ali' },
      total_assigned: 1,
      total_submitted: 1,
      total_graded: 1,
      average_score_pct: 95.0,
      recent_submissions: [
        {
          ...mockSubmission,
          status: 'graded',
          score: 95.0,
          teacher_feedback: 'Excellent recitation with accurate makharij.',
        },
      ],
    });

    renderWithProviders(<ParentWardAssessmentView />);

    await waitFor(() => {
      expect(screen.getByText("Ward's Quran Homework & Progress")).toBeInTheDocument();
      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText("Child's Recitation Recording")).toBeInTheDocument();
      expect(screen.getByText(/Excellent recitation with accurate makharij/)).toBeInTheDocument();
    });
  });

  it('renders owner assessment oversight dashboard with KPIs', async () => {
    vi.mocked(useAcademy).mockReturnValue({
      activeAcademy: { id: 1, name: 'Darul Quran Academy' },
      activeRole: 'owner',
    } as any);

    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, role: 'lead', first_name: 'Academy', last_name: 'Owner', email: 'owner@quran.com' },
    } as any);

    renderWithProviders(<OwnerAssessmentOversight />);

    await waitFor(() => {
      expect(screen.getByText('Academy Assignments')).toBeInTheDocument();
      expect(screen.getByText('Academy Submissions & Grading Oversight')).toBeInTheDocument();
      expect(screen.getByText('Zayd Ali')).toBeInTheDocument();
      expect(screen.getByText('New Assignment')).toBeInTheDocument();
    });
  });

  it('ensures owner/admin never sees "Submit Homework" button in assignments list', async () => {
    vi.mocked(useAcademy).mockReturnValue({
      activeAcademy: { id: 1, name: 'Darul Quran Academy' },
      activeRole: 'owner',
    } as any);

    // Even if user profile has role: student from initial self-registration
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, role: 'student', first_name: 'Owner', last_name: 'User', email: 'owner@quran.com' },
    } as any);

    renderWithProviders(<AssignmentsListView />);

    await waitFor(() => {
      expect(screen.getByText('Surah Al-Mulk Recitation Practice')).toBeInTheDocument();
      expect(screen.getByText('Create Assignment')).toBeInTheDocument();
      // Owner should NOT see Submit Homework
      expect(screen.queryByText('Submit Homework')).not.toBeInTheDocument();
      expect(screen.queryByText('View Submission')).not.toBeInTheDocument();
    });
  });
});
