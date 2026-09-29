'use client';

import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SessionRecordingsView } from '../components/session-recordings-view';
import { SchedulingDashboard } from '../components/scheduling-dashboard';
import { schedulingApi, type SessionRecording } from '../api/scheduling';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import * as AuthProvider from '@/lib/auth/auth-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/errors';

vi.mock('../api/scheduling', () => ({
  schedulingApi: {
    getAcademyRecordings: vi.fn(),
    deleteSessionRecording: vi.fn(),
    getAcademyBookings: vi.fn(),
    getMyBookings: vi.fn(),
    getTeachingBookings: vi.fn(),
    getAvailability: vi.fn(),
    getMyWaitlist: vi.fn(),
    getTeacherWaitlist: vi.fn(),
    getAcademyWaitlist: vi.fn(),
    getCohorts: vi.fn(),
  },
}));

vi.mock('@/features/curriculum/api/curriculum', () => ({
  curriculumApi: {
    getTracks: vi.fn().mockResolvedValue([]),
    getLevels: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/features/teachers/api/teachers', () => ({
  teachersApi: {
    getTeacherConfigurations: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn((param: string) => null),
  })),
}));

const mockRecordings: SessionRecording[] = [
  {
    id: 1,
    booking_id: 101,
    organization: 1,
    student: {
      id: 10,
      username: 'zayd_student',
      email: 'zayd@example.com',
      first_name: 'Zayd',
      last_name: 'Ali',
      role: 'student',
    },
    teacher: {
      id: 20,
      username: 'ustadh_ahmad',
      email: 'ahmad@example.com',
      first_name: 'Ahmad',
      last_name: 'Khan',
      role: 'teacher',
    },
    track_title: 'Tajweed Mastery',
    level_name: 'Level 1: Foundations',
    title: 'Level 1 Tajweed Foundation Session',
    video_room_name: 'academy-room-101',
    recording_url: 'https://meet.jit.si/academy-room-101',
    duration_minutes: 45,
    recorded_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 58 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ready',
    is_expired: false,
    days_until_expiry: 58,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    booking_id: 102,
    organization: 1,
    student: {
      id: 11,
      username: 'fatima_student',
      email: 'fatima@example.com',
      first_name: 'Fatima',
      last_name: 'Noor',
      role: 'student',
    },
    teacher: {
      id: 21,
      username: 'ustadh_bilal',
      email: 'bilal@example.com',
      first_name: 'Bilal',
      last_name: 'Hassan',
      role: 'teacher',
    },
    track_title: 'Hifz Program',
    level_name: 'Juz 30 Memorization',
    title: 'Juz 30 Review with Fatima',
    video_room_name: 'academy-room-102',
    recording_url: 'https://meet.jit.si/academy-room-102',
    duration_minutes: 30,
    recorded_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'ready',
    is_expired: false,
    days_until_expiry: 5,
    created_at: new Date().toISOString(),
  },
];

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Session Recordings & 60-Day Retention View', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1, name: 'Darul Quran Academy', slug: 'darul-quran' } as any,
      activeRole: 'owner',
      memberships: [],
      isLoading: false,
      error: null,
      switchAcademy: vi.fn(),
    });
    vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
      user: { id: 1, username: 'owner_user', role: 'owner' } as any,
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
    });
  });

  it('renders the 60-day auto-retention policy banner and summary statistics', async () => {
    vi.mocked(schedulingApi.getAcademyRecordings).mockResolvedValue(mockRecordings);

    renderWithProviders(<SessionRecordingsView />);

    await waitFor(() => {
      expect(
        screen.getByText('Academy 60-Day Auto-Retention & Dispute Policy')
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/automatically permanently purged after/i)).toBeInTheDocument();
    expect(screen.getByText('60 days')).toBeInTheDocument();
    expect(screen.getByText('Total Recordings Saved')).toBeInTheDocument();
    expect(screen.getAllByText('2')).toHaveLength(2); // total count and active count
    expect(screen.getByText('Active Retained Sessions')).toBeInTheDocument();
  });

  it('renders recording items with expiry countdown badges and student/teacher metadata', async () => {
    vi.mocked(schedulingApi.getAcademyRecordings).mockResolvedValue(mockRecordings);

    renderWithProviders(<SessionRecordingsView />);

    await waitFor(() => {
      expect(screen.getByText('Level 1 Tajweed Foundation Session')).toBeInTheDocument();
    });

    expect(screen.getByText('Juz 30 Review with Fatima')).toBeInTheDocument();
    expect(screen.getByText('58d left')).toBeInTheDocument();
    expect(screen.getByText('5d left')).toBeInTheDocument(); // expiring soon badge
    expect(screen.getByText('Zayd Ali')).toBeInTheDocument();
    expect(screen.getByText('Ahmad Khan')).toBeInTheDocument();
  });

  it('filters recordings by search term (student, teacher, title, track)', async () => {
    vi.mocked(schedulingApi.getAcademyRecordings).mockResolvedValue(mockRecordings);

    renderWithProviders(<SessionRecordingsView />);

    await waitFor(() => {
      expect(screen.getByText('Level 1 Tajweed Foundation Session')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by student, teacher, track/i);
    fireEvent.change(searchInput, { target: { value: 'Fatima' } });

    expect(screen.queryByText('Level 1 Tajweed Foundation Session')).not.toBeInTheDocument();
    expect(screen.getByText('Juz 30 Review with Fatima')).toBeInTheDocument();
  });

  it('opens session review modal when Review Session button is clicked', async () => {
    vi.mocked(schedulingApi.getAcademyRecordings).mockResolvedValue(mockRecordings);

    renderWithProviders(<SessionRecordingsView />);

    await waitFor(() => {
      expect(screen.getByText('Level 1 Tajweed Foundation Session')).toBeInTheDocument();
    });

    const reviewButtons = screen.getAllByRole('button', { name: /review session/i });
    fireEvent.click(reviewButtons[0]);

    await waitFor(() => {
      expect(
        screen.getByText('Session Video Stream & Meeting Reference')
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/Room: academy-room-101/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /open recording url/i })).toBeInTheDocument();
  });

  it('handles manual purge deletion flow with confirmation dialog', async () => {
    vi.mocked(schedulingApi.getAcademyRecordings).mockResolvedValue(mockRecordings);
    vi.mocked(schedulingApi.deleteSessionRecording).mockResolvedValue(undefined);

    renderWithProviders(<SessionRecordingsView />);

    await waitFor(() => {
      expect(screen.getByText('Level 1 Tajweed Foundation Session')).toBeInTheDocument();
    });

    const purgeButtons = screen.getAllByTitle('Purge recording now');
    fireEvent.click(purgeButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Purge Recording Permanently?')).toBeInTheDocument();
    });

    const confirmPurgeBtn = screen.getByRole('button', { name: 'Purge Recording' });
    fireEvent.click(confirmPurgeBtn);

    await waitFor(() => {
      expect(schedulingApi.deleteSessionRecording).toHaveBeenCalledWith(1, 1);
    });
  });

  it('displays access restriction when 403 Forbidden is returned (non-owner/non-admin)', async () => {
    vi.mocked(schedulingApi.getAcademyRecordings).mockRejectedValue(
      new ApiError(403, 'Access forbidden')
    );

    renderWithProviders(<SessionRecordingsView />);

    await waitFor(() => {
      expect(screen.getByText('Access Restricted')).toBeInTheDocument();
    });
    expect(
      screen.getByText(/Session recordings and audit logs are strictly reserved for academy owners and administrators/i)
    ).toBeInTheDocument();
  });

  it('shows Class Recordings & Audit tab on SchedulingDashboard for owners', async () => {
    vi.mocked(schedulingApi.getAcademyBookings).mockResolvedValue([]);
    vi.mocked(schedulingApi.getAcademyRecordings).mockResolvedValue([]);

    renderWithProviders(<SchedulingDashboard />);

    expect(screen.getByRole('tab', { name: /Class Recordings & Audit/i })).toBeInTheDocument();
  });
});
