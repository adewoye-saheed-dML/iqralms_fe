import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OwnerAdminDashboard } from '../owner-admin-dashboard';
import { TeacherDashboard } from '../teacher-dashboard';
import { StudentDashboard } from '../student-dashboard';
import { ParentDashboard } from '../parent-dashboard';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import * as AuthProvider from '@/lib/auth/auth-provider';
import { invitationsApi } from '@/features/invitations/api/invitations';
import { studentsApi } from '@/features/students/api/students';
import { curriculumApi } from '@/features/curriculum/api/curriculum';
import { schedulingApi } from '@/features/scheduling/api/scheduling';
import { assessmentApi } from '@/features/assessment/api/assessment';
import { payoutsApi } from '@/features/payouts/api/payouts';
import { progressApi } from '@/features/progress/api/progress';

vi.mock('@/features/invitations/api/invitations', () => ({
  invitationsApi: { list: vi.fn() },
}));

vi.mock('@/features/students/api/students', () => ({
  studentsApi: {
    getStudents: vi.fn(),
    getMyStudents: vi.fn(),
  },
}));

vi.mock('@/features/curriculum/api/curriculum', () => ({
  curriculumApi: { getTracks: vi.fn() },
}));

vi.mock('@/features/scheduling/api/scheduling', () => ({
  schedulingApi: {
    getAcademyBookings: vi.fn(),
    getTeachingBookings: vi.fn(),
    getMyBookings: vi.fn(),
  },
}));

vi.mock('@/features/assessment/api/assessment', () => ({
  assessmentApi: {
    getQueue: vi.fn(),
    getTeacherAssessments: vi.fn(),
    getStudentAssessments: vi.fn(),
    getChildAssessments: vi.fn(),
    getMyAssessments: vi.fn(),
  },
}));

vi.mock('@/features/payouts/api/payouts', () => ({
  payoutsApi: {
    getMyPayouts: vi.fn(),
    getMyStatement: vi.fn(),
  },
}));

