/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StaffDetail } from '../components/staff-detail';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import { useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    getMembership: vi.fn(),
    updateMember: vi.fn(),
  },
}));

vi.mock('../api/staff', () => ({
  staffApi: mockApi,
}));

describe('StaffDetail', () => {
  let queryClient: QueryClient;
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    vi.mocked(useRouter).mockReturnValue({ push: pushMock } as any);
    // mock confirm
    global.confirm = vi.fn().mockReturnValue(true);
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <StaffDetail memberId={10} />
      </QueryClientProvider>
    );

  it('renders details correctly', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1 },
      activeRole: 'owner',
    } as any);

    mockApi.getMembership.mockResolvedValue({
      id: 10,
      user: 100,
      username: 'Ahmed',
      role: 'teacher',
      role_display: 'Teacher',
      status: 'active',
      status_display: 'Active',
      created_at: '2026-01-01',
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Ahmed').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('changes role', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1 },
      activeRole: 'owner',
    } as any);

    mockApi.getMembership.mockResolvedValue({
      id: 10,
      user: 101,
      role: 'teacher',
      role_display: 'Teacher',
      status: 'active',
      status_display: 'Active',
      username: 'Ahmed',
      created_at: '2026-01-01',
    });
    mockApi.updateMember.mockResolvedValue({});

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Ahmed').length).toBeGreaterThan(0);
    });

    const makeAdminBtn = screen.getByRole('button', { name: /Make Admin/i });
    fireEvent.click(makeAdminBtn);

    expect(global.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockApi.updateMember).toHaveBeenCalledWith(1, 10, { role: 'admin' });
    });
  });

  it('changes status', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1 },
      activeRole: 'owner',
    } as any);

    mockApi.getMembership.mockResolvedValue({
      id: 10,
      user: 101,
      role: 'teacher',
      role_display: 'Teacher',
      status: 'active',
      status_display: 'Active',
      username: 'Ahmed',
      created_at: '2026-01-01',
    });
    mockApi.updateMember.mockResolvedValue({});

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Ahmed').length).toBeGreaterThan(0);
    });

    const suspendBtn = screen.getByRole('button', { name: /Suspend Member/i });
    fireEvent.click(suspendBtn);

    expect(global.confirm).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockApi.updateMember).toHaveBeenCalledWith(1, 10, { status: 'suspended' });
    });
  });

  it('hides management buttons for non-admins', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1 },
      activeRole: 'teacher',
    } as any);

    mockApi.getMembership.mockResolvedValue({
      id: 10,
      user: 101,
      role: 'staff',
      role_display: 'Staff',
      status: 'active',
      status_display: 'Active',
      username: 'Ahmed',
      created_at: '2026-01-01',
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getAllByText('Ahmed').length).toBeGreaterThan(0);
    });

    expect(screen.queryByRole('button', { name: /Make Admin/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Suspend Member/i })).not.toBeInTheDocument();
  });
});
