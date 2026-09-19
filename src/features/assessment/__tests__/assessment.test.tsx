import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssessmentDashboard } from '../components/assessment-dashboard';
import { assessmentApi } from '../api/assessment';
import { useAcademy } from '@/lib/academy/academy-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/errors';

vi.mock('@/lib/academy/academy-provider', () => ({
  useAcademy: vi.fn(),
}));

vi.mock('@/lib/auth/auth-provider', () => ({
  useAuth: vi.fn(() => ({ user: { id: 1, role: 'student' } })),
}));

vi.mock('../api/assessment', () => ({
  assessmentApi: {
    getMyAssessments: vi.fn(),
    getTeacherAssessments: vi.fn(),
    getReviewQueue: vi.fn(),
    reviewAssessment: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Assessment Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAcademy).mockReturnValue({
      activeAcademy: { id: 1, name: 'Test Academy' },
      activeRole: 'student',
    } as any);
  });

  it('renders empty assessments state', async () => {
    vi.mocked(assessmentApi.getMyAssessments).mockResolvedValue([]);
    
    renderWithProviders(<AssessmentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No assessments')).toBeInTheDocument();
    });
  });

  it('renders assessment history', async () => {
    vi.mocked(assessmentApi.getMyAssessments).mockResolvedValue([
      {
        id: 301,
        overall_score: '9.50',
        teacher_summary: 'Excellent work today',
        lead_reviewed: true
      } as any
    ]);
    
    renderWithProviders(<AssessmentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Assessment #301')).toBeInTheDocument();
      expect(screen.getByText(/Excellent work today/i)).toBeInTheDocument();
      expect(screen.getByText('Reviewed')).toBeInTheDocument();
    });
  });

  it('handles 403 Forbidden state', async () => {
    vi.mocked(assessmentApi.getMyAssessments).mockRejectedValue(new ApiError(403, 'Forbidden'));
    
    renderWithProviders(<AssessmentDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText("You don't have permission to view these assessments.")).toBeInTheDocument();
    });
  });
});
