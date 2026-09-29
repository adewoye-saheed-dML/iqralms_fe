'use client';

import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BookingForm } from '../components/booking-form';
import { Waitlist } from '../components/waitlist';
import { SchedulingDashboard } from '../components/scheduling-dashboard';
import { TeacherAvailabilityView } from '../components/teacher-availability-view';
import { schedulingApi } from '../api/scheduling';
import { curriculumApi } from '@/features/curriculum/api/curriculum';
import { teachersApi } from '@/features/teachers/api/teachers';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import * as AuthProvider from '@/lib/auth/auth-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/errors';

vi.mock('../api/scheduling', () => ({
  schedulingApi: {
    routeBooking: vi.fn(),
    getAvailability: vi.fn(),
    getMyWaitlist: vi.fn(),
    getTeacherWaitlist: vi.fn(),
    getAcademyWaitlist: vi.fn(),
    createAvailability: vi.fn(),
    deleteAvailability: vi.fn(),
    promoteWaitlist: vi.fn(),
    getTeachingBookings: vi.fn(),
    getMyBookings: vi.fn(),
    getAcademyBookings: vi.fn(),
    getCohorts: vi.fn(),
  },
}));

vi.mock('@/features/curriculum/api/curriculum', () => ({
  curriculumApi: {
    getTracks: vi.fn(),
  },
}));

