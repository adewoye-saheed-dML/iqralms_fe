import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PricingDashboard } from '../components/pricing-dashboard';
import { pricingApi } from '../api/pricing';
import { useAcademy } from '@/lib/academy/academy-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/errors';

vi.mock('@/lib/academy/academy-provider', () => ({
  useAcademy: vi.fn(),
}));

vi.mock('@/lib/auth/auth-provider', () => ({
  useAuth: vi.fn(() => ({ user: { id: 1, role: 'student' } })),
}));

vi.mock('../api/pricing', () => ({
  pricingApi: {
    getAgreements: vi.fn(),
    getMyAgreements: vi.fn(),
    createAgreement: vi.fn(),
  },
}));

vi.mock('@/features/students/api/students', () => ({
  studentsApi: {
    getStudents: vi.fn(() => Promise.resolve([{ id: 1, first_name: 'John', last_name: 'Doe' }])),
  },
}));

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Pricing Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Student Role', () => {
    beforeEach(() => {
      vi.mocked(useAcademy).mockReturnValue({
        activeAcademy: { id: 1, name: 'Test Academy' },
        activeRole: 'student',
      } as any);
    });

    it('renders empty pricing state', async () => {
      vi.mocked(pricingApi.getMyAgreements).mockResolvedValue([]);
      
      renderWithProviders(<PricingDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('No agreements')).toBeInTheDocument();
      });
    });

    it('renders my agreements', async () => {
      vi.mocked(pricingApi.getMyAgreements).mockResolvedValue([
        {
          id: 1,
          level: { name: 'Level 1' },
          standard_rate: '5000.00',
          agreed_rate: '4500.00',
          active: true
        } as any
      ]);
      
      renderWithProviders(<PricingDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Level Level 1')).toBeInTheDocument();
        expect(screen.getByText('5000.00')).toBeInTheDocument();
        expect(screen.getByText('4500.00')).toBeInTheDocument();
      });
    });
  });

  describe('Admin Role', () => {
    beforeEach(() => {
      vi.mocked(useAcademy).mockReturnValue({
        activeAcademy: { id: 1, name: 'Test Academy' },
        activeRole: 'admin',
      } as any);
    });

    it('renders all agreements', async () => {
      vi.mocked(pricingApi.getAgreements).mockResolvedValue([
        {
          id: 1,
          student: { first_name: 'John', last_name: 'Doe' },
          level: { name: 'Level 1' },
          track: 'Hifz',
          standard_rate: '5000.00',
          agreed_rate: '4500.00',
          reason_display: 'Scholarship',
          approved_by: 'admin1',
          active: true
        } as any
      ]);
      
      renderWithProviders(<PricingDashboard />);
      
      await waitFor(() => {
        expect(screen.getAllByText('John Doe').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Scholarship')).toBeInTheDocument();
        expect(screen.getByText('admin1')).toBeInTheDocument();
      });
    });

    it('allows creating an agreement', async () => {
      vi.mocked(pricingApi.getAgreements).mockResolvedValue([]);
      vi.mocked(pricingApi.createAgreement).mockResolvedValue({ id: 2 } as any);
      
      renderWithProviders(<PricingDashboard />);
      
      const newBtn = await screen.findByText('New Agreement');
      fireEvent.click(newBtn);

      const studentInput = screen.getByLabelText('Student ID');
      const levelInput = screen.getByLabelText('Level ID');
      const standardRateInput = screen.getByLabelText('Standard Rate');
      const agreedRateInput = screen.getByLabelText('Agreed Rate');

      fireEvent.change(studentInput, { target: { value: '1' } });
      fireEvent.change(levelInput, { target: { value: '2' } });
      fireEvent.change(standardRateInput, { target: { value: '5000.00' } });
      fireEvent.change(agreedRateInput, { target: { value: '5000.00' } });

      const submitBtn = screen.getByText('Create Agreement');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(pricingApi.createAgreement).toHaveBeenCalledWith(1, expect.objectContaining({
          student: 1,
          level: 2,
          standard_rate: '5000.00',
          agreed_rate: '5000.00',
          reason: 'discount_hardship'
        }));
      });
    });
  });
});
