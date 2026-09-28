import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OwnerAdminDashboard } from '../owner-admin-dashboard';
import { TeacherDashboard } from '../teacher-dashboard';
import { StudentDashboard } from '../student-dashboard';
import { ParentDashboard } from '../parent-dashboard';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import * as AuthProvider from '@/lib/auth/auth-provider';
import { invitationsApi } from '@/features/invitations/api/invitations';
import { teachersApi } from '@/features/teachers/api/teachers';
import { studentsApi } from '@/features/students/api/students';

vi.mock('@/features/teachers/api/teachers', () => ({
  teachersApi: {
    getTeacherConfigurations: vi.fn().mockResolvedValue([]),
    getTeacherTracks: vi.fn().mockResolvedValue([]),
  },
}));
import { curriculumApi } from '@/features/curriculum/api/curriculum';
import { schedulingApi } from '@/features/scheduling/api/scheduling';
import { assessmentApi } from '@/features/assessment/api/assessment';
import { payoutsApi } from '@/features/payouts/api/payouts';
import { progressApi } from '@/features/progress/api/progress';
import { membershipsApi } from '@/features/memberships/api/memberships';

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
    getAvailability: vi.fn(),
    getMyWaitlist: vi.fn().mockResolvedValue([]),
    getTeacherWaitlist: vi.fn().mockResolvedValue([]),
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

vi.mock('@/features/memberships/api/memberships', () => ({
  membershipsApi: {
    list: vi.fn().mockResolvedValue([]),
    update: vi.fn(),
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
    vi.mocked(membershipsApi.list).mockResolvedValue([]);
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

        // Teacher Working Hours & Capacity on Overview
        expect(screen.getByText('Teacher Working Hours & Capacity')).toBeInTheDocument();
        const inspectAvailLink = screen.getByRole('link', { name: /inspect teacher availabilities/i });
        expect(inspectAvailLink).toHaveAttribute('href', '/app/scheduling?tab=availability');
      });
    }, 15000);

    it('unifies onboarded students and teachers, showing correct counts and dedicated rosters', async () => {
      vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
        activeAcademy: { id: 1, name: 'Furqan Academy' },
        activeRole: 'owner',
      } as any);
      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 1, username: 'admin_user', first_name: 'Admin' },
      } as any);

      // 1 teacher via membership without configuration
      vi.mocked(membershipsApi.list).mockResolvedValue([
        { id: 101, user: 1, username: 'admin_user', role: 'owner', status: 'active', created_at: '2026-09-01T00:00:00Z' } as any,
        { id: 102, user: 50, username: 'ustadh_bilal', role: 'teacher', status: 'active', created_at: '2026-09-05T00:00:00Z' } as any,
        { id: 103, user: 60, username: 'student_maryam', role: 'student', status: 'active', created_at: '2026-09-10T00:00:00Z' } as any,
      ]);
      // Teacher configuration is empty (pending configuration)
      vi.mocked(teachersApi.getTeacherConfigurations).mockResolvedValue([]);

      // 2 students in StudentEnrollment (one overlaps with membership, one is enrollment-only)
      vi.mocked(studentsApi.getStudents).mockResolvedValue([
        {
          id: 11,
          user_id: 60,
          username: 'student_maryam',
          first_name: 'Maryam',
          last_name: 'Ahmed',
          enrollment_status: 'active',
          track_id: 5,
          level_id: 2,
          teacher_name: 'Ustadh Bilal',
        } as any,
        {
          id: 12,
          user_id: 70,
          username: 'student_hamzah',
          first_name: 'Hamzah',
          last_name: 'Ali',
          enrollment_status: 'active',
          track_id: null,
          level_id: null,
          teacher_name: null,
        } as any,
      ]);

      vi.mocked(curriculumApi.getTracks).mockResolvedValue([
        { id: 5, name: 'Tajweed Track', levels: [{ id: 2, name: 'Level 2' }] } as any,
      ]);
      vi.mocked(invitationsApi.list).mockResolvedValue([]);
      vi.mocked(schedulingApi.getAcademyBookings).mockResolvedValue([]);

      renderWithProviders(<OwnerAdminDashboard />);

      // Verify KPI counts
      await waitFor(() => {
        expect(screen.getAllByText('Teachers').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Enrolled Students').length).toBeGreaterThan(0);
      });

      // Switch to Teachers tab
      const teachersTab = screen.getByRole('tab', { name: /teachers/i });
      fireEvent.pointerDown(teachersTab, { button: 0, ctrlKey: false });
      fireEvent.click(teachersTab);

      await waitFor(() => {
        expect(screen.getByText('ustadh_bilal')).toBeInTheDocument();
        expect(screen.getByText('Pending Terms Setup')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /availability/i })).toHaveAttribute(
          'href',
          '/app/scheduling?tab=availability'
        );
      });

      // Switch to Students tab
      const studentsTab = screen.getByRole('tab', { name: /students/i });
      fireEvent.pointerDown(studentsTab, { button: 0, ctrlKey: false });
      fireEvent.click(studentsTab);

      await waitFor(() => {
        expect(screen.getByText('Maryam Ahmed')).toBeInTheDocument();
        expect(screen.getByText('Hamzah Ali')).toBeInTheDocument();
        expect(screen.getByText('Tajweed Track · Level 2')).toBeInTheDocument();
        expect(screen.getByText('Ustadh Bilal')).toBeInTheDocument();
        expect(screen.getByText('Unplaced Track')).toBeInTheDocument();
        expect(screen.getByText('No Teacher Assigned')).toBeInTheDocument();
      });

      // Switch to Members tab
      const membersTab = screen.getByRole('tab', { name: /members/i });
      fireEvent.pointerDown(membersTab, { button: 0, ctrlKey: false });
      fireEvent.click(membersTab);

      await waitFor(() => {
        const studentFilterBtn = screen.getByRole('button', { name: /student \(2\)/i });
        expect(studentFilterBtn).toBeInTheDocument();
        const teacherFilterBtn = screen.getByRole('button', { name: /teacher \(1\)/i });
        expect(teacherFilterBtn).toBeInTheDocument();
      });
    }, 15000);
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
        // Availability card & My Availability button
        expect(screen.getByText('Weekly Working Availability & Teaching Hours')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /my availability/i })).toHaveAttribute(
          'href',
          '/app/scheduling?tab=availability'
        );
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

        // Verifies Teacher Schedules & Class Booking section
        expect(screen.getByText('Teacher Schedules & Class Booking')).toBeInTheDocument();
        const bookClassLink = screen.getByRole('link', { name: /book a class \/ request slot/i });
        expect(bookClassLink).toHaveAttribute('href', '/app/scheduling/book');
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
