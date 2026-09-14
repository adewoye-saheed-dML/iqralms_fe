import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayoutsDashboard } from '../components/payouts-dashboard';
import { payoutsApi } from '../api/payouts';
import { useAcademy } from '@/lib/academy/academy-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/errors';

vi.mock('@/lib/academy/academy-provider', () => ({
  useAcademy: vi.fn(),
}));

vi.mock('../api/payouts', () => ({
  payoutsApi: {
    getLeadPayouts: vi.fn(),
    getMyStatement: vi.fn(),
    generatePayouts: vi.fn(),
    finalizePayout: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Payouts Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Teacher Role', () => {
    beforeEach(() => {
      vi.mocked(useAcademy).mockReturnValue({
        activeAcademy: { id: 1, name: 'Test Academy' },
        activeRole: 'teacher',
      } as any);
    });

    it('renders empty statement state when searching', async () => {
      vi.mocked(payoutsApi.getMyStatement).mockResolvedValue({ status: 'empty' } as any);
      
      renderWithProviders(<PayoutsDashboard />);
      
      // Initially form is present
      const startInput = screen.getByLabelText('Period Start');
      const endInput = screen.getByLabelText('Period End');
      const submitBtn = screen.getByText('View Statement');

      fireEvent.change(startInput, { target: { value: '2023-01-01T00:00' } });
      fireEvent.change(endInput, { target: { value: '2023-01-31T23:59' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('No payouts found')).toBeInTheDocument();
      });
    });

    it('renders statement data', async () => {
      vi.mocked(payoutsApi.getMyStatement).mockResolvedValue({
        status: 'generated',
        session_count: 5,
        finalized_count: 0,
        total_amount: '25000.00',
        currency: 'NGN',
        payouts: [
          {
            id: 1,
            booking: { id: 101, student: 'johndoe', start_time_utc: '2023-01-02T10:00:00Z' },
            rate_used: '5000.00',
            amount: '5000.00',
            currency: 'NGN',
            status: 'generated',
            status_display: 'Generated'
          }
        ]
      } as any);
      
      renderWithProviders(<PayoutsDashboard />);
      
      const startInput = screen.getByLabelText('Period Start');
      const endInput = screen.getByLabelText('Period End');
      const submitBtn = screen.getByText('View Statement');

      fireEvent.change(startInput, { target: { value: '2023-01-01T00:00' } });
      fireEvent.change(endInput, { target: { value: '2023-01-31T23:59' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Statement Summary')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('25000.00 NGN')).toBeInTheDocument();
        expect(screen.getByText('Booking #101')).toBeInTheDocument();
        expect(screen.getByText('johndoe')).toBeInTheDocument();
      });
    });
  });

  describe('Lead Role', () => {
    beforeEach(() => {
      vi.mocked(useAcademy).mockReturnValue({
        activeAcademy: { id: 1, name: 'Test Academy' },
        activeRole: 'lead',
      } as any);
    });

    it('allows generating payouts', async () => {
      vi.mocked(payoutsApi.getLeadPayouts).mockResolvedValue([]);
      vi.mocked(payoutsApi.generatePayouts).mockResolvedValue({
        created_count: 2,
        skipped_count: 1,
        total_amount: '10000.00',
        skipped: [{ booking_id: 10, teacher_id: 2, reason: 'no_payout_rate' }]
      } as any);
      
      renderWithProviders(<PayoutsDashboard />);
      
      const genBtn = await screen.findByText('Generate Payouts');
      fireEvent.click(genBtn);

      const startInput = screen.getByLabelText('Period Start');
      const endInput = screen.getByLabelText('Period End');
      const submitBtn = screen.getByText('Run Generation');

      fireEvent.change(startInput, { target: { value: '2023-01-01T00:00' } });
      fireEvent.change(endInput, { target: { value: '2023-01-31T23:59' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Generation Complete')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('10000.00')).toBeInTheDocument();
        expect(screen.getByText(/no_payout_rate/)).toBeInTheDocument();
      });
    });
  });
});
