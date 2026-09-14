/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnboardingWizard } from '../components/onboarding-wizard';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import { onboardingApi } from '../api/onboarding';
import { useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    getTracks: vi.fn(),
  },
}));

vi.mock('../api/onboarding', () => ({
  onboardingApi: mockApi,
}));

describe('OnboardingWizard', () => {
  let queryClient: QueryClient;
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    vi.mocked(useRouter).mockReturnValue({ push: pushMock } as any);
  });

  const renderWizard = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <OnboardingWizard />
      </QueryClientProvider>
    );

  it('renders nothing when there is no active academy', () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: null,
    } as any);

    const { container } = renderWizard();
    expect(container).toBeEmptyDOMElement();
  });

  it('shows curriculum as pending if no tracks exist', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1, name: 'Academy A' },
      activeRole: 'owner',
    } as any);

    mockApi.getTracks.mockResolvedValue([]);

    renderWizard();

    expect(await screen.findByText(/1 \/ 2 foundation steps/)).toBeInTheDocument();
    expect(screen.getByText('Curriculum Setup')).toBeInTheDocument();

    const addTrackBtn = screen.getByRole('button', { name: /Add First Track/i });
    expect(addTrackBtn).toBeInTheDocument();

    act(() => {
      addTrackBtn.click();
    });
    expect(pushMock).toHaveBeenCalledWith('/app/onboarding/curriculum');
  });

  it('shows academy as ready when curriculum is setup', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1, name: 'Academy A' },
      activeRole: 'owner',
    } as any);

    mockApi.getTracks.mockResolvedValue([{ id: 1, name: 'Quran Reading' }]);

    renderWizard();

    expect(await screen.findByText(/Foundation complete/)).toBeInTheDocument();
    expect(screen.getByText('Academy Ready')).toBeInTheDocument();

    const continueBtn = screen.getByRole('button', { name: /Continue to Dashboard/i });
    expect(continueBtn).toBeInTheDocument();

    act(() => {
      continueBtn.click();
    });
    expect(pushMock).toHaveBeenCalledWith('/app/dashboard');
  });

  it('hides "Add First Track" for non-admin/owner roles', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1, name: 'Academy A' },
      activeRole: 'teacher',
    } as any);

    mockApi.getTracks.mockResolvedValue([]);

    renderWizard();

    expect(await screen.findByText(/1 \/ 2 foundation steps/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Add First Track/i })).not.toBeInTheDocument();
    expect(
      screen.getByText(/You need owner or admin permissions to set up the curriculum/)
    ).toBeInTheDocument();
  });

  it('loads tracks for the active academy only', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 2, name: 'Academy B' },
      activeRole: 'owner',
    } as any);

    mockApi.getTracks.mockResolvedValue([]);

    renderWizard();

    await screen.findByText(/1 \/ 2 foundation steps/);
    expect(mockApi.getTracks).toHaveBeenCalledWith(2);
  });
});
