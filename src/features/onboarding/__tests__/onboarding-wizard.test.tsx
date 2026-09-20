'use client';

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingWizard } from '../components/onboarding-wizard';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { onboardingApi } from '../api/onboarding';
import { invitationsApi } from '@/features/invitations/api/invitations';
import { studentsApi } from '@/features/students/api/students';

const pushMock = vi.fn();

vi.mock('@/lib/academy/academy-provider', () => ({
  useAcademy: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: pushMock })),
}));

vi.mock('../api/onboarding', () => ({
  onboardingApi: { getTracks: vi.fn() },
}));

vi.mock('@/features/staff/api/staff', () => ({
  invitationsApi: { list: vi.fn() },
}));

vi.mock('@/features/students/api/students', () => ({
  studentsApi: { getStudents: vi.fn() },
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe('OnboardingWizard (Explicit Steps)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    vi.mocked(AcademyProvider.useAcademy).mockReturnValue({
      activeAcademy: { id: 1, name: 'Test Academy' },
      activeRole: 'owner',
    } as any);
  });

  const renderWizard = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <OnboardingWizard />
      </QueryClientProvider>
    );

  it('renders all explicit onboarding steps with their backend facts and endpoints', async () => {
    vi.mocked(onboardingApi.getTracks).mockResolvedValue([]);
    vi.mocked(invitationsApi.list).mockResolvedValue([]);
    vi.mocked(studentsApi.getStudents).mockResolvedValue([]);

    renderWizard();

    await waitFor(() => {
      expect(screen.getAllByText('Academy Details').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Curriculum').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Teachers').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Students').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Class Configuration').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Notifications').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Ready').length).toBeGreaterThan(0);
    });
  });

  it('displays truthful uncontracted messaging for Class Configuration, Notifications, and Ready', async () => {
    vi.mocked(onboardingApi.getTracks).mockResolvedValue([]);
    vi.mocked(invitationsApi.list).mockResolvedValue([]);
    vi.mocked(studentsApi.getStudents).mockResolvedValue([]);

    renderWizard();

    await waitFor(() => {
      expect(screen.getAllByText('Not yet configured').length).toBe(3);
    });

    // Click into Class Configuration step
    fireEvent.click(screen.getByRole('button', { name: /Class Configuration/i }));

    await waitFor(() => {
      expect(screen.getByText('OPEN / NOT YET CONTRACTED')).toBeInTheDocument();
      expect(
        screen.getAllByText('Not available in the current academy setup').length
      ).toBeGreaterThan(0);
    });
  });

  it('navigates to curriculum setup when clicking Add First Track', async () => {
    vi.mocked(onboardingApi.getTracks).mockResolvedValue([]);
    vi.mocked(invitationsApi.list).mockResolvedValue([]);
    vi.mocked(studentsApi.getStudents).mockResolvedValue([]);

    renderWizard();

    await waitFor(() => {
      expect(screen.getByText('Add First Track')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add First Track'));
    expect(pushMock).toHaveBeenCalledWith('/app/onboarding/curriculum');
  });

  it('navigates to teachers invite route when Teachers is selected', async () => {
    vi.mocked(onboardingApi.getTracks).mockResolvedValue([]);
    vi.mocked(invitationsApi.list).mockResolvedValue([]);
    vi.mocked(studentsApi.getStudents).mockResolvedValue([]);

    renderWizard();

    await waitFor(() => {
      expect(screen.getAllByText('Teachers').length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole('button', { name: /Teachers/i }));

    await waitFor(() => {
      expect(screen.getByText('Invite Teachers')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Invite Teachers'));
    expect(pushMock).toHaveBeenCalledWith('/app/teachers/add');
  });

  it('navigates to student add route when Students is selected', async () => {
    vi.mocked(onboardingApi.getTracks).mockResolvedValue([]);
    vi.mocked(invitationsApi.list).mockResolvedValue([]);
    vi.mocked(studentsApi.getStudents).mockResolvedValue([]);

    renderWizard();

    await waitFor(() => {
      expect(screen.getAllByText('Students').length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole('button', { name: /Students/i }));

    await waitFor(() => {
      expect(screen.getByText('Add Students')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Students'));
    expect(pushMock).toHaveBeenCalledWith('/app/students/add');
  });

  it('gates actions when user role does not have management capability', async () => {
    vi.mocked(AcademyProvider.useAcademy).mockReturnValue({
      activeAcademy: { id: 1, name: 'Test Academy' },
      activeRole: 'teacher',
    } as any);

    vi.mocked(onboardingApi.getTracks).mockResolvedValue([]);
    vi.mocked(invitationsApi.list).mockResolvedValue([]);
    vi.mocked(studentsApi.getStudents).mockResolvedValue([]);

    renderWizard();

    await waitFor(() => {
      expect(screen.getByText('Owner or admin permissions required.')).toBeInTheDocument();
    });
  });

  it('does not falsely declare academy ready based on counts', async () => {
    // Populate counts that used to trigger fake readiness
    vi.mocked(onboardingApi.getTracks).mockResolvedValue([{ id: 1 } as any]);
    vi.mocked(invitationsApi.list).mockResolvedValue([{ id: 1 }, { id: 2 }] as any[]);
    vi.mocked(studentsApi.getStudents).mockResolvedValue([{ id: 1 }] as any[]);

    renderWizard();

    await waitFor(() => {
      expect(screen.getAllByText('Ready').length).toBeGreaterThan(0);
    });

    // Click into Ready step
    fireEvent.click(screen.getByRole('button', { name: /Ready/i }));

    await waitFor(() => {
      // Ready step should still truthfully be uncontracted
      expect(screen.getByText('OPEN / NOT YET CONTRACTED')).toBeInTheDocument();
      expect(
        screen.getAllByText('Not available in the current academy setup').length
      ).toBeGreaterThan(0);
      // Should NOT have false "Academy Ready" operational assertion
      expect(screen.queryByText('The academy is now operational!')).not.toBeInTheDocument();
    });
  });

  it('handles query errors safely', async () => {
    vi.mocked(onboardingApi.getTracks).mockRejectedValue(new Error('Network failure'));
    renderWizard();

    await waitFor(() => {
      expect(screen.getByText('Failed to load onboarding status')).toBeInTheDocument();
    });
  });
});
