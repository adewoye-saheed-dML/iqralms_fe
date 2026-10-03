import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StudentPersonalLearningSpace } from '../components/student-personal-learning-space';
import { TeacherGradingQueue } from '../components/teacher-grading-queue';
import { StudentDetail } from '@/features/students/components/student-detail';
import { assessmentApi, StudentAssignment, AssignmentSubmission, FamilyAssessment } from '../api/assessment';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth, useOptionalAuth } from '@/lib/auth/auth-provider';
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
      getSubmissions: vi.fn(),
      getWardProgress: vi.fn(),
      getStudentAssessments: vi.fn(),
      getTeacherAssessments: vi.fn(),
    },
    resolveAssessmentMediaUrl: vi.fn((url) => (url ? `http://localhost:8000${url}` : null)),
  };
});

vi.mock('@/features/curriculum/api/curriculum', () => ({
  curriculumApi: {
    getTracks: vi.fn(),
    getLevels: vi.fn(),
    getMyTeachingTracks: vi.fn(),
  },
}));

vi.mock('@/features/students/api/students', () => ({
  studentsApi: {
    getStudent: vi.fn(),
    getMyStudents: vi.fn(),
    getAcademyStudents: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Assessment Personal Learning Space & Disclosure Boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAcademy).mockReturnValue({
      academyId: 1,
      activeAcademy: { id: 1, name: 'Darul Quran Academy' },
      activeRole: 'student',
    } as any);

    vi.mocked(useAuth).mockReturnValue({
      user: { id: 10, role: 'student', full_name: 'Zayd Ali', first_name: 'Zayd' },
    } as any);

    vi.mocked(useOptionalAuth).mockReturnValue({
      user: { id: 10, role: 'student', full_name: 'Zayd Ali', first_name: 'Zayd' },
    } as any);

    vi.mocked(assessmentApi.getAssignments).mockResolvedValue([]);
    vi.mocked(assessmentApi.getSubmissions).mockResolvedValue([]);
    vi.mocked(assessmentApi.getStudentAssessments).mockResolvedValue([]);
    vi.mocked(assessmentApi.getWardProgress).mockResolvedValue(null as any);
    vi.mocked(curriculumApi.getTracks).mockResolvedValue([]);
    vi.mocked(curriculumApi.getLevels).mockResolvedValue([]);
    vi.mocked(curriculumApi.getMyTeachingTracks).mockResolvedValue([]);
    vi.mocked(studentsApi.getMyStudents).mockResolvedValue([]);
    vi.mocked(studentsApi.getAcademyStudents).mockResolvedValue([]);
  });

  it('renders student personal learning space with joined homework and session assessments', async () => {
    const mockProgress = {
      total_assigned: 5,
      total_submitted: 4,
      total_graded: 3,
      average_score_pct: 92.5,
      recent_submissions: [
        {
          id: 1,
          assignment: 10,
          assignment_title: 'Surah Al-Mulk Tajweed Test',
          max_score: 100,
          score: 95,
          status: 'graded',
          submission_type: 'audio_recitation',
          submitted_at: '2026-10-01T12:00:00Z',
          teacher_feedback: 'MashaAllah, excellent makharij and fluent recitation.',
          audio_recording: '/media/audio/test1.webm',
          graded_by: { id: 2, username: 'ustadh_ahmad', first_name: 'Ustadh', last_name: 'Ahmad' },
          student: { id: 10, username: 'zayd', first_name: 'Zayd', last_name: 'Ali' },
        },
      ],
    };

    const mockSessionAssessments: FamilyAssessment[] = [
      {
        id: 99,
        booking: {
          id: 400,
          level: { id: 2, name: 'Level 2 - Juz 30' } as any,
          start_time_utc: '2026-09-30T10:00:00Z',
          duration_minutes: 45,
          status: 'completed',
        },
        track: 'Quran Recitation & Memorization',
        assessed_by: 'Ustadh Ahmad',
        assessed_at: '2026-09-30T11:00:00Z',
        assessed_at_local: null,
        rubric_name: 'Tajweed Fluency Rubric',
        overall_average: '9.4',
        teacher_summary: 'Consistently clear ghunnah and qalqalah in this session.',
        scores: [
          { id: 1, criterion: 1, criterion_name: 'Makharij', score: '9.5', order: 1 } as any,
          { id: 2, criterion: 2, criterion_name: 'Tajweed Rules', score: '9.3', order: 2 } as any,
        ],
      },
    ];

    vi.mocked(assessmentApi.getWardProgress).mockResolvedValue(mockProgress as any);
    vi.mocked(assessmentApi.getStudentAssessments).mockResolvedValue(mockSessionAssessments);

    renderWithProviders(<StudentPersonalLearningSpace />);

    await waitFor(() => {
      // Personal Learning Space Header
      expect(screen.getByText('Personal Learning Space & Assessment Records')).toBeInTheDocument();

      // Progress Stats
      expect(screen.getByText('5')).toBeInTheDocument(); // total assigned
      expect(screen.getByText('4')).toBeInTheDocument(); // completed / submitted
      expect(screen.getByText('3')).toBeInTheDocument(); // evaluated / graded
      expect(screen.getByText('92.5%')).toBeInTheDocument(); // average

      // Joined Continuous Homework Assessment
      expect(screen.getByText('Surah Al-Mulk Tajweed Test')).toBeInTheDocument();
      expect(screen.getByText(/Score: 95 \/ 100/)).toBeInTheDocument();
      expect(screen.getByText(/MashaAllah, excellent makharij and fluent recitation/)).toBeInTheDocument();

      // Joined Session Assessment
      expect(screen.getByText('Level 2 - Juz 30 Class Evaluation')).toBeInTheDocument();
      expect(screen.getByText(/Score: 9.4 \/ 10/)).toBeInTheDocument();
      expect(screen.getByText(/Consistently clear ghunnah and qalqalah/)).toBeInTheDocument();
      expect(screen.getByText(/Makharij:/)).toBeInTheDocument();
    });
  });

  it('protects student assessment data and prevents disclosure to an unattached teacher in StudentDetail', async () => {
    // Current user is Teacher (Ustadh Bilal, ID 20), activeRole is teacher
    const teacherUser = { id: 20, role: 'sub', full_name: 'Ustadh Bilal', email: 'bilal@quran.com' };
    vi.mocked(useAcademy).mockReturnValue({
      academyId: 1,
      activeAcademy: { id: 1, name: 'Darul Quran Academy' },
      activeRole: 'teacher',
    } as any);
    vi.mocked(useAuth).mockReturnValue({ user: teacherUser } as any);
    vi.mocked(useOptionalAuth).mockReturnValue({ user: teacherUser } as any);

    // Student (Zayd, user_id 10) enrolled in track 1
    const mockStudent = {
      id: 50,
      user_id: 10,
      username: 'zayd',
      email: 'zayd@example.com',
      first_name: 'Zayd',
      last_name: 'Ali',
      is_minor: true,
      enrollment_status: 'active',
      track_id: 1,
      level_id: 2,
      teacher_id: 2, // Attached to Ustadh Ahmad (ID 2), NOT Ustadh Bilal (ID 20)
    };

    vi.mocked(studentsApi.getStudent).mockResolvedValue(mockStudent as any);
    // Teacher Bilal only teaches student 99, NOT Zayd (user_id 10)
    vi.mocked(studentsApi.getMyStudents).mockResolvedValue([
      { id: 70, user_id: 99, username: 'other_student' } as any,
    ]);
    vi.mocked(curriculumApi.getMyTeachingTracks).mockResolvedValue([
      { id: 1, membership: 1, user: 20, organization: 1, track: 1, active: true } as any,
    ]);

    renderWithProviders(<StudentDetail enrollmentId={50} />);

    await waitFor(() => {
      // Must NOT disclose academic performance stats
      expect(screen.queryByText('Academic Performance & Submissions')).not.toBeInTheDocument();
      // Must display the confidentiality boundary card
      expect(screen.getByText('Assessments & Performance Protected')).toBeInTheDocument();
      expect(screen.getByText(/You are not attached to this student for this curriculum subject/)).toBeInTheDocument();
    });
  });

  it('protects student assessment data when teacher is attached but does not offer the student subject', async () => {
    // Teacher Bilal (ID 20) is attached to Zayd, but only teaches Track 5 (Arabic Grammar),
    // whereas Zayd is enrolled in Track 1 (Quran Memorization)
    const teacherUser = { id: 20, role: 'sub', full_name: 'Ustadh Bilal', email: 'bilal@quran.com' };
    vi.mocked(useAcademy).mockReturnValue({
      academyId: 1,
      activeAcademy: { id: 1, name: 'Darul Quran Academy' },
      activeRole: 'teacher',
    } as any);
    vi.mocked(useAuth).mockReturnValue({ user: teacherUser } as any);
    vi.mocked(useOptionalAuth).mockReturnValue({ user: teacherUser } as any);

    const mockStudent = {
      id: 50,
      user_id: 10,
      username: 'zayd',
      email: 'zayd@example.com',
      first_name: 'Zayd',
      last_name: 'Ali',
      is_minor: true,
      enrollment_status: 'active',
      track_id: 1, // Student is in Quran Memorization (Track 1)
      level_id: 2,
    };

    vi.mocked(studentsApi.getStudent).mockResolvedValue(mockStudent as any);
    // Attached in academy:
    vi.mocked(studentsApi.getMyStudents).mockResolvedValue([
      { id: 50, user_id: 10, username: 'zayd', track_id: 1 } as any,
    ]);
    // BUT teacher Bilal only teaches Track 5 (NOT Track 1):
    vi.mocked(curriculumApi.getMyTeachingTracks).mockResolvedValue([
      { id: 5, membership: 1, user: 20, organization: 1, track: 5, active: true } as any,
    ]);

    renderWithProviders(<StudentDetail enrollmentId={50} />);

    await waitFor(() => {
      expect(screen.queryByText('Academic Performance & Submissions')).not.toBeInTheDocument();
      expect(screen.getByText('Assessments & Performance Protected')).toBeInTheDocument();
    });
  });

  it('discloses assessment data to attached teacher who offers the subject', async () => {
    // Ustadh Ahmad (ID 2) is attached to Zayd (user_id 10) AND teaches Track 1
    const teacherUser = { id: 2, role: 'lead', full_name: 'Ustadh Ahmad', email: 'ahmad@quran.com' };
    vi.mocked(useAcademy).mockReturnValue({
      academyId: 1,
      activeAcademy: { id: 1, name: 'Darul Quran Academy' },
      activeRole: 'teacher',
    } as any);
    vi.mocked(useAuth).mockReturnValue({ user: teacherUser } as any);
    vi.mocked(useOptionalAuth).mockReturnValue({ user: teacherUser } as any);

    const mockStudent = {
      id: 50,
      user_id: 10,
      username: 'zayd',
      email: 'zayd@example.com',
      first_name: 'Zayd',
      last_name: 'Ali',
      is_minor: true,
      enrollment_status: 'active',
      track_id: 1,
      level_id: 2,
    };

    vi.mocked(studentsApi.getStudent).mockResolvedValue(mockStudent as any);
    vi.mocked(studentsApi.getMyStudents).mockResolvedValue([
      { id: 50, user_id: 10, username: 'zayd', track_id: 1 } as any,
    ]);
    vi.mocked(curriculumApi.getMyTeachingTracks).mockResolvedValue([
      { id: 1, membership: 1, user: 2, organization: 1, track: 1, active: true } as any,
    ]);
    vi.mocked(assessmentApi.getWardProgress).mockResolvedValue({
      total_assigned: 8,
      total_submitted: 7,
      total_graded: 6,
      average_score_pct: 95,
      recent_submissions: [],
    } as any);

    renderWithProviders(<StudentDetail enrollmentId={50} />);

    await waitFor(() => {
      // Must show academic performance card
      expect(screen.getByText('Academic Performance & Submissions')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument(); // total assigned
      expect(screen.getByText('95%')).toBeInTheDocument(); // average
    });
  });

  it('filters out unattached student submissions in TeacherGradingQueue', async () => {
    // Ustadh Ahmad (ID 2) teaches Track 1 and is attached to Zayd (ID 10), but NOT Tariq (ID 77)
    const teacherUser = { id: 2, role: 'sub', full_name: 'Ustadh Ahmad', email: 'ahmad@quran.com' };
    vi.mocked(useAcademy).mockReturnValue({
      academyId: 1,
      activeAcademy: { id: 1, name: 'Darul Quran Academy' },
      activeRole: 'teacher',
    } as any);
    vi.mocked(useAuth).mockReturnValue({ user: teacherUser } as any);
    vi.mocked(useOptionalAuth).mockReturnValue({ user: teacherUser } as any);

    vi.mocked(studentsApi.getMyStudents).mockResolvedValue([
      { id: 50, user_id: 10, username: 'zayd', track_id: 1 } as any,
    ]);
    vi.mocked(curriculumApi.getMyTeachingTracks).mockResolvedValue([
      { id: 1, membership: 1, user: 2, organization: 1, track: 1, active: true } as any,
    ]);

    const mockSubmissions = [
      {
        id: 101,
        assignment: 1,
        assignment_title: 'Zayd Recitation Task',
        max_score: 100,
        score: null,
        status: 'submitted',
        student: { id: 10, username: 'zayd', first_name: 'Zayd', last_name: 'Ali' },
        submitted_at: '2026-10-02T10:00:00Z',
      },
      {
        id: 102,
        assignment: 2,
        assignment_title: 'Tariq Unattached Submission',
        max_score: 100,
        score: null,
        status: 'submitted',
        student: { id: 77, username: 'tariq', first_name: 'Tariq', last_name: 'Farooq' },
        submitted_at: '2026-10-02T11:00:00Z',
      },
    ];

    vi.mocked(assessmentApi.getAssignments).mockResolvedValue([
      { id: 1, track: 1, title: 'Zayd Recitation Task' } as any,
      { id: 2, track: 9, title: 'Tariq Unattached Submission' } as any,
    ]);
    vi.mocked(assessmentApi.getSubmissions).mockResolvedValue(mockSubmissions as any);

    renderWithProviders(<TeacherGradingQueue />);

    await waitFor(() => {
      // Attached student's submission is visible
      expect(screen.getByText('Zayd Ali')).toBeInTheDocument();
      expect(screen.getByText('Zayd Recitation Task')).toBeInTheDocument();

      // Unattached student's submission MUST NOT be disclosed
      expect(screen.queryByText('Tariq Farooq')).not.toBeInTheDocument();
      expect(screen.queryByText('Tariq Unattached Submission')).not.toBeInTheDocument();
    });
  });
});
