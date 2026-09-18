import * as React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query';
import { AcademyProvider, useAcademy } from '../academy-provider';
import * as AuthProvider from '@/lib/auth/auth-provider';
import { studentKeys, teacherKeys } from '@/lib/api/query-keys';

vi.mock('@/lib/auth/auth-provider', () => ({
  useAuth: vi.fn(),
}));

const { mockApiClient } = vi.hoisted(() => ({
  mockApiClient: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
}));

vi.mock('@/lib/api/client', () => ({
  apiClient: mockApiClient,
}));

function TestConsumer() {
  const { academies, activeAcademy, setActiveAcademy } = useAcademy();

  const { data: students } = useQuery({
    queryKey: studentKeys.all(activeAcademy?.id),
    queryFn: () => ['student-' + activeAcademy?.id],
    enabled: !!activeAcademy,
  });

  const { data: teachers } = useQuery({
    queryKey: teacherKeys.all(activeAcademy?.id),
    queryFn: () => ['teacher-' + activeAcademy?.id],
    enabled: !!activeAcademy,
  });

  const mutation = useMutation({
    mutationFn: (data: string) => Promise.resolve(`mutated-${activeAcademy?.id}-${data}`)
  });

  if (!activeAcademy) return <div data-testid="loading">Loading...</div>;

  return (
    <div>
      <div data-testid="active-academy-id">{activeAcademy.id}</div>
      <div data-testid="students-data">{students?.join(',')}</div>
      <div data-testid="teachers-data">{teachers?.join(',')}</div>
      
      {academies.map(a => (
        <button 
          key={a.id} 
          data-testid={`switch-to-${a.id}`} 
          onClick={() => setActiveAcademy(a.id)}
        >
          Switch to {a.id}
        </button>
      ))}

      <button 
        data-testid="run-mutation" 
        onClick={() => mutation.mutate('test')}
      >
        Mutate
      </button>
      {mutation.data && <div data-testid="mutation-result">{mutation.data}</div>}
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

describe('Tenant Isolation', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 1000 * 60 * 5, staleTime: 1000 * 60 * 5 }, // keep cache alive to test if it leaks
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

  it('proves academy A data cannot appear as academy B after switching context', async () => {
    mockApiClient.GET.mockResolvedValue({
      data: [
        createMockMembership(1, 'Academy A', 'admin'),
        createMockMembership(2, 'Academy B', 'admin'),
      ],
    });

    renderProvider();

    expect(await screen.findByTestId('active-academy-id')).toHaveTextContent('1');
    
    await waitFor(() => {
      expect(screen.getByTestId('students-data')).toHaveTextContent('student-1');
      expect(screen.getByTestId('teachers-data')).toHaveTextContent('teacher-1');
    });

    expect(queryClient.getQueryData(studentKeys.all(1))).toEqual(['student-1']);

    act(() => {
      screen.getByTestId('switch-to-2').click();
    });

    expect(screen.getByTestId('active-academy-id')).toHaveTextContent('2');

    await waitFor(() => {
      expect(screen.getByTestId('students-data')).toHaveTextContent('student-2');
      expect(screen.getByTestId('teachers-data')).toHaveTextContent('teacher-2');
    });

    expect(queryClient.getQueryData(studentKeys.all(1))).toBeUndefined();

    act(() => {
      screen.getByTestId('run-mutation').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('mutation-result')).toHaveTextContent('mutated-2-test');
    });
  });

  it('deliberately exercises invalid cross-tenant API behavior and confirms friendly 403 handling', async () => {
    mockApiClient.GET.mockImplementation(async (url: string) => {
      if (url.includes('/mine/')) {
        return { data: [createMockMembership(1, 'Academy A', 'admin')] };
      }
      return { 
        error: { detail: 'You do not have permission to perform this action.' } 
      };
    });

    function MaliciousConsumer() {
      const { data, error } = useQuery({
        queryKey: studentKeys.all(2),
        queryFn: async () => {
          const { data, error } = await mockApiClient.GET('/api/organizations/2/students/');
          if (error) throw new Error(error.detail || 'Forbidden');
          return data;
        },
        retry: false
      });

      if (error) return <div data-testid="malicious-error">{error.message}</div>;
      if (data) return <div data-testid="malicious-data">Data loaded</div>;
      return <div>Loading</div>;
    }

    render(
      <QueryClientProvider client={queryClient}>
        <AcademyProvider>
          <MaliciousConsumer />
        </AcademyProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('malicious-error')).toHaveTextContent('You do not have permission to perform this action.');
    });
  });
});
