'use client';

import * as React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateAcademyForm } from '../components/create-academy-form';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import { useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    createAcademy: vi.fn(),
  },
}));

vi.mock('../api/onboarding', () => ({
  onboardingApi: mockApi,
}));

describe('CreateAcademyForm', () => {
  let queryClient: QueryClient;
  const pushMock = vi.fn();
  const refreshAcademiesMock = vi.fn();
  const setActiveAcademyMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    vi.mocked(useRouter).mockReturnValue({ push: pushMock } as any);
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      refreshAcademies: refreshAcademiesMock,
      setActiveAcademy: setActiveAcademyMock,
    } as any);
  });

  const renderForm = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <CreateAcademyForm />
      </QueryClientProvider>
    );

  it('successfully creates academy, refreshes context, and redirects', async () => {
    mockApi.createAcademy.mockResolvedValue({ id: 5, name: 'My Academy' });

    renderForm();

    const nameInput = screen.getByLabelText(/Academy Name/i);
    fireEvent.change(nameInput, { target: { value: 'My Academy' } });

    const submitBtn = screen.getByRole('button', { name: /Create Academy/i });

    act(() => {
      fireEvent.submit(submitBtn.closest('form')!);
    });

    await waitFor(() => {
      expect(mockApi.createAcademy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My Academy',
          slug: 'my-academy',
          timezone: expect.any(String),
        })
      );
    });

    expect(refreshAcademiesMock).toHaveBeenCalled();
    expect(setActiveAcademyMock).toHaveBeenCalledWith(5);
    expect(pushMock).toHaveBeenCalledWith('/app/onboarding');
  });

  it('handles backend validation errors', async () => {
    mockApi.createAcademy.mockRejectedValue(new Error('Slug taken'));

    renderForm();

    fireEvent.change(screen.getByLabelText(/Academy Name/i), { target: { value: 'My Academy' } });
    const submitBtn = screen.getByRole('button', { name: /Create Academy/i });

    act(() => {
      fireEvent.submit(submitBtn.closest('form')!);
    });

    expect(await screen.findByText('Slug taken')).toBeInTheDocument();
    expect(refreshAcademiesMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
