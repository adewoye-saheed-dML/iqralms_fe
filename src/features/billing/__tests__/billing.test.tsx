import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BillingPanel } from '../components/billing-panel';
import { SubscriptionStatusCard } from '../components/subscription-status-card';
import { BankDetailsForm } from '../components/bank-details-form';
import { OrganizationPaymentsList } from '../components/organization-payments-list';
import { billingApi, type PlatformSubscription, type OrganizationPayment } from '../api/billing';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth } from '@/lib/auth/auth-provider';

vi.mock('@/lib/academy/academy-provider', () => ({
  useAcademy: vi.fn(),
}));

vi.mock('@/lib/auth/auth-provider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../api/billing', () => ({
  billingApi: {
    getSubscriptionStatus: vi.fn(),
    subscribe: vi.fn(),
    setupSubaccount: vi.fn(),
    getOrganizationPayments: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Billing Feature (Phase 9a)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SubscriptionStatusCard', () => {
    it('renders active subscription plan correctly', () => {
      const mockSub: PlatformSubscription = {
        id: 1,
        organization_id: 10,
        organization_name: 'Noor Academy',
        organization_slug: 'noor-academy',
        paystack_plan_code: 'PLN_monthly_sub',
        status: 'active',
        current_period_end: '2026-11-01T00:00:00Z',
        created_at: '2026-09-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z',
      };

      renderWithProviders(
        <SubscriptionStatusCard organizationId={10} subscription={mockSub} />
      );

      expect(screen.getByText('Platform Subscription')).toBeInTheDocument();
      expect(screen.getByText('Active Plan')).toBeInTheDocument();
      expect(screen.getByText('PLN_monthly_sub')).toBeInTheDocument();
      expect(screen.queryByText(/Payment Past Due/i)).not.toBeInTheDocument();
    });

    it('displays prominent warning banner during past_due grace period', () => {
      const pastDueSub: PlatformSubscription = {
        id: 2,
        organization_id: 10,
        organization_name: 'Noor Academy',
        organization_slug: 'noor-academy',
        paystack_plan_code: 'PLN_monthly_sub',
        status: 'past_due',
        current_period_end: '2026-10-05T00:00:00Z',
        created_at: '2026-09-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z',
      };

      renderWithProviders(
        <SubscriptionStatusCard organizationId={10} subscription={pastDueSub} />
      );

      expect(screen.getByText('Past Due')).toBeInTheDocument();
      expect(
        screen.getByText(/Payment Past Due — Subscription Grace Period/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Re-subscribe Plan/i)).toBeInTheDocument();
    });

    it('displays disabled warning banner when status is disabled', () => {
      const disabledSub: PlatformSubscription = {
        id: 3,
        organization_id: 10,
        organization_name: 'Noor Academy',
        organization_slug: 'noor-academy',
        paystack_plan_code: 'PLN_monthly_sub',
        status: 'disabled',
        current_period_end: '2026-09-01T00:00:00Z',
        created_at: '2026-08-01T00:00:00Z',
        updated_at: '2026-09-05T00:00:00Z',
      };

      renderWithProviders(
        <SubscriptionStatusCard organizationId={10} subscription={disabledSub} />
      );

      expect(screen.getByText('Disabled')).toBeInTheDocument();
      expect(screen.getByText(/Subscription Disabled/i)).toBeInTheDocument();
    });
  });

  describe('BankDetailsForm', () => {
    it('completes two-step resolve and setup subaccount', async () => {
      vi.mocked(billingApi.setupSubaccount).mockResolvedValue({
        account_name: 'Noor Academy Ltd',
        subaccount_code: 'SUB_noor123',
        bank_code: '058',
        account_number: '0123456789',
      });

      renderWithProviders(
        <BankDetailsForm organizationId={10} initialBusinessName="Noor Academy" />
      );

      expect(screen.getByText('Tuition Settlement Bank Account')).toBeInTheDocument();

      const accountInput = screen.getByLabelText(/NUBAN Account Number/i);
      fireEvent.change(accountInput, { target: { value: '0123456789' } });

      const submitBtn = screen.getByRole('button', { name: /Verify & Setup Subaccount/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(billingApi.setupSubaccount).toHaveBeenCalledWith(
          10,
          '058',
          '0123456789',
          'Noor Academy'
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Bank Settlement Subaccount Active')).toBeInTheDocument();
        expect(screen.getByText('Noor Academy Ltd')).toBeInTheDocument();
        expect(screen.getByText('SUB_noor123')).toBeInTheDocument();
      });
    });
  });

  describe('OrganizationPaymentsList', () => {
    it('renders tuition payments ledger with student and amount', async () => {
      const mockPayments: OrganizationPayment[] = [
        {
          id: 101,
          student: 201,
          student_username: 'zayd',
          student_name: 'Zayd Ali',
          organization: 10,
          organization_name: 'Noor Academy',
          initiated_by: 301,
          initiated_by_username: 'parent_ali',
          pricing_agreement: 5,
          amount: '25000.00',
          currency: 'NGN',
          paystack_reference: 'pay_ref_101',
          status: 'paid',
          created_at: '2026-10-02T10:00:00Z',
          paid_at: '2026-10-02T10:05:00Z',
        },
      ];

      vi.mocked(billingApi.getOrganizationPayments).mockResolvedValue(mockPayments);

      renderWithProviders(<OrganizationPaymentsList organizationId={10} />);

      await waitFor(() => {
        expect(screen.getByText('Tuition Collection History')).toBeInTheDocument();
        expect(screen.getByText('Zayd Ali')).toBeInTheDocument();
        expect(screen.getByText('@parent_ali')).toBeInTheDocument();
        expect(screen.getByText('pay_ref_101')).toBeInTheDocument();
        expect(screen.getByText('Paid')).toBeInTheDocument();
      });
    });
  });

  describe('BillingPanel Access Control', () => {
    it('denies access to non-owner roles (e.g. teacher or lead)', async () => {
      vi.mocked(useAcademy).mockReturnValue({
        activeAcademy: { id: 10, name: 'Noor Academy' },
        activeRole: 'teacher',
        isLoading: false,
      } as any);

      vi.mocked(useAuth).mockReturnValue({
        user: { id: 50, username: 'lead_teacher', role: 'lead' },
        isLoading: false,
      } as any);

      renderWithProviders(<BillingPanel />);

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(
        screen.getByText(/Only academy owners and administrators can manage/i)
      ).toBeInTheDocument();
    });

    it('renders full billing panel for academy owner', async () => {
      vi.mocked(useAcademy).mockReturnValue({
        activeAcademy: { id: 10, name: 'Noor Academy' },
        activeRole: 'owner',
        isLoading: false,
      } as any);

      vi.mocked(useAuth).mockReturnValue({
        user: { id: 1, username: 'owner_user', role: 'owner' },
        isLoading: false,
      } as any);

      vi.mocked(billingApi.getSubscriptionStatus).mockResolvedValue({
        id: 1,
        organization_id: 10,
        organization_name: 'Noor Academy',
        organization_slug: 'noor-academy',
        paystack_plan_code: 'PLN_monthly_sub',
        status: 'active',
        current_period_end: '2026-11-01T00:00:00Z',
        created_at: '2026-09-01T00:00:00Z',
        updated_at: '2026-10-01T00:00:00Z',
      });
      vi.mocked(billingApi.getOrganizationPayments).mockResolvedValue([]);

      renderWithProviders(<BillingPanel />);

      await waitFor(() => {
        expect(screen.getByText('Billing & Subscriptions')).toBeInTheDocument();
        expect(screen.getByText('Platform Subscription')).toBeInTheDocument();
        expect(screen.getByText('Tuition Settlement Bank Account')).toBeInTheDocument();
        expect(screen.getByText('Tuition Collection History')).toBeInTheDocument();
      });
    });
  });
});
