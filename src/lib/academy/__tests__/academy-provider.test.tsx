import { studentKeys } from '@/lib/api/query-keys';
import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AcademyProvider, useAcademy } from '../academy-provider';
import * as AuthProvider from '@/lib/auth/auth-provider';

// Mock dependencies
vi.mock('@/lib/auth/auth-provider', () => ({
  useAuth: vi.fn(),
}));

const { mockApiClient } = vi.hoisted(() => ({
  mockApiClient: {
    get: vi.fn(),
  },
}));

vi.mock('@/lib/api/client', () => ({
  apiClient: mockApiClient,
  legacyApiClient: mockApiClient,
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

const createMockMembership = (orgId: number, orgName: string, role: string) => ({
  id: orgId + 100,
  organization: { id: orgId, name: orgName, slug: orgName.toLowerCase() },
  role,
  role_display: role,
  status: 'active',
  status_display: 'Active',
  created_at: new Date().toISOString(),
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
    // @ts-expect-error Mock implementation
    vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({ user: { id: 1, username: 'testuser' } });
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

  it('rejects invalid persisted selection and falls back to first academy', async () => {
    localStorage.setItem('quran_fe_selected_academy_id', '99'); // Invalid
    mockApiClient.GET.mockResolvedValue({ data: [
      createMockMembership(1, 'Academy A', 'admin'),
      createMockMembership(2, 'Academy B', 'teacher'),
    ] });
    renderProvider();
    expect(await screen.findByTestId('active-academy')).toHaveTextContent('Academy A');
    expect(screen.getByTestId('active-role')).toHaveTextContent('admin');
  });

  it('allows switching academies and correctly applies role changes', async () => {
    const removeSpy = vi.spyOn(queryClient, 'removeQueries');

    mockApiClient.GET.mockResolvedValue({ data: [
      createMockMembership(1, 'Academy A', 'admin'),
      createMockMembership(2, 'Academy B', 'teacher'),
    ] });
    renderProvider();

    // Auto selects A
    expect(await screen.findByTestId('active-academy')).toHaveTextContent('Academy A');
    expect(screen.getByTestId('active-role')).toHaveTextContent('admin');

    // Switch to B
    act(() => {
      screen.getByText('Switch Academy').click();
    });

    expect(screen.getByTestId('active-academy')).toHaveTextContent('Academy B');
    expect(screen.getByTestId('active-role')).toHaveTextContent('teacher');
    expect(localStorage.getItem('quran_fe_selected_academy_id')).toBe('2');

    // Verify cache invalidation/reset
    expect(removeSpy).toHaveBeenCalled();
    const predicate = removeSpy.mock.calls[0][0]?.predicate;
    expect(predicate).toBeDefined();

    // Test the predicate logic directly
    const shouldRemoveAcademy1 = predicate({
      queryKey: studentKeys.all(1),
    } as unknown as import('@tanstack/react-query').Query);
    const shouldRemoveAcademy2 = predicate({
      queryKey: studentKeys.all(2),
    } as unknown as import('@tanstack/react-query').Query);
    const shouldRemoveGlobal = predicate({
      queryKey: ['global'],
    } as unknown as import('@tanstack/react-query').Query);

    expect(shouldRemoveAcademy1).toBe(true); // Should reset Academy 1 data since we switched to 2
    expect(shouldRemoveAcademy2).toBe(false); // Should not reset Academy 2 data since it's the new active
    expect(shouldRemoveGlobal).toBe(false); // Should not reset non-tenant data
  });
  
  it('ignores invalid mixed-role configuration if a global role leaks into memberships', async () => {
    // If the backend were to accidentally send a global role like 'student' in a membership,
    // the provider shouldn't crash, but typically TS prevents this in codebase.
    // For testing, we mock an invalid payload.
    mockApiClient.GET.mockResolvedValue({ data: [
      createMockMembership(1, 'Academy A', 'lead' as any),
    ] });
    renderProvider();
    expect(await screen.findByTestId('active-academy')).toHaveTextContent('Academy A');
    expect(screen.getByTestId('active-role')).toHaveTextContent('lead');
    // Note: The UI layer will filter out capabilities because 'lead' is not an OrgRole!
  });
});
