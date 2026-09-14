/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StaffDirectory } from '../components/staff-directory';
import * as AcademyProvider from '@/lib/academy/academy-provider';

const { mockApi } = vi.hoisted(() => ({
  mockApi: {
    getMemberships: vi.fn(),
  },
}));

vi.mock('../api/staff', () => ({
  staffApi: mockApi,
}));

describe('StaffDirectory', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <StaffDirectory />
      </QueryClientProvider>
    );

  it('renders missing context error if no active academy', () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: null,
    } as any);

    renderComponent();
    expect(screen.getByText('No Academy Context')).toBeInTheDocument();
  });

  it('loads and displays memberships', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1, name: 'Academy A' },
      activeRole: 'owner',
    } as any);

    mockApi.getMemberships.mockResolvedValue([
      {
        id: 10,
        username: 'Ahmed',
        role: 'owner',
        role_display: 'Owner',
        status: 'active',
        status_display: 'Active',
        created_at: '2026-01-01',
      },
      {
        id: 11,
        username: 'Bilal',
        role: 'teacher',
        role_display: 'Teacher',
        status: 'active',
        status_display: 'Active',
        created_at: '2026-01-02',
      },
    ]);

    renderComponent();

    expect(mockApi.getMemberships).toHaveBeenCalledWith(1);

    await waitFor(() => {
      expect(screen.getByText('Ahmed')).toBeInTheDocument();
      expect(screen.getByText('Bilal')).toBeInTheDocument();
    });

    expect(screen.getByText('Add Member')).toBeInTheDocument();
  });

  it('filters by search term', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1 },
      activeRole: 'owner',
    } as any);

    mockApi.getMemberships.mockResolvedValue([
      {
        id: 10,
        username: 'Ahmed',
        role: 'owner',
        role_display: 'Owner',
        status: 'active',
        status_display: 'Active',
        created_at: '2026-01-01',
      },
      {
        id: 11,
        username: 'Bilal',
        role: 'teacher',
        role_display: 'Teacher',
        status: 'active',
        status_display: 'Active',
        created_at: '2026-01-02',
      },
    ]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Ahmed')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by username/i);
    fireEvent.change(searchInput, { target: { value: 'bil' } });

    expect(screen.queryByText('Ahmed')).not.toBeInTheDocument();
    expect(screen.getByText('Bilal')).toBeInTheDocument();
  });

  it('hides Add Member button for non-admins', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1 },
      activeRole: 'teacher',
    } as any);

    mockApi.getMemberships.mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByRole('link', { name: /Add Member/i })).not.toBeInTheDocument();
    });
  });
});
