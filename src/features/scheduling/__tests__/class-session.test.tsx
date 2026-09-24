import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClassSession } from '../components/class-session';
import { schedulingApi } from '../api/scheduling';
import { assessmentApi } from '@/features/assessment/api/assessment';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import * as AuthProvider from '@/lib/auth/auth-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/errors';

vi.mock('../api/scheduling', () => ({
  schedulingApi: {
    getMeeting: vi.fn(),
  },
}));

vi.mock('@/features/assessment/api/assessment', () => ({
  assessmentApi: {
    submitAssessment: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('ClassSession', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1, name: 'Test Academy' },
      activeRole: 'teacher',
    } as any);
    vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
      user: { id: 2, role: 'sub' },
    } as any);
  });

  it('renders authorized meeting information', async () => {
    vi.mocked(schedulingApi.getMeeting).mockResolvedValue({
      provider: 'jitsi',
      provider_meeting_id: 'iqra-room-101',
      join_url: 'https://meet.jit.si/iqra-room-101',
      display_name: 'Quran Track - Level 1 Session',
    });

    renderWithProviders(<ClassSession bookingId={101} />);

    await waitFor(() => {
      expect(screen.getByText('Quran Track - Level 1 Session')).toBeInTheDocument();
      expect(screen.getByText(/jitsi/i)).toBeInTheDocument();
      expect(screen.getByText('Join Video Here')).toBeInTheDocument();
      expect(screen.getByText('Open in New Window')).toBeInTheDocument();
    });
  });

  it('handles cancelled booking error', async () => {
    vi.mocked(schedulingApi.getMeeting).mockRejectedValue(
      new ApiError(400, 'This class has been cancelled.')
    );

    renderWithProviders(<ClassSession bookingId={101} />);

    await waitFor(() => {
      expect(screen.getByText('Session Cancelled')).toBeInTheDocument();
      expect(
        screen.getByText(
          'This booking has been cancelled and its meeting room is no longer accessible.'
        )
      ).toBeInTheDocument();
    });
  });

  it('handles 403 access denied error', async () => {
    vi.mocked(schedulingApi.getMeeting).mockRejectedValue(
      new ApiError(403, 'You do not have access to this class.')
    );

    renderWithProviders(<ClassSession bookingId={101} />);

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(
        screen.getByText('You are not authorized to join or view this session.')
      ).toBeInTheDocument();
    });
  });

  it('allows teacher to submit assessment from class session workspace', async () => {
    vi.mocked(schedulingApi.getMeeting).mockResolvedValue({
      provider: 'jitsi',
      provider_meeting_id: 'iqra-room-101',
      join_url: 'https://meet.jit.si/iqra-room-101',
      display_name: 'Level 1 Session',
    });
    vi.mocked(assessmentApi.submitAssessment).mockResolvedValue({
      id: 55,
      overall_score: '9.00',
      teacher_summary: 'Great progress in Surah Al-Baqarah',
    } as any);

    renderWithProviders(<ClassSession bookingId={101} />);

    await waitFor(() => {
      expect(screen.getByText('Class Assessment & Notes')).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByPlaceholderText(
        "Summary of today's lesson, student recitation, and milestones achieved..."
      ),
      { target: { value: 'Great progress in Surah Al-Baqarah' } }
    );

    fireEvent.click(screen.getByText('Submit Session Assessment'));

    await waitFor(() => {
      expect(assessmentApi.submitAssessment).toHaveBeenCalledWith(
        1,
        101,
        expect.objectContaining({
          scores: expect.arrayContaining([
            expect.objectContaining({ score: 8.5 }),
          ]),
          teacher_summary: 'Great progress in Surah Al-Baqarah',
          flagged_for_review: false,
        })
      );
      expect(screen.getByText('Assessment Submitted')).toBeInTheDocument();
    });
  });

  it('allows student to join session and toggle in-app Jitsi video frame', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1, name: 'Test Academy' },
      activeRole: 'student',
    } as any);
    vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
      user: { id: 50, role: 'student' },
    } as any);

    vi.mocked(schedulingApi.getMeeting).mockResolvedValue({
      provider: 'jitsi',
      provider_meeting_id: 'iqra-room-student-50',
      join_url: 'https://meet.jit.si/iqra-room-student-50',
      display_name: 'Student Recitation Class',
    });

    renderWithProviders(<ClassSession bookingId={202} />);

    await waitFor(() => {
      expect(screen.getByText('Student Recitation Class')).toBeInTheDocument();
      // Student cannot see teacher assessment creation form
      expect(screen.queryByText('Class Assessment & Notes')).not.toBeInTheDocument();
    });

    // Toggle embed
    fireEvent.click(screen.getByText('Join Video Here'));
    expect(screen.getByTitle('Class Video Session')).toHaveAttribute(
      'src',
      'https://meet.jit.si/iqra-room-student-50'
    );
  });

  it('allows parent to view and join linked child class meeting', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1, name: 'Test Academy' },
      activeRole: 'parent',
    } as any);
    vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
      user: { id: 60, role: 'parent' },
    } as any);

    vi.mocked(schedulingApi.getMeeting).mockResolvedValue({
      provider: 'jitsi',
      provider_meeting_id: 'child-booking-room',
      join_url: 'https://meet.jit.si/child-booking-room',
      display_name: "Child's Arabic Session",
    });

    renderWithProviders(<ClassSession bookingId={303} />);

    await waitFor(() => {
      expect(screen.getByText("Child's Arabic Session")).toBeInTheDocument();
      expect(screen.getByText('Open in New Window')).toBeInTheDocument();
    });
  });
});
