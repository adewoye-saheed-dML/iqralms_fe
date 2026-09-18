import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppLayout from '../layout';
import * as AuthProvider from '@/lib/auth/auth-provider';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import * as Navigation from 'next/navigation';

vi.mock('@/lib/auth/auth-provider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/academy/academy-provider', () => ({
  useAcademy: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

// Mock the nested layouts/components that are not being tested
vi.mock('@/components/layout/app-sidebar', () => ({
  AppSidebar: () => <div data-testid="sidebar" />,
}));
vi.mock('@/components/layout/app-topbar', () => ({
  AppTopbar: () => <div data-testid="topbar" />,
}));

describe('AppLayout Route Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLayout = () => render(<AppLayout><div>Page Content</div></AppLayout>);

  it('renders loading state when auth is loading', () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({ user: null, isLoading: true } as any);
    vi.mocked(AcademyProvider.useAcademy).mockReturnValue({ isLoading: false } as any);
    vi.mocked(Navigation.usePathname).mockReturnValue('/app/dashboard');
    
    renderLayout();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('redirects to login when unauthenticated', () => {
    const pushMock = vi.fn();
    vi.mocked(Navigation.useRouter).mockReturnValue({ push: pushMock } as any);
    vi.mocked(AuthProvider.useAuth).mockReturnValue({ user: null, isLoading: false } as any);
    vi.mocked(AcademyProvider.useAcademy).mockReturnValue({ isLoading: false } as any);
    vi.mocked(Navigation.usePathname).mockReturnValue('/app/dashboard');

    renderLayout();
    expect(pushMock).toHaveBeenCalledWith('/login?returnUrl=%2Fapp%2Fdashboard');
  });

  it('prompts to create academy when user has no academies', () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({ user: { id: 1 }, isLoading: false } as any);
    vi.mocked(AcademyProvider.useAcademy).mockReturnValue({
      academies: [],
      activeAcademy: null,
      isLoading: false,
    } as any);
    vi.mocked(Navigation.usePathname).mockReturnValue('/app/dashboard');

    renderLayout();
    expect(screen.getByText('No Academy Access')).toBeInTheDocument();
  });

  it('allows owner access to management routes', () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({ user: { id: 1 }, isLoading: false } as any);
    vi.mocked(AcademyProvider.useAcademy).mockReturnValue({
      academies: [{ id: 1 }],
      activeAcademy: { id: 1 },
      activeRole: 'owner',
      isLoading: false,
    } as any);
    vi.mocked(Navigation.usePathname).mockReturnValue('/app/academy');

    renderLayout();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('allows teacher access to scheduling routes', () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({ user: { id: 1 }, isLoading: false } as any);
    vi.mocked(AcademyProvider.useAcademy).mockReturnValue({
      academies: [{ id: 1 }],
      activeAcademy: { id: 1 },
      activeRole: 'teacher',
      isLoading: false,
    } as any);
    vi.mocked(Navigation.usePathname).mockReturnValue('/app/scheduling');

    renderLayout();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('blocks teacher from academy management (forbidden)', () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({ user: { id: 1 }, isLoading: false } as any);
    vi.mocked(AcademyProvider.useAcademy).mockReturnValue({
      academies: [{ id: 1 }],
      activeAcademy: { id: 1 },
      activeRole: 'teacher',
      isLoading: false,
    } as any);
    vi.mocked(Navigation.usePathname).mockReturnValue('/app/academy');

    renderLayout();
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Page Content')).not.toBeInTheDocument();
  });

  it('allows parent access to allowed routes like progress', () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({ user: { id: 1, role: 'parent' }, isLoading: false } as any);
    vi.mocked(AcademyProvider.useAcademy).mockReturnValue({
      academies: [{ id: 1 }],
      activeAcademy: { id: 1 },
      activeRole: null, // Parents don't have active roles in the academy
      isLoading: false,
    } as any);
    vi.mocked(Navigation.usePathname).mockReturnValue('/app/progress');

    renderLayout();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('blocks student from staff directory (forbidden)', () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({ user: { id: 1, role: 'student' }, isLoading: false } as any);
    vi.mocked(AcademyProvider.useAcademy).mockReturnValue({
      academies: [{ id: 1 }],
      activeAcademy: { id: 1 },
      activeRole: null,
      isLoading: false,
    } as any);
    vi.mocked(Navigation.usePathname).mockReturnValue('/app/teachers');

    renderLayout();
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Page Content')).not.toBeInTheDocument();
  });
});