vi.mock('@/features/progress/api/progress', () => ({
  progressApi: {
    getAllSnapshots: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Role-Based Dashboards and SSoT Compliance', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('OwnerAdminDashboard', () => {
    it('renders admin overview, KPIs, and today classes with class session link', async () => {
      vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
        activeAcademy: { id: 1, name: 'Furqan Academy' },
        activeRole: 'owner',
      } as any);
      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 1, username: 'admin_user', first_name: 'Admin' },
      } as any);

      vi.mocked(invitationsApi.list).mockResolvedValue([
        { id: 1, role: 'teacher', status: 'accepted', email: 't@example.com' } as any,
      ]);
      vi.mocked(studentsApi.getStudents).mockResolvedValue([
        { id: 10, username: 'student_1' } as any,
      ]);
      vi.mocked(curriculumApi.getTracks).mockResolvedValue([
        { id: 5, name: 'Tajweed Track' } as any,
      ]);
      vi.mocked(schedulingApi.getAcademyBookings).mockResolvedValue([
        {
          id: 42,
          student: { id: 10, username: 'zayd', first_name: 'Zayd' },
          teacher: { id: 2, username: 'ustadh', first_name: 'Ali' },
          level: { id: 1, name: 'Level 1 Tajweed' },
          start_time_utc: '2026-09-25T14:00:00Z',
          status: 'scheduled',
        } as any,
      ]);

      renderWithProviders(<OwnerAdminDashboard />);

      expect(screen.getByText('Academy Administration')).toBeInTheDocument();
      expect(screen.getByText('Furqan Academy')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText("Today's Classes & Live Sessions")).toBeInTheDocument();
        expect(screen.getByText('Level 1 Tajweed')).toBeInTheDocument();
        expect(screen.getByText('Student: Zayd · Teacher: Ali')).toBeInTheDocument();
        const sessionLink = screen.getByRole('link', { name: /class session/i });
        expect(sessionLink).toHaveAttribute('href', '/app/scheduling/42');
      });
    });
  });

  describe('TeacherDashboard', () => {
    it('renders ordinary teacher dashboard without unauthorized review queue API call', async () => {
      vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
        activeAcademy: { id: 1, name: 'Furqan Academy' },
        activeRole: 'teacher',
      } as any);
      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 5, username: 'teacher_sub', role: 'sub' },
      } as any);

      vi.mocked(schedulingApi.getTeachingBookings).mockResolvedValue([
        {
          id: 77,
          student: { id: 12, first_name: 'Ibrahim' },
          start_time_utc: '2026-09-25T15:00:00Z',
          status: 'scheduled',
        } as any,
      ]);
      vi.mocked(assessmentApi.getTeacherAssessments).mockResolvedValue([
        { id: 1, overall_score: '8.50' } as any,
      ]);
      vi.mocked(payoutsApi.getMyPayouts).mockResolvedValue([
        { id: 9, amount: '50.00', currency: 'USD' } as any,
      ]);

      renderWithProviders(<TeacherDashboard />);

      expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument();

      await waitFor(() => {
        // Must NOT call review queue for ordinary sub teacher
        expect(assessmentApi.getQueue).not.toHaveBeenCalled();
        // Calls teacher assessments instead
        expect(assessmentApi.getTeacherAssessments).toHaveBeenCalledWith(1);
        expect(screen.getByText('Assessments & Submissions')).toBeInTheDocument();
        // Provides direct Join Class button
        const joinLink = screen.getByRole('link', { name: /join class/i });
        expect(joinLink).toHaveAttribute('href', '/app/scheduling/77');
      });
    });

    it('renders review queue for lead teacher', async () => {
      vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
        activeAcademy: { id: 1, name: 'Furqan Academy' },
        activeRole: 'teacher',
      } as any);
      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 6, username: 'teacher_lead', role: 'lead' },
      } as any);

      vi.mocked(schedulingApi.getTeachingBookings).mockResolvedValue([]);
      vi.mocked(assessmentApi.getQueue).mockResolvedValue([
        { id: 201, booking: { level: { name: 'Advanced Tajweed' }, start_time_utc: '2026-09-25T10:00:00Z' } } as any,
      ]);
      vi.mocked(payoutsApi.getMyPayouts).mockResolvedValue([]);

      renderWithProviders(<TeacherDashboard />);

      await waitFor(() => {
        expect(assessmentApi.getQueue).toHaveBeenCalledWith(1);
        expect(screen.getByText('Assessments & Review Queue')).toBeInTheDocument();
        expect(screen.getByText(/1 pending/i)).toBeInTheDocument();
      });
    });
  });

  describe('StudentDashboard', () => {
    it('calls student-eligible assessments endpoint and displays Join Live Class link', async () => {
      vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
        activeAcademy: { id: 1, name: 'Furqan Academy' },
        activeRole: 'student',
      } as any);
      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 30, username: 'fatima', role: 'student', first_name: 'Fatima' },
      } as any);

      vi.mocked(schedulingApi.getMyBookings).mockResolvedValue([
        {
          id: 88,
          start_time_utc: '2026-09-25T16:00:00Z',
          status: 'scheduled',
          cohort: false,
        } as any,
      ]);
      vi.mocked(progressApi.getAllSnapshots).mockResolvedValue([]);
      vi.mocked(assessmentApi.getStudentAssessments).mockResolvedValue([]);

      renderWithProviders(<StudentDashboard />);

      expect(screen.getByText('Student Learning Portal')).toBeInTheDocument();

      await waitFor(() => {
        // Verifies the fix: student endpoint is called, NOT teacher endpoint
        expect(assessmentApi.getStudentAssessments).toHaveBeenCalledWith(1);
        expect(assessmentApi.getMyAssessments).not.toHaveBeenCalled();

        // Verifies direct Jitsi / Live Class link
        const joinLink = screen.getByRole('link', { name: /join live class/i });
        expect(joinLink).toHaveAttribute('href', '/app/scheduling/88');
      });
    });
  });

  describe('ParentDashboard', () => {
    it('calls parent-safe student and assessment queries and includes Join Class link', async () => {
      vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
        activeAcademy: { id: 1, name: 'Furqan Academy' },
        activeRole: 'parent',
      } as any);
      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 40, username: 'parent_maryam', role: 'parent', first_name: 'Maryam' },
      } as any);

      vi.mocked(schedulingApi.getMyBookings).mockResolvedValue([
        {
          id: 99,
          level: { name: 'Hifz Track 1' },
          start_time_utc: '2026-09-25T17:00:00Z',
          status: 'scheduled',
        } as any,
      ]);
      vi.mocked(studentsApi.getMyStudents).mockResolvedValue([
        { id: 31, username: 'child_yusuf', first_name: 'Yusuf' } as any,
      ]);
      vi.mocked(progressApi.getAllSnapshots).mockResolvedValue([]);
      vi.mocked(assessmentApi.getChildAssessments).mockResolvedValue([]);

      renderWithProviders(<ParentDashboard />);

      expect(screen.getByText('Parent Portal')).toBeInTheDocument();

      await waitFor(() => {
        expect(studentsApi.getMyStudents).toHaveBeenCalledWith(1);
        expect(assessmentApi.getMyAssessments).not.toHaveBeenCalled();

        const joinLink = screen.getByRole('link', { name: /join class/i });
        expect(joinLink).toHaveAttribute('href', '/app/scheduling/99');
      });
    });
  });
});
