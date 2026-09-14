/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StaffInviteForm } from '../components/staff-invite-form';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import { useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    addMember: vi.fn(),
  },
}));

vi.mock('../api/staff', () => ({
  staffApi: mockApi,
}));

describe('StaffInviteForm', () => {
  let queryClient: QueryClient;
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    vi.mocked(useRouter).mockReturnValue({ push: pushMock } as any);
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <StaffInviteForm />
      </QueryClientProvider>
    );

  it('renders missing context error if no active academy', () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: null,
    } as any);

    renderComponent();
    expect(screen.getByText('Missing academy context.')).toBeInTheDocument();
  });

  it('submits form successfully and redirects', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1 },
    } as any);

    mockApi.addMember.mockResolvedValue({});

    renderComponent();

    const userInput = screen.getByLabelText(/User ID/i);
    fireEvent.change(userInput, { target: { value: '123' } });

    const roleSelect = screen.getByLabelText(/Role/i);
    fireEvent.change(roleSelect, { target: { value: 'admin' } });

    const submitBtn = screen.getByRole('button', { name: /Add Member/i });
    act(() => {
      fireEvent.submit(submitBtn.closest('form')!);
    });

    await waitFor(() => {
      expect(mockApi.addMember).toHaveBeenCalledWith(1, { user: 123, role: 'admin' });
    });

    expect(pushMock).toHaveBeenCalledWith('/app/staff');
  });

  it('shows error on failure', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1 },
    } as any);

    mockApi.addMember.mockRejectedValue(new Error('User already in academy'));

    renderComponent();

    fireEvent.change(screen.getByLabelText(/User ID/i), { target: { value: '123' } });

    act(() => {
      fireEvent.submit(screen.getByRole('button').closest('form')!);
    });

    expect(await screen.findByText('User already in academy')).toBeInTheDocument();
  });
});