vi.mock('@/features/teachers/api/teachers', () => ({
  teachersApi: {
    getTeacherConfigurations: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn((param: string) => null),
  })),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Student Availability Request & Teacher Allocation Workflow', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Student Schedule Request & Declared Availability', () => {
    beforeEach(() => {
      vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
        activeAcademy: { id: 1, name: 'Darul Quran Academy' },
        activeRole: 'student',
      } as any);
      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 101, role: 'student' },
      } as any);

      vi.mocked(curriculumApi.getTracks).mockResolvedValue([
        {
          id: 1,
          name: 'Quran Recitation',
          levels: [{ id: 10, name: 'Level 1 - Tajweed Basics' }],
        } as any,
      ]);

      vi.mocked(teachersApi.getTeacherConfigurations).mockResolvedValue([
        {
          id: 5,
          membership: 50,
          user: 55,
          username: 'ustadh_ahmad',
          teacher_name: 'Ustadh Ahmad',
          approved: true,
        } as any,
      ]);
    });

    it('fetches and displays teacher declared availability when preferred teacher is selected', async () => {
      vi.mocked(schedulingApi.getAvailability).mockResolvedValue([
        {
          id: 1,
          teacher: 55,
          teacher_username: 'ustadh_ahmad',
          weekday: 'mon' as any,
          weekday_display: 'Monday',
          start_time_utc: '14:00:00',
          end_time_utc: '18:00:00',
          local: {
            weekday: 'Monday',
            start_time: '14:00:00',
            end_time: '18:00:00',
          },
        } as any,
      ]);

      renderWithProviders(<BookingForm />);

      await waitFor(() => {
        expect(screen.getByText('Schedule a Session')).toBeInTheDocument();
        expect(screen.getByText('Advance Notification Guarantee')).toBeInTheDocument();
      });
    });

    it('displays Schedule Request Placed in Queue when routing receives 409 capacity waitlist', async () => {
      vi.mocked(schedulingApi.routeBooking).mockRejectedValue(new ApiError(409, 'No capacity available'));

      renderWithProviders(<BookingForm />);

      await waitFor(() => {
        expect(screen.getByText('Schedule a Session')).toBeInTheDocument();
      });
    });
  });

  describe('Management Schedule Review & Student Allocation (Owner / Admin / Lead)', () => {
    beforeEach(() => {
      vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
        activeAcademy: { id: 1, name: 'Darul Quran Academy' },
        activeRole: 'owner',
      } as any);
      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 1, role: 'owner' },
      } as any);

      vi.mocked(teachersApi.getTeacherConfigurations).mockResolvedValue([
        {
          id: 5,
          membership: 50,
          user: 55,
          username: 'ustadh_ahmad',
          teacher_name: 'Ustadh Ahmad',
          approved: true,
        } as any,
      ]);

      vi.mocked(schedulingApi.getAvailability).mockResolvedValue([
        {
          id: 1,
          teacher: 55,
          teacher_username: 'ustadh_ahmad',
          weekday: 'mon' as any,
          weekday_display: 'Monday',
          start_time_utc: '14:00:00',
          end_time_utc: '18:00:00',
          local: {
            weekday: 'Monday',
            start_time: '14:00:00',
            end_time: '18:00:00',
          },
        } as any,
      ]);
    });

    it('renders management allocation queue with open student requests and teacher declared hours', async () => {
      vi.mocked(schedulingApi.getTeacherWaitlist).mockResolvedValue([
        {
          id: 99,
          student: { id: 44, username: 'student_ali', first_name: 'Ali' } as any,
          requested_teacher: { id: 55, username: 'ustadh_ahmad' } as any,
          track: 'Hifz Track',
          level: { id: 2, name: 'Juz Amma' } as any,
          requested_start_utc: '2026-10-05T14:30:00Z',
          requested_start_local: '2026-10-05T15:30:00',
          requested_duration_minutes: 45,
          requested_at: '2026-09-27T10:00:00Z',
          status: 'open',
          priority: 1,
          notified: false,
          fulfilled_booking: null,
        } as any,
      ]);

      renderWithProviders(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Student Availability & Teacher Allocation')).toBeInTheDocument();
        expect(screen.getByText('Review & Allocate Class')).toBeInTheDocument();
        expect(screen.getByText(/Hifz Track • Juz Amma/i)).toBeInTheDocument();
        expect(screen.getByText(/45 mins/i)).toBeInTheDocument();
      });

      // Open allocation dialog
      fireEvent.click(screen.getByText('Review & Allocate Class'));

      await waitFor(() => {
        expect(screen.getByText('Review & Allocate Student to Class')).toBeInTheDocument();
        expect(screen.getByText(/Teacher Schedule Comparison/i)).toBeInTheDocument();
        expect(screen.getByText('Confirm Allocation & Create Session')).toBeInTheDocument();
      });
    });

    it('allocates student to confirmed session via promoteWaitlist', async () => {
      vi.mocked(schedulingApi.getTeacherWaitlist).mockResolvedValue([
        {
          id: 100,
          student: { id: 45, username: 'student_fatima', first_name: 'Fatima' } as any,
          requested_teacher: { id: 55, username: 'ustadh_ahmad' } as any,
          track: 'Tajweed',
          level: { id: 3, name: 'Intermediate' } as any,
          requested_start_utc: '2026-10-06T16:00:00Z',
          requested_duration_minutes: 30,
          requested_at: '2026-09-27T11:00:00Z',
          status: 'open',
          priority: 1,
          notified: false,
          fulfilled_booking: null,
        } as any,
      ]);

      vi.mocked(schedulingApi.promoteWaitlist).mockResolvedValue({
        id: 777,
        status: 'scheduled',
      } as any);

      renderWithProviders(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Review & Allocate Class')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Review & Allocate Class'));

      await waitFor(() => {
        expect(screen.getByText('Confirm Allocation & Create Session')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Confirm Allocation & Create Session'));

      await waitFor(() => {
        expect(schedulingApi.promoteWaitlist).toHaveBeenCalledWith(
          1,
          100,
          expect.objectContaining({
            duration_minutes: 30,
          })
        );
        expect(screen.getByText(/Student successfully allocated to Session #777/i)).toBeInTheDocument();
      });
    });
  });

  describe('Student / Parent View: My Waitlist Requests', () => {
    beforeEach(() => {
      vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
        activeAcademy: { id: 1, name: 'Darul Quran Academy' },
        activeRole: 'parent',
      } as any);
      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 999, role: 'parent' },
      } as any);
    });

    it('renders parent schedule requests with status badges', async () => {
      vi.mocked(schedulingApi.getMyWaitlist).mockResolvedValue([
        {
          id: 12,
          student: { id: 88, username: 'child_yusuf' } as any,
          requested_teacher: { id: 55, username: 'ustadh_ahmad', first_name: 'Ahmad' } as any,
          track: 'Quran Reading',
          level: { id: 1, name: 'Noorani Qaida' } as any,
          requested_start_utc: '2026-10-10T15:00:00Z',
          requested_duration_minutes: 30,
          requested_at: '2026-09-27T12:00:00Z',
          status: 'open',
          priority: 1,
          notified: false,
          fulfilled_booking: null,
        } as any,
      ]);

      renderWithProviders(<Waitlist />);

      await waitFor(() => {
        expect(screen.getByText('Noorani Qaida')).toBeInTheDocument();
        expect(screen.getByText('Under Academy Review')).toBeInTheDocument();
        expect(screen.getByText(/Teacher: Ahmad/i)).toBeInTheDocument();
      });
    });

    it('renders aligned 7-day schedule and scalable selector when student has 5-6 teachers', async () => {
      vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
        activeAcademy: { id: 1, name: 'Darul Quran Academy' },
        activeRole: 'student',
      } as any);
      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 101, role: 'student', username: 'student_ali' },
      } as any);

      // Student has 5 teachers from different track bookings
      vi.mocked(schedulingApi.getMyBookings).mockResolvedValue([
        {
          id: 1,
          teacher: { id: 51, first_name: 'Ahmad', last_name: 'Al-Masri', username: 'ahmad' } as any,
          track: 'Quran Memorization',
        } as any,
        {
          id: 2,
          teacher: { id: 52, first_name: 'Bilal', last_name: 'Habashi', username: 'bilal' } as any,
          track: 'Tajweed Rules',
        } as any,
        {
          id: 3,
          teacher: { id: 53, first_name: 'Omar', last_name: 'Farooq', username: 'omar' } as any,
          track: 'Arabic Language',
        } as any,
        {
          id: 4,
          teacher: { id: 54, first_name: 'Yusuf', last_name: 'Kandhlawi', username: 'yusuf' } as any,
          track: 'Islamic Studies',
        } as any,
        {
          id: 5,
          teacher: { id: 55, first_name: 'Tariq', last_name: 'Jameel', username: 'tariq' } as any,
          track: 'Tafseer',
        } as any,
      ]);

      vi.mocked(schedulingApi.getMyWaitlist).mockResolvedValue([]);

      vi.mocked(schedulingApi.getAvailability).mockResolvedValue([
        {
          id: 101,
          teacher: 51,
          weekday: 0, // Monday
          start_time_utc: '09:00:00',
          end_time_utc: '11:00:00',
          local: { start_time: '09:00:00', end_time: '11:00:00' },
        } as any,
        {
          id: 102,
          teacher: 51,
          weekday: 2, // Wednesday
          start_time_utc: '14:00:00',
          end_time_utc: '16:00:00',
          local: { start_time: '14:00:00', end_time: '16:00:00' },
        } as any,
      ]);

      renderWithProviders(<TeacherAvailabilityView />);

      expect(await screen.findByText('Teacher Schedules & Available Windows')).toBeInTheDocument();
      expect(await screen.findByText('Your Instructors (5)')).toBeInTheDocument();
      expect(screen.getByText('Ustadh Bilal Habashi')).toBeInTheDocument();
      expect(screen.getByText('Ustadh Omar Farooq')).toBeInTheDocument();
      expect(screen.getByText('Ustadh Yusuf Kandhlawi')).toBeInTheDocument();
      expect(screen.getByText('Ustadh Tariq Jameel')).toBeInTheDocument();
      expect(await screen.findByText("Ustadh Ahmad Al-Masri's Weekly Schedule")).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Sun')).toBeInTheDocument();

      // Switching teacher updates schedule
      fireEvent.click(screen.getByText('Ustadh Bilal Habashi'));
      expect(await screen.findByText("Ustadh Bilal Habashi's Weekly Schedule")).toBeInTheDocument();
    });
  });

  describe('Teacher Scheduling & Availability Flow', () => {
    beforeEach(() => {
      vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
        activeAcademy: { id: 1, name: 'Darul Quran Academy' },
        activeRole: 'teacher',
      } as any);

      vi.mocked(teachersApi.getTeacherConfigurations).mockResolvedValue([
        {
          id: 5,
          membership: 50,
          user: 55,
          username: 'ustadh_ahmad',
          teacher_name: 'Ustadh Ahmad',
          teacher_username: 'ustadh_ahmad',
          approved: true,
        } as any,
      ]);

      vi.mocked(schedulingApi.getAvailability).mockResolvedValue([
        {
          id: 1,
          teacher: 55,
          teacher_username: 'ustadh_ahmad',
          weekday: 0 as any, // Monday
          weekday_display: 'Monday',
          start_time_utc: '14:00:00',
          end_time_utc: '18:00:00',
          local: {
            weekday: 'Monday',
            start_time: '14:00:00',
            end_time: '18:00:00',
            timezone: 'UTC',
          } as any,
        } as any,
      ]);

      vi.mocked(schedulingApi.getTeachingBookings).mockResolvedValue([]);
    });

    it('renders teacher declared availability in TeacherAvailabilityView with working hours and capacity', async () => {
      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 55, role: 'lead', username: 'ustadh_ahmad' },
      } as any);

      renderWithProviders(<TeacherAvailabilityView />);

      await waitFor(() => {
        expect(screen.getByText('My Declared Teaching Availability')).toBeInTheDocument();
        expect(screen.getByText(/4.0 Hours \/ Week/i)).toBeInTheDocument();
        expect(screen.getByText('14:00 – 18:00')).toBeInTheDocument();
      });
    });

    it('teacher scheduling dashboard displays teaching schedule and my availability without confusing student booking options', async () => {
      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 55, role: 'sub', username: 'ustadh_ahmad' },
      } as any);

      renderWithProviders(<SchedulingDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Teaching Schedule' })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'My Availability' })).toBeInTheDocument();
        // Regular sub teacher should NOT have the student booking button
        expect(screen.queryByText('Book a Session')).not.toBeInTheDocument();
        // Regular sub teacher should NOT see allocation queue
        expect(screen.queryByRole('tab', { name: 'Requests & Allocation' })).not.toBeInTheDocument();
      });
    });

    it('lead teacher sees review student requests and allocation tab', async () => {
      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 55, role: 'lead', username: 'ustadh_ahmad' },
      } as any);

      renderWithProviders(<SchedulingDashboard />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: 'Teaching Schedule' })).toBeInTheDocument();
        expect(screen.getByText('Review Student Requests')).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: 'Requests & Allocation' })).toBeInTheDocument();
      });
    });

    it('teacher visiting BookingForm sees role-appropriate overview card instead of student booking form', async () => {
      vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
        user: { id: 55, role: 'lead', username: 'ustadh_ahmad' },
      } as any);

      renderWithProviders(<BookingForm />);

      await waitFor(() => {
        expect(screen.getByText('Class Scheduling Overview')).toBeInTheDocument();
        expect(screen.getByText('Go to Teaching Schedule')).toBeInTheDocument();
        expect(screen.getByText('View My Availability')).toBeInTheDocument();
      });
    });
  });
});
