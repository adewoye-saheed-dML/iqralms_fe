import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaymentsPanel } from '../components/payments-panel';
import { PaymentInitiateCard } from '../components/payment-initiate-card';
import { PaymentHistoryList } from '../components/payment-history-list';
import { PaymentCallbackView } from '../components/payment-callback-view';
import { paymentsApi, type FamilyPayment } from '../api/payments';
import { pricingApi } from '@/features/pricing/api/pricing';
import { familyApi } from '@/features/family/api/family';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth } from '@/lib/auth/auth-provider';

vi.mock('@/lib/academy/academy-provider', () => ({
  useAcademy: vi.fn(),
}));

vi.mock('@/lib/auth/auth-provider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../api/payments', () => ({
  paymentsApi: {
    getMyPayments: vi.fn(),
    getChildPayments: vi.fn(),
    initializePayment: vi.fn(),
    verifyPayment: vi.fn(),
  },
}));

vi.mock('@/features/pricing/api/pricing', () => ({
  pricingApi: {
    getMyAgreements: vi.fn(),
  },
}));

vi.mock('@/features/family/api/family', () => ({
  familyApi: {
    getAcademyChildren: vi.fn(),
    getMyChildren: vi.fn(),
  },
}));

const mockGetSearchParams = vi.fn();
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => mockGetSearchParams(key),
  }),
  usePathname: () => '/app/payments',
}));

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Payments Feature (Phase 9b)', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).location;
    window.location = {
      ...originalLocation,
      href: 'http://localhost/app/payments',
      origin: 'http://localhost',
    } as any;
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  describe('PaymentInitiateCard & Full-Page Redirect', () => {
    it('performs full-page redirect to authorization_url and never opens a new tab', async () => {
      const openSpy = vi.spyOn(window, 'open');

      vi.mocked(pricingApi.getMyAgreements).mockResolvedValue([
        {
          id: 42,
          track: 'Quran Memorization',
          level: { id: 1, name: 'Level 1' } as any,
          standard_rate: '30000.00',
          agreed_rate: '25000.00',
          reason: 'standard',
          reason_display: 'Standard Rate',
          active: true,
        },
      ]);

      vi.mocked(paymentsApi.initializePayment).mockResolvedValue({
        payment_id: 100,
        reference: 'pay_ref_42',
        amount: '25000.00',
        currency: 'NGN',
        authorization_url: 'https://checkout.paystack.com/auth_xyz123',
        access_code: 'access_xyz',
      });

      renderWithProviders(
        <PaymentInitiateCard organizationId={10} isParent={false} />
      );

      await waitFor(() => {
        expect(screen.getByText('Quran Memorization · Level 1')).toBeInTheDocument();
      });

      const payBtn = screen.getByRole('button', { name: /Pay Tuition/i });
      fireEvent.click(payBtn);

      await waitFor(() => {
        expect(paymentsApi.initializePayment).toHaveBeenCalledWith(
          42,
          undefined,
          'http://localhost/app/payments/callback'
        );
      });

      // Acceptance criterion 6: Full-page redirect, never window.open
      await waitFor(() => {
        expect(window.location.href).toBe('https://checkout.paystack.com/auth_xyz123');
        expect(openSpy).not.toHaveBeenCalled();
      });
    });
  });

  describe('PaymentsPanel Role Scoping', () => {
    it('allows adult student to view their tuition panel', async () => {
      vi.mocked(useAcademy).mockReturnValue({
        activeAcademy: { id: 10, name: 'Noor Academy' },
        activeRole: 'student',
        isLoading: false,
      } as any);

      vi.mocked(useAuth).mockReturnValue({
        user: { id: 101, username: 'adult_student', role: 'student', is_minor: false },
        isLoading: false,
      } as any);

      vi.mocked(pricingApi.getMyAgreements).mockResolvedValue([]);
      vi.mocked(paymentsApi.getMyPayments).mockResolvedValue([]);

      renderWithProviders(<PaymentsPanel />);

      await waitFor(() => {
        expect(screen.getByText('Tuition Payments')).toBeInTheDocument();
        expect(screen.getByText('Tuition & Outstanding Balance')).toBeInTheDocument();
        expect(screen.getByText('My Payment History')).toBeInTheDocument();
      });
    });

    it('blocks minor student unconditionally from payment access', async () => {
      vi.mocked(useAcademy).mockReturnValue({
        activeAcademy: { id: 10, name: 'Noor Academy' },
        activeRole: 'student',
        isLoading: false,
      } as any);

      vi.mocked(useAuth).mockReturnValue({
        user: { id: 102, username: 'minor_student', role: 'student', is_minor: true },
        isLoading: false,
      } as any);

      renderWithProviders(<PaymentsPanel />);

      // Acceptance Criterion 5: Minor student's dashboard and nav contain no payment affordance of any kind
      expect(screen.getByText('Access Restricted')).toBeInTheDocument();
      expect(
        screen.getByText(/Minor students do not have financial access/i)
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Pay/i })).not.toBeInTheDocument();
    });

    it('allows parent to select linked child and view/initiate payment', async () => {
      vi.mocked(useAcademy).mockReturnValue({
        activeAcademy: { id: 10, name: 'Noor Academy' },
        activeRole: 'parent',
        isLoading: false,
      } as any);

      vi.mocked(useAuth).mockReturnValue({
        user: { id: 201, username: 'parent_user', role: 'parent' },
        isLoading: false,
      } as any);

      vi.mocked(familyApi.getAcademyChildren).mockResolvedValue([
        {
          id: 301,
          username: 'child_maryam',
          first_name: 'Maryam',
          last_name: 'Ali',
          email: 'maryam@example.com',
          timezone: 'Africa/Lagos',
          date_of_birth: '2016-01-01',
        },
      ]);

      vi.mocked(paymentsApi.getChildPayments).mockResolvedValue([
        {
          id: 501,
          student: 301,
          student_username: 'child_maryam',
          student_name: 'Maryam Ali',
          organization: 10,
          organization_name: 'Noor Academy',
          initiated_by: 201,
          initiated_by_username: 'parent_user',
          pricing_agreement: 15,
          amount: '20000.00',
          currency: 'NGN',
          paystack_reference: 'pay_ref_501',
          status: 'paid',
          created_at: '2026-09-01T10:00:00Z',
          paid_at: '2026-09-01T10:05:00Z',
        },
      ]);

      renderWithProviders(<PaymentsPanel />);

      await waitFor(() => {
        expect(screen.getByText('Select Student')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Maryam Ali/i })).toBeInTheDocument();
        expect(screen.getByText("Children's Payment History")).toBeInTheDocument();
      });
    });
  });

  describe('PaymentCallbackView', () => {
    it('displays honest pending message and does not claim success prematurely', async () => {
      vi.mocked(useAcademy).mockReturnValue({
        activeAcademy: { id: 10, name: 'Noor Academy' },
        isLoading: false,
      } as any);
      vi.mocked(useAuth).mockReturnValue({
        user: { id: 101, username: 'adult_student', role: 'student' },
        isLoading: false,
      } as any);

      mockGetSearchParams.mockImplementation((k: string) => (k === 'reference' ? 'ref_123' : null));

      // Verify endpoint returns pending
      vi.mocked(paymentsApi.verifyPayment).mockResolvedValue({
        reference: 'ref_123',
        status: 'pending',
        paystack_data: { status: 'pending' },
      });
      vi.mocked(paymentsApi.getMyPayments).mockResolvedValue([
        {
          id: 1,
          student: 101,
          student_username: 'adult_student',
          student_name: 'Adult Student',
          organization: 10,
          organization_name: 'Noor Academy',
          initiated_by: 101,
          initiated_by_username: 'adult_student',
          pricing_agreement: 1,
          amount: '25000.00',
          currency: 'NGN',
          paystack_reference: 'ref_123',
          status: 'pending',
          created_at: '2026-10-03T12:00:00Z',
          paid_at: null,
        },
      ]);

      renderWithProviders(<PaymentCallbackView />);

      // Acceptance criterion 7: Never claims a payment succeeded before verified paid
      await waitFor(() => {
        expect(
          screen.getByText(/Confirming this with Paystack — this page will update shortly/i)
        ).toBeInTheDocument();
        expect(screen.queryByText(/Payment Confirmed — Tuition Settled/i)).not.toBeInTheDocument();
      });
    });

    it('displays payment confirmed once verified paid', async () => {
      vi.mocked(useAcademy).mockReturnValue({
        activeAcademy: { id: 10, name: 'Noor Academy' },
        isLoading: false,
      } as any);
      vi.mocked(useAuth).mockReturnValue({
        user: { id: 101, username: 'adult_student', role: 'student' },
        isLoading: false,
      } as any);

      mockGetSearchParams.mockImplementation((k: string) => (k === 'reference' ? 'ref_confirmed' : null));

      vi.mocked(paymentsApi.verifyPayment).mockResolvedValue({
        reference: 'ref_confirmed',
        status: 'paid',
        paystack_data: { status: 'success' },
      });
      vi.mocked(paymentsApi.getMyPayments).mockResolvedValue([
        {
          id: 2,
          student: 101,
          student_username: 'adult_student',
          student_name: 'Adult Student',
          organization: 10,
          organization_name: 'Noor Academy',
          initiated_by: 101,
          initiated_by_username: 'adult_student',
          pricing_agreement: 1,
          amount: '25000.00',
          currency: 'NGN',
          paystack_reference: 'ref_confirmed',
          status: 'paid',
          created_at: '2026-10-03T12:00:00Z',
          paid_at: '2026-10-03T12:02:00Z',
        },
      ]);

      renderWithProviders(<PaymentCallbackView />);

      await waitFor(() => {
        expect(screen.getByText('Paid & Confirmed')).toBeInTheDocument();
        expect(screen.getByText(/Payment Confirmed — Tuition Settled/i)).toBeInTheDocument();
      });
    });
  });
});
