'use client';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OnboardingWizard } from '../components/onboarding-wizard';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { onboardingApi } from '../api/onboarding';
import { staffApi } from '@/features/staff/api/staff';
import { studentsApi } from '@/features/students/api/students';
import { can } from '@/lib/permissions/capabilities';

vi.mock('@/lib/academy/academy-provider', () => ({
  useAcademy: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('../api/onboarding', () => ({
  onboardingApi: { getTracks: vi.fn() },
}));

vi.mock('@/features/staff/api/staff', () => ({
  staffApi: { getMemberships: vi.fn() },
}));

vi.mock('@/features/students/api/students', () => ({
  studentsApi: { getStudents: vi.fn() },
}));

vi.mock('@/lib/permissions/capabilities', () => ({
  can: vi.fn(() => true),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe('OnboardingWizard', () => {
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

  it('shows curriculum setup for new academy', async () => {
    vi.mocked(onboardingApi.getTracks).mockResolvedValue([]);
    vi.mocked(staffApi.getMemberships).mockResolvedValue([{ id: 1 } as any]); // Just the owner
    vi.mocked(studentsApi.getStudents).mockResolvedValue([]);

    renderWizard();

    await waitFor(() => {
      expect(screen.getAllByText('Curriculum').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Add First Track').length).toBeGreaterThan(0);
    });
  });

  it('progresses to teachers setup when curriculum is done', async () => {
    vi.mocked(onboardingApi.getTracks).mockResolvedValue([{ id: 1 } as any]);
    vi.mocked(staffApi.getMemberships).mockResolvedValue([{ id: 1 } as any]); // Just owner
    vi.mocked(studentsApi.getStudents).mockResolvedValue([]);

    renderWizard();

    await waitFor(() => {
      expect(screen.getAllByText('Teachers & Staff').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Invite Staff').length).toBeGreaterThan(0);
    });
  });

  it('progresses to students setup when staff is done', async () => {
    vi.mocked(onboardingApi.getTracks).mockResolvedValue([{ id: 1 } as any]);
    vi.mocked(staffApi.getMemberships).mockResolvedValue([{ id: 1 }, { id: 2 }] as any[]); // Owner + 1 staff
    vi.mocked(studentsApi.getStudents).mockResolvedValue([]);

    renderWizard();

    await waitFor(() => {
      expect(screen.getAllByText('Students').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Add Students').length).toBeGreaterThan(0);
    });
  });

  it('shows ready state when all are configured', async () => {
    vi.mocked(onboardingApi.getTracks).mockResolvedValue([{ id: 1 } as any]);
    vi.mocked(staffApi.getMemberships).mockResolvedValue([{ id: 1 }, { id: 2 }] as any[]);
    vi.mocked(studentsApi.getStudents).mockResolvedValue([{ id: 1 }] as any[]);

    renderWizard();

    await waitFor(() => {
      expect(screen.getAllByText('Academy Ready').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Continue to Dashboard').length).toBeGreaterThan(0);
    });
  });

  it('handles failed mutation/query safely', async () => {
    vi.mocked(onboardingApi.getTracks).mockRejectedValue(new Error('Failed'));
    renderWizard();

    await waitFor(() => {
      expect(screen.getAllByText('Failed to load onboarding status').length).toBeGreaterThan(0);
    });
  });
});
