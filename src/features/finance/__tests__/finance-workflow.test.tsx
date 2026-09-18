import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FinanceDashboard } from '../components/finance-dashboard';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import * as AuthProvider from '@/lib/auth/auth-provider';
import { payoutsApi } from '@/features/payouts/api/payouts';
import { ApiError } from '@/lib/api/errors';
import { act } from 'react';

vi.mock('@/lib/academy/academy-provider', () => ({
  useAcademy: vi.fn(),
}));
vi.mock('@/lib/auth/auth-provider', () => ({
  useAuth: vi.fn(),
}));
vi.mock('@/features/payouts/api/payouts', () => ({
  payoutsApi: {
    getLeadPayouts: vi.fn(),
    finalizePayout: vi.fn(),
  },
}));
vi.mock('@/features/pricing/components/pricing-dashboard', () => ({
  PricingDashboard: () => <div data-testid="pricing-dashboard">Pricing</div>,
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Finance Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('owner/admin can view and manage academy payouts and pricing', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1, name: 'Test Academy' },
      activeRole: 'admin',
    } as any);

    vi.mocked(payoutsApi.getLeadPayouts).mockResolvedValue([
      { id: 1, status: 'generated', status_display: 'Generated', amount: '100.00', currency: 'USD', teacher: { first_name: 'John', last_name: 'Doe' } } as any,
    ]);

    renderWithProviders(<FinanceDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Payout Management')).toBeInTheDocument();
      expect(screen.getByText('Pricing Agreements')).toBeInTheDocument();
      expect(screen.getByText('Payout #1')).toBeInTheDocument();
    });

    // Check unsupported actions are absent
    expect(screen.queryByText('Transfer to Bank')).not.toBeInTheDocument();
    expect(screen.queryByText('Pay Now')).not.toBeInTheDocument();
  });

  it('forbidden academy-wide finance action for teachers', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1, name: 'Test Academy' },
      activeRole: 'teacher',
    } as any);

    renderWithProviders(<FinanceDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('You do not have permission to view academy finance management.')).toBeInTheDocument();
    });
  });

  it('forbidden academy-wide finance action for staff', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1, name: 'Test Academy' },
      activeRole: 'staff',
    } as any);

    renderWithProviders(<FinanceDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('You do not have permission to view academy finance management.')).toBeInTheDocument();
    });
  });
});
