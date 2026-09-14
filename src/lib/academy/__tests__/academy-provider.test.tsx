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
    mockApiClient.get.mockImplementation(() => new Promise(() => {})); // Never resolves
    renderProvider();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('handles error state', async () => {
    mockApiClient.get.mockRejectedValue(new Error('API Error'));
    renderProvider();
    expect(await screen.findByTestId('error')).toHaveTextContent('API Error');
  });

  it('handles empty academies (no-academy users)', async () => {
    mockApiClient.get.mockResolvedValue([]);
    renderProvider();
    expect(await screen.findByTestId('academy-count')).toHaveTextContent('0');
    expect(screen.getByTestId('active-academy')).toHaveTextContent('none');
    expect(screen.getByTestId('active-role')).toHaveTextContent('none');
  });

  it('auto-selects single academy', async () => {
    mockApiClient.get.mockResolvedValue([createMockMembership(1, 'Academy A', 'student')]);
    renderProvider();
    expect(await screen.findByTestId('active-academy')).toHaveTextContent('Academy A');
    expect(screen.getByTestId('active-role')).toHaveTextContent('student');
  });

  it('handles multiple academies and restores valid persisted selection', async () => {
    localStorage.setItem('quran_fe_selected_academy_id', '2');
    mockApiClient.get.mockResolvedValue([
      createMockMembership(1, 'Academy A', 'student'),
      createMockMembership(2, 'Academy B', 'teacher'),
    ]);
    renderProvider();
    expect(await screen.findByTestId('active-academy')).toHaveTextContent('Academy B');
    expect(screen.getByTestId('active-role')).toHaveTextContent('teacher');
  });

  it('rejects invalid persisted selection and falls back to first academy', async () => {
    localStorage.setItem('quran_fe_selected_academy_id', '99'); // Invalid
    mockApiClient.get.mockResolvedValue([
      createMockMembership(1, 'Academy A', 'student'),
      createMockMembership(2, 'Academy B', 'teacher'),
    ]);
    renderProvider();
    expect(await screen.findByTestId('active-academy')).toHaveTextContent('Academy A');
    expect(screen.getByTestId('active-role')).toHaveTextContent('student');
  });

  it('allows switching academies and resets query cache', async () => {
    const resetSpy = vi.spyOn(queryClient, 'resetQueries');

    mockApiClient.get.mockResolvedValue([
      createMockMembership(1, 'Academy A', 'student'),
      createMockMembership(2, 'Academy B', 'teacher'),
    ]);
    renderProvider();

    // Auto selects A
    expect(await screen.findByTestId('active-academy')).toHaveTextContent('Academy A');
    expect(screen.getByTestId('active-role')).toHaveTextContent('student');

    // Switch to B
    act(() => {
      screen.getByText('Switch Academy').click();
    });

    expect(screen.getByTestId('active-academy')).toHaveTextContent('Academy B');
    expect(screen.getByTestId('active-role')).toHaveTextContent('teacher');
    expect(localStorage.getItem('quran_fe_selected_academy_id')).toBe('2');

    // Verify cache invalidation/reset
    expect(resetSpy).toHaveBeenCalled();
    const predicate = resetSpy.mock.calls[0][0]?.predicate;
    expect(predicate).toBeDefined();

    // Test the predicate logic directly
    const shouldResetAcademy1 = predicate({
      queryKey: ['academy', 1, 'students'],
    } as unknown as import('@tanstack/react-query').Query);
    const shouldResetAcademy2 = predicate({
      queryKey: ['academy', 2, 'students'],
    } as unknown as import('@tanstack/react-query').Query);
    const shouldResetGlobal = predicate({
      queryKey: ['global'],
    } as unknown as import('@tanstack/react-query').Query);

    expect(shouldResetAcademy1).toBe(true); // Should reset Academy 1 data since we switched to 2
    expect(shouldResetAcademy2).toBe(false); // Should not reset Academy 2 data since it's the new active
    expect(shouldResetGlobal).toBe(false); // Should not reset non-tenant data
  });
});
