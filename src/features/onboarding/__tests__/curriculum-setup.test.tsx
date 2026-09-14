/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CurriculumSetupForm } from '../components/curriculum-setup';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import { useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    createTrack: vi.fn(),
  },
}));

vi.mock('../api/onboarding', () => ({
  onboardingApi: mockApi,
}));

describe('CurriculumSetupForm', () => {
  let queryClient: QueryClient;
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    vi.mocked(useRouter).mockReturnValue({ push: pushMock } as any);
  });

  const renderForm = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <CurriculumSetupForm />
      </QueryClientProvider>
    );

  it('renders missing context error if no active academy', () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: null,
    } as any);

    renderForm();
    expect(screen.getByText('Missing academy context.')).toBeInTheDocument();
  });

  it('successfully creates track and redirects', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1, name: 'Academy A' },
    } as any);

    mockApi.createTrack.mockResolvedValue({ id: 1, name: 'Tajweed', slug: 'tajweed' });

    renderForm();

    const nameInput = screen.getByLabelText(/Subject\/Track Name/i);
    fireEvent.change(nameInput, { target: { value: 'Tajweed' } });

    const submitBtn = screen.getByRole('button', { name: /Add Track/i });

    act(() => {
      fireEvent.submit(submitBtn.closest('form')!);
    });

    await waitFor(() => {
      expect(mockApi.createTrack).toHaveBeenCalledWith(1, { name: 'Tajweed', slug: 'tajweed' });
    });

    expect(pushMock).toHaveBeenCalledWith('/app/onboarding');
  });

  it('handles backend validation errors', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1, name: 'Academy A' },
    } as any);

    mockApi.createTrack.mockRejectedValue(new Error('Slug already in use'));

    renderForm();

    fireEvent.change(screen.getByLabelText(/Subject\/Track Name/i), {
      target: { value: 'Tajweed' },
    });
    const submitBtn = screen.getByRole('button', { name: /Add Track/i });

    act(() => {
      fireEvent.submit(submitBtn.closest('form')!);
    });

    expect(await screen.findByText('Slug already in use')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
