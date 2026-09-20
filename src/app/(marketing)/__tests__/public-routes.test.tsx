import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HomePage from '@/app/(marketing)/page';
import AboutPage from '@/app/(marketing)/about/page';
import FeaturesPage from '@/app/(marketing)/features/page';
import PricingPage from '@/app/(marketing)/pricing/page';
import ContactPage from '@/app/(marketing)/contact/page';
import AcceptInvitationPage from '@/app/(auth)/accept-invitation/page';
import * as AuthProvider from '@/lib/auth/auth-provider';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/auth/auth-provider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/academy/academy-provider', () => ({
  useAcademy: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
  useSearchParams: vi.fn(() => ({
    get: vi.fn((key: string) => (key === 'token' ? 'test-token-123' : key === 'org' ? '1' : null)),
  })),
}));

describe('Public Route Pages Rendering', () => {
  it('renders marketing landing page with core value and CTAs', () => {
    render(<HomePage />);
    expect(
      screen.getByText(/Streamline your Quran Academy with structured learning & operations/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Pricing & Access/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign In to Academy/i })).toBeInTheDocument();
  });

  it('renders about page with institutional mission', () => {
    render(<AboutPage />);
    expect(
      screen.getByText(/Dedicated software for Quranic educational institutions/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Structured Pedagogy/i)).toBeInTheDocument();
  });

  it('renders features page with curriculum, scheduling, and assessment groups', () => {
    render(<FeaturesPage />);
    expect(screen.getByText(/Complete features for your Quran Academy/i)).toBeInTheDocument();
    expect(screen.getByText(/Curriculum & Track Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Scheduling & Booking Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Assessment & Grading Queue/i)).toBeInTheDocument();
  });

  it('renders pricing page with transparent tiers and institutional notice', () => {
    render(<PricingPage />);
    expect(
      screen.getByText(/Transparent Pricing & Institutional Access/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Standard Academy/i)).toBeInTheDocument();
    expect(screen.getByText(/Professional Academy/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Institutional/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Institutional Access Notice/i)).toBeInTheDocument();
  });

  it('renders contact page with support details and inquiry form', () => {
    render(<ContactPage />);
    expect(screen.getByText(/Contact IQRA LMS Support/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
  });

  it('renders invitation acceptance route outside academy shell', () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({
      user: { id: 1, email: 'teacher@example.com' },
      isLoading: false,
    } as any);
    vi.mocked(AcademyProvider.useAcademy).mockReturnValue({
      refreshAcademies: vi.fn(),
      setActiveAcademy: vi.fn(),
    } as any);

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <AcceptInvitationPage />
      </QueryClientProvider>
    );

    expect(screen.getByText(/Accept Academy Invitation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Academy ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Invitation Token/i)).toBeInTheDocument();
  });
});
