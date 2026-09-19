'use client';

import * as React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StaffInviteForm } from '../components/staff-invite-form';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import { useRouter } from 'next/navigation';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    inviteStaff: vi.fn(),
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
    vi.mocked(useRouter).mockReturnValue({ push: pushMock } as unknown as AppRouterInstance);
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
      activeRole: null,
      academies: [],
      isLoading: false,
      error: null,
      setActiveAcademy: vi.fn(),
      refreshAcademies: vi.fn(),
    });

    renderComponent();
    expect(screen.getByText('Missing academy context.')).toBeInTheDocument();
  });

  it('renders permission denied for non-manager (e.g. teacher or staff)', () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1, name: 'Academy', slug: 'academy', timezone: 'UTC' },
      activeRole: 'teacher',
      academies: [],
      isLoading: false,
      error: null,
      setActiveAcademy: vi.fn(),
      refreshAcademies: vi.fn(),
    });

    renderComponent();
    expect(screen.getByText('Permission Denied')).toBeInTheDocument();
    expect(
      screen.getByText(/Only academy owners and administrators can invite new teachers or staff members/i)
    ).toBeInTheDocument();
  });

  it('shows validation error for invalid email', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1, name: 'Academy', slug: 'academy', timezone: 'UTC' },
      activeRole: 'admin',
      academies: [],
      isLoading: false,
      error: null,
      setActiveAcademy: vi.fn(),
      refreshAcademies: vi.fn(),
    });

    renderComponent();

    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });

    const submitBtn = screen.getByRole('button', { name: /Send Invitation/i });
    await act(async () => {
      fireEvent.submit(submitBtn.closest('form')!);
    });

    expect(await screen.findByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(mockApi.inviteStaff).not.toHaveBeenCalled();
  });

  it('submits valid teacher invitation and redirects', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1, name: 'Academy', slug: 'academy', timezone: 'UTC' },
      activeRole: 'admin',
      academies: [],
      isLoading: false,
      error: null,
      setActiveAcademy: vi.fn(),
      refreshAcademies: vi.fn(),
    });

    mockApi.inviteStaff.mockResolvedValue({
      id: 10,
      email: 'newteacher@example.com',
      role: 'teacher',
      status: 'pending',
    });

    renderComponent();

    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'newteacher@example.com' } });

    const roleSelect = screen.getByLabelText(/Role/i);
    fireEvent.change(roleSelect, { target: { value: 'teacher' } });

    const submitBtn = screen.getByRole('button', { name: /Send Invitation/i });
    await act(async () => {
      fireEvent.submit(submitBtn.closest('form')!);
    });

    await waitFor(() => {
      expect(mockApi.inviteStaff).toHaveBeenCalledWith(1, {
        email: 'newteacher@example.com',
        role: 'teacher',
      });
    });

    expect(pushMock).toHaveBeenCalledWith('/app/teachers');
  });

  it('shows error on failure', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1, name: 'Academy', slug: 'academy', timezone: 'UTC' },
      activeRole: 'owner',
      academies: [],
      isLoading: false,
      error: null,
      setActiveAcademy: vi.fn(),
      refreshAcademies: vi.fn(),
    });

    mockApi.inviteStaff.mockRejectedValue(new Error('User with this email is already invited'));

    renderComponent();

    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'teacher@example.com' },
    });

    const submitBtn = screen.getByRole('button', { name: /Send Invitation/i });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(await screen.findByText('User with this email is already invited')).toBeInTheDocument();
  });
});
