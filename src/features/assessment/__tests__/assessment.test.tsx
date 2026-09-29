import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssessmentList } from '../components/assessment-list';
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
    getStudentAssessments: vi.fn(),
    getTeacherAssessments: vi.fn(),
    getChildAssessments: vi.fn(),
    getReviewQueue: vi.fn(),
    reviewAssessment: vi.fn(),
    getAssignments: vi.fn(),
    getWardProgress: vi.fn(),
    getSubmissions: vi.fn(),
  },
  resolveAssessmentMediaUrl: vi.fn((url) => url),
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
      academyId: 1,
      activeAcademy: { id: 1, name: 'Test Academy' },
      activeRole: 'student',
    } as any);
    vi.mocked(assessmentApi.getAssignments).mockResolvedValue([]);
    vi.mocked(assessmentApi.getWardProgress).mockResolvedValue({
      student: { id: 1, name: 'Student 1', email: 's@test.com' },
      stats: { total_assigned: 0, submitted_count: 0, graded_count: 0, average_score: null },
      items: [],
    });
  });

  it('renders empty assessments state in AssessmentList', async () => {
    vi.mocked(assessmentApi.getStudentAssessments).mockResolvedValue([]);
    vi.mocked(assessmentApi.getMyAssessments).mockResolvedValue([]);
    
    renderWithProviders(<AssessmentList type="family" />);
    
    await waitFor(() => {
      expect(screen.getByText('No assessments')).toBeInTheDocument();
    });
  });

  it('renders assessment history in AssessmentList', async () => {
    const mockData = [
      {
        id: 301,
        overall_score: '9.50',
        teacher_summary: 'Excellent work today',
        lead_reviewed: true
      } as any
    ];
    vi.mocked(assessmentApi.getStudentAssessments).mockResolvedValue(mockData);
    vi.mocked(assessmentApi.getMyAssessments).mockResolvedValue(mockData);
    
    renderWithProviders(<AssessmentList type="family" />);
    
    await waitFor(() => {
      expect(screen.getByText('Assessment #301')).toBeInTheDocument();
      expect(screen.getByText(/Excellent work today/i)).toBeInTheDocument();
      expect(screen.getByText('Reviewed')).toBeInTheDocument();
    });
  });

  it('handles 403 Forbidden state in AssessmentList', async () => {
    vi.mocked(assessmentApi.getStudentAssessments).mockRejectedValue(new ApiError(403, 'Forbidden'));
    vi.mocked(assessmentApi.getMyAssessments).mockRejectedValue(new ApiError(403, 'Forbidden'));
    
    renderWithProviders(<AssessmentList type="family" />);
    
    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText("You don't have permission to view these assessments.")).toBeInTheDocument();
    });
  });
});
