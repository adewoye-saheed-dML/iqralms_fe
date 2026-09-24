import { studentKeys } from '@/lib/api/query-keys';
import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider, Query } from '@tanstack/react-query';
import { AcademyProvider, useAcademy } from '../academy-provider';
import * as AuthProvider from '@/lib/auth/auth-provider';
import type { components } from '@/lib/api/schema';

type OrgRole = components['schemas']['OrganizationRoleEnum'];

// Mock dependencies
vi.mock('@/lib/auth/auth-provider', () => ({
  useAuth: vi.fn(),
}));

const { mockApiClient } = vi.hoisted(() => ({
  mockApiClient: {
    GET: vi.fn(),
    POST: vi.fn(),
    PATCH: vi.fn(),
    DELETE: vi.fn(),
  },
}));

vi.mock('@/lib/api/client', () => ({
  apiClient: mockApiClient,
}));

// Test helper component
function TestConsumer() {
  const { academies, activeAcademy, activeRole, isLoading, error, setActiveAcademy } = useAcademy();

  if (isLoading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">{error.message}</div>;

  return (
    <div>
      <div data-testid="academy-count">{academies.length}</div>
      <div data-testid="active-academy">{activeAcademy?.name || 'none'}</div>
      <div data-testid="active-role">{activeRole || 'none'}</div>
      <button onClick={() => activeAcademy && setActiveAcademy(activeAcademy.id === 1 ? 2 : 1)}>
        Switch Academy
      </button>
    </div>
  );
}

const createMockMembership = (orgId: number, orgName: string, role: OrgRole) => ({
  id: orgId + 100,
  organization: { id: orgId, name: orgName, slug: orgName.toLowerCase(), timezone: 'UTC' },
  role,
  role_display: role,
  status: 'active' as const,
  status_display: 'Active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  user: 1,
  username: 'testuser',
});

describe('AcademyProvider', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });
    vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
      user: { id: 1, username: 'testuser', email: 'test@example.com', role: 'lead', timezone: 'UTC' },
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshAuth: vi.fn(),
    });
  });

  const renderProvider = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <AcademyProvider>
          <TestConsumer />
        </AcademyProvider>
      </QueryClientProvider>
    );

  it('handles loading state', () => {
    mockApiClient.GET.mockImplementation(() => new Promise(() => {})); // Never resolves
    renderProvider();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    mockApiClient.GET.mockRejectedValue(new Error('API Error'));
    renderProvider();
    expect(await screen.findByTestId('error')).toHaveTextContent('API Error');
  });

  it('handles empty academies (no-academy users)', async () => {
    mockApiClient.GET.mockResolvedValue({ data: [] });
    renderProvider();
    expect(await screen.findByTestId('academy-count')).toHaveTextContent('0');
    expect(screen.getByTestId('active-academy')).toHaveTextContent('none');
    expect(screen.getByTestId('active-role')).toHaveTextContent('none');
  });

  it('auto-selects single academy', async () => {
    mockApiClient.GET.mockResolvedValue({ data: [createMockMembership(1, 'Academy A', 'admin')] });
    renderProvider();
    expect(await screen.findByTestId('active-academy')).toHaveTextContent('Academy A');
    expect(screen.getByTestId('active-role')).toHaveTextContent('admin');
  });

  it('handles same user with different academy roles and restores valid persisted selection', async () => {
    localStorage.setItem('quran_fe_selected_academy_id', '2');
    mockApiClient.GET.mockResolvedValue({ data: [
      createMockMembership(1, 'Academy A', 'staff'),
      createMockMembership(2, 'Academy B', 'teacher'),
    ] });
    renderProvider();
    expect(await screen.findByTestId('active-academy')).toHaveTextContent('Academy B');
    expect(screen.getByTestId('active-role')).toHaveTextContent('teacher');
  });

  it('requires explicit selection when multiple academies exist and persisted selection is invalid', async () => {
    localStorage.setItem('quran_fe_selected_academy_id', '99'); // Invalid ID
    mockApiClient.GET.mockResolvedValue({ data: [
      createMockMembership(1, 'Academy A', 'admin'),
      createMockMembership(2, 'Academy B', 'teacher'),
    ] });
    renderProvider();
    expect(await screen.findByTestId('active-academy')).toHaveTextContent('none');
    expect(screen.getByTestId('active-role')).toHaveTextContent('none');
  });

  it('allows switching academies and correctly applies role changes', async () => {
    localStorage.setItem('quran_fe_selected_academy_id', '1');
    const removeSpy = vi.spyOn(queryClient, 'removeQueries');

    mockApiClient.GET.mockResolvedValue({ data: [
      createMockMembership(1, 'Academy A', 'admin'),
      createMockMembership(2, 'Academy B', 'teacher'),
    ] });

    renderProvider();
    expect(await screen.findByTestId('active-academy')).toHaveTextContent('Academy A');
    expect(screen.getByTestId('active-role')).toHaveTextContent('admin');

    // Switch academy using the button (calls setActiveAcademy)
    const switchBtn = screen.getByText('Switch Academy');
    await act(async () => {
      switchBtn.click();
    });

    expect(await screen.findByTestId('active-academy')).toHaveTextContent('Academy B');
    expect(screen.getByTestId('active-role')).toHaveTextContent('teacher');
    expect(localStorage.getItem('quran_fe_selected_academy_id')).toBe('2');

    // Verify tenant-scoped query invalidation / removal
    expect(removeSpy).toHaveBeenCalled();
    const predicate = removeSpy.mock.calls[0][0]?.predicate;
    expect(predicate).toBeDefined();

    // Test the predicate logic directly
    const shouldRemoveAcademy1 = predicate!({
      queryKey: studentKeys.all(1),
    } as Query);
    const shouldRemoveAcademy2 = predicate!({
      queryKey: studentKeys.all(2),
    } as Query);
    const shouldRemoveGlobal = predicate!({
      queryKey: ['global'],
    } as Query);

    expect(shouldRemoveAcademy1).toBe(true); // Should reset Academy 1 data since we switched to 2
    expect(shouldRemoveAcademy2).toBe(false); // Should not reset Academy 2 data since it's the new active
    expect(shouldRemoveGlobal).toBe(false); // Should not reset non-tenant data
  });
  
  it('correctly maps valid organization membership roles', async () => {
    mockApiClient.GET.mockResolvedValue({ data: [
      createMockMembership(1, 'Academy A', 'teacher'),
    ] });
    renderProvider();
    expect(await screen.findByTestId('active-academy')).toHaveTextContent('Academy A');
    expect(screen.getByTestId('active-role')).toHaveTextContent('teacher');
  });
});
