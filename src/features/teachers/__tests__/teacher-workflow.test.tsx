'use client';

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeacherDirectory } from '../components/teacher-directory';
import { TeacherDetail } from '../components/teacher-detail';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import * as Capabilities from '@/lib/permissions/capabilities';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { teachersApi } from '../api/teachers';

vi.mock('@/lib/academy/academy-provider', () => ({
  useAcademy: vi.fn(),
}));
vi.mock('@/lib/permissions/capabilities', () => ({
  can: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));
vi.mock('../api/teachers', () => ({
  teachersApi: { getTeacherConfigurations: vi.fn(), updateTeacherConfiguration: vi.fn() },
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe('Teacher Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    // Default mock setup: owner
    vi.mocked(AcademyProvider.useAcademy).mockReturnValue({
      activeAcademy: { id: 1, name: 'Test Academy' },
      activeRole: 'owner',
    } as any);
    vi.mocked(Capabilities.can).mockImplementation((cap) => {
      if (cap === 'manage_staff') return true;
      if (cap === 'manage_finance') return true;
      return false;
    });
  });

  const renderDir = () => render(<QueryClientProvider client={queryClient}><TeacherDirectory /></QueryClientProvider>);
  const renderDet = (id: number) => render(<QueryClientProvider client={queryClient}><TeacherDetail membershipId={id} /></QueryClientProvider>);

  it('owner/admin teacher management is allowed', async () => {
    vi.mocked(teachersApi.getTeacherConfigurations).mockResolvedValue([
      { id: 10, membership: 1, user: 100, approved: true, username: 'teacher1', max_weekly_hours: 10, hourly_payout_rate: '15.00' } as any
    ]);
    renderDir();
    await waitFor(() => {
      expect(screen.getByText('Invite Teacher')).toBeInTheDocument();
      expect(screen.getByText('teacher1')).toBeInTheDocument();
    });
  });

  it('invitation pending/accepted behavior & activation', async () => {
    vi.mocked(teachersApi.getTeacherConfigurations).mockResolvedValue([
      { id: 10, membership: 1, user: 100, approved: false, username: 'teacher1', max_weekly_hours: 10, hourly_payout_rate: '15.00' } as any
    ]);
    renderDet(1);
    await waitFor(() => {
      expect(screen.getByText('Pending Activation')).toBeInTheDocument();
      expect(screen.getByText('Approve Teacher')).toBeInTheDocument();
    });

    vi.mocked(teachersApi.updateTeacherConfiguration).mockResolvedValue({} as any);
    
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    act(() => {
      screen.getByText('Approve Teacher').click();
    });
    
    await waitFor(() => {
      expect(teachersApi.updateTeacherConfiguration).toHaveBeenCalledWith(1, 10, { approved: true });
    });
  });

  it('teacher academy context', async () => {
    vi.mocked(teachersApi.getTeacherConfigurations).mockResolvedValue([
      { id: 10, membership: 1, user: 100, approved: true, username: 'teacher1', max_weekly_hours: 10, hourly_payout_rate: '15.00', organization: 2 } as any
    ]);
    renderDet(1);
    // Even if organization is 2, it fetches configs for activeAcademy.id.
    // The queryKey includes academyId ensuring isolation.
    await waitFor(() => {
      expect(teachersApi.getTeacherConfigurations).toHaveBeenCalledWith(1);
    });
  });

  it('forbidden management actions for ordinary staff', async () => {
    vi.mocked(AcademyProvider.useAcademy).mockReturnValue({
      activeAcademy: { id: 1, name: 'Test Academy' },
      activeRole: 'staff',
    } as any);
    vi.mocked(Capabilities.can).mockReturnValue(false); // Staff cannot manage_staff or manage_finance
    
    vi.mocked(teachersApi.getTeacherConfigurations).mockResolvedValue([
      { id: 10, membership: 1, user: 100, approved: false, username: 'teacher1', max_weekly_hours: 10, hourly_payout_rate: '15.00' } as any
    ]);
    
    renderDet(1);
    
    await waitFor(() => {
      // Ensure Approve Teacher is NOT visible
      expect(screen.queryByText('Approve Teacher')).not.toBeInTheDocument();
      // Ensure Financials is NOT visible
      expect(screen.queryByText('Financials')).not.toBeInTheDocument();
    });
  });
});
