import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProgressDashboard } from '../components/progress-dashboard';
import { progressApi } from '../api/progress';
import { useAcademy } from '@/lib/academy/academy-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/academy/academy-provider', () => ({
  useAcademy: vi.fn(),
}));

vi.mock('../api/progress', () => ({
  progressApi: {
    getMyProgress: vi.fn(),
    getAllSnapshots: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Progress Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAcademy).mockReturnValue({
      activeAcademy: { id: 1, name: 'Test Academy' },
      activeRole: 'student',
    } as any);
  });

  it('renders empty progress state', async () => {
    vi.mocked(progressApi.getMyProgress).mockResolvedValue([]);
    
    renderWithProviders(<ProgressDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No progress records')).toBeInTheDocument();
    });
  });

  it('renders progress data', async () => {
    vi.mocked(progressApi.getMyProgress).mockResolvedValue([
      {
        id: 1,
        track: { name: 'Hifz' },
        completed_sessions: 15,
        assessed_sessions: 10,
        overall_average: '9.2'
      } as any
    ]);
    
    renderWithProviders(<ProgressDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Track: Hifz')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('9.2')).toBeInTheDocument();
    });
  });
});
