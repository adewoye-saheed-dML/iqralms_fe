'use client';

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeacherDetail } from '../components/teacher-detail';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { teachersApi } from '../api/teachers';

vi.mock('@/lib/academy/academy-provider', () => ({
  useAcademy: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

vi.mock('../api/teachers', () => ({
  teachersApi: { getTeacherConfigurations: vi.fn(), updateTeacherConfiguration: vi.fn() },
}));

vi.mock('@/lib/permissions/capabilities', () => ({
  can: vi.fn(() => true),
}));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

describe('TeacherDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    vi.mocked(AcademyProvider.useAcademy).mockReturnValue({
      activeAcademy: { id: 1, name: 'Test Academy' },
      activeRole: 'owner',
    } as any);
  });

  const renderDetail = (membershipId: number) =>
    render(
      <QueryClientProvider client={queryClient}>
        <TeacherDetail membershipId={membershipId} />
      </QueryClientProvider>
    );

  it('renders teacher status accurately based on approved boolean', async () => {
    vi.mocked(teachersApi.getTeacherConfigurations).mockResolvedValue([
      { id: 10, membership: 1, approved: false, username: 'testuser', max_weekly_hours: 10, hourly_payout_rate: '15.00' } as any
    ]);

    renderDetail(1);

    await waitFor(() => {
      expect(screen.getByText('testuser (Teacher)')).toBeInTheDocument();
      expect(screen.getByText('Pending Activation')).toBeInTheDocument();
    });
  });
});
