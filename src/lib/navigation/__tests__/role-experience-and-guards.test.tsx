import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  resolveRoleExperience,
  getNavigationForRole,
  canAccessRoute,
} from '../config';
import DashboardPage from '@/app/app/dashboard/page';
import * as AuthProvider from '@/lib/auth/auth-provider';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/lib/auth/auth-provider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/academy/academy-provider', () => ({
  useAcademy: vi.fn(),
}));

// Mock sub-dashboards to verify role-specific dispatching
vi.mock('@/features/dashboard/owner-admin-dashboard', () => ({
  OwnerAdminDashboard: () => <div data-testid="owner-admin-dashboard">Owner Admin Dashboard</div>,
}));
vi.mock('@/features/dashboard/teacher-dashboard', () => ({
  TeacherDashboard: () => <div data-testid="teacher-dashboard">Teacher Dashboard</div>,
}));
vi.mock('@/features/dashboard/parent-dashboard', () => ({
  ParentDashboard: () => <div data-testid="parent-dashboard">Parent Dashboard</div>,
}));
vi.mock('@/features/dashboard/student-dashboard', () => ({
  StudentDashboard: () => <div data-testid="student-dashboard">Student Dashboard</div>,
}));

describe('Role Resolution and Experience Mapping', () => {
  it('resolves active academy owner/admin to owner_admin experience', () => {
    expect(resolveRoleExperience({ activeRole: 'owner', userRole: 'lead' })).toBe('owner_admin');
    expect(resolveRoleExperience({ activeRole: 'admin', userRole: 'sub' })).toBe('owner_admin');
    expect(resolveRoleExperience({ activeRole: 'admin', userRole: null })).toBe('owner_admin');
  });

  it('resolves active academy teacher to teacher experience', () => {
    expect(resolveRoleExperience({ activeRole: 'teacher', userRole: null })).toBe('teacher');
  });

  it('resolves parent global role without conflicting active role to parent experience', () => {
    expect(resolveRoleExperience({ activeRole: null, userRole: 'parent' })).toBe('parent');
  });

  it('resolves student global role without conflicting active role to student experience', () => {
    expect(resolveRoleExperience({ activeRole: null, userRole: 'student' })).toBe('student');
  });
});

describe('Navigation Policy per Role', () => {
  it('owner/admin navigation includes management routes', () => {
    const nav = getNavigationForRole('owner_admin');
    const labels = nav.map((item) => item.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Invitations');
    expect(labels).not.toContain('Academy');
    expect(labels).toContain('Teachers');
    expect(labels).toContain('Students');
    expect(labels).toContain('Curriculum');
    expect(labels).toContain('Pricing');
    expect(labels).toContain('Payouts');
    expect(labels).toContain('Billing');
    expect(labels).toContain('Audit');
  });

  it('parent navigation includes Payments and excludes Payouts, Teachers, and Academy administration', () => {
    const nav = getNavigationForRole('parent');
    const labels = nav.map((item) => item.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Children');
    expect(labels).toContain('Schedule');
    expect(labels).not.toContain('Progress');
    expect(labels).toContain('Assessments');
    expect(labels).toContain('Payments');

    expect(labels).not.toContain('Billing');
    expect(labels).not.toContain('Payouts');
    expect(labels).not.toContain('My Earnings');
    expect(labels).not.toContain('Academy');
    expect(labels).not.toContain('Teachers');
    expect(labels).not.toContain('Audit');
  });

  it('student navigation includes Payments and excludes Payouts, Teachers, and Academy administration', () => {
    const nav = getNavigationForRole('student');
    const labels = nav.map((item) => item.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('My Schedule');
    expect(labels).not.toContain('Progress & Learning');
    expect(labels).toContain('Assessments');
    expect(labels).toContain('Payments');

    expect(labels).not.toContain('Billing');
    expect(labels).not.toContain('Payouts');
    expect(labels).not.toContain('My Earnings');
    expect(labels).not.toContain('Academy');
    expect(labels).not.toContain('Teachers');
    expect(labels).not.toContain('Audit');
  });

  it('teacher navigation has My Earnings but not Billing or Academy Administration', () => {
    const nav = getNavigationForRole('teacher');
    const labels = nav.map((item) => item.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('My Classes');
    expect(labels).toContain('My Earnings');

    expect(labels).not.toContain('Billing');
    expect(labels).not.toContain('Payments');
    expect(labels).not.toContain('Academy');
    expect(labels).not.toContain('Audit');
  });
});

describe('Direct Route Access Guards (canAccessRoute)', () => {
  it('allows owner/admin access to all routes', () => {
    const context = { activeRole: 'owner' as const, userRole: 'lead' as const };
    expect(canAccessRoute('/app/dashboard', context)).toBe(true);
    expect(canAccessRoute('/app/academy', context)).toBe(true);
    expect(canAccessRoute('/app/teachers', context)).toBe(true);
    expect(canAccessRoute('/app/billing', context)).toBe(true);
    expect(canAccessRoute('/app/audit', context)).toBe(true);
  });

  it('blocks teacher from accessing academy administration, billing, and payments', () => {
    const context = { activeRole: 'teacher' as const, userRole: null };
    expect(canAccessRoute('/app/dashboard', context)).toBe(true);
    expect(canAccessRoute('/app/scheduling', context)).toBe(true);
    expect(canAccessRoute('/app/payouts', context)).toBe(true);

    expect(canAccessRoute('/app/billing', context)).toBe(false);
    expect(canAccessRoute('/app/payments', context)).toBe(false);
    expect(canAccessRoute('/app/audit', context)).toBe(false);
    expect(canAccessRoute('/app/academy', context)).toBe(false);
  });

  it('blocks parent from accessing billing, payouts, teachers, and academy routes but allows payments', () => {
    const context = { activeRole: null, userRole: 'parent' as const };
    expect(canAccessRoute('/app/dashboard', context)).toBe(true);
    expect(canAccessRoute('/app/students', context)).toBe(true);
    expect(canAccessRoute('/app/progress', context)).toBe(false);
    expect(canAccessRoute('/app/payments', context)).toBe(true);

    expect(canAccessRoute('/app/billing', context)).toBe(false);
    expect(canAccessRoute('/app/payouts', context)).toBe(false);
    expect(canAccessRoute('/app/academy', context)).toBe(false);
    expect(canAccessRoute('/app/teachers', context)).toBe(false);
    expect(canAccessRoute('/app/audit', context)).toBe(false);
  });

  it('allows adult student to access payments, but blocks minor student', () => {
    const adultContext = { activeRole: null, userRole: 'student' as const, isMinor: false };
    expect(canAccessRoute('/app/dashboard', adultContext)).toBe(true);
    expect(canAccessRoute('/app/scheduling', adultContext)).toBe(true);
    expect(canAccessRoute('/app/payments', adultContext)).toBe(true);
    expect(canAccessRoute('/app/billing', adultContext)).toBe(false);

    const minorContext = { activeRole: null, userRole: 'student' as const, isMinor: true };
    expect(canAccessRoute('/app/payments', minorContext)).toBe(false);
  });

  it('blocks student from accessing billing, payouts, academy, teachers, and audit routes', () => {
    const context = { activeRole: null, userRole: 'student' as const };
    expect(canAccessRoute('/app/dashboard', context)).toBe(true);
    expect(canAccessRoute('/app/scheduling', context)).toBe(true);
    expect(canAccessRoute('/app/progress', context)).toBe(false);

    expect(canAccessRoute('/app/billing', context)).toBe(false);
    expect(canAccessRoute('/app/payouts', context)).toBe(false);
    expect(canAccessRoute('/app/academy', context)).toBe(false);
    expect(canAccessRoute('/app/teachers', context)).toBe(false);
    expect(canAccessRoute('/app/audit', context)).toBe(false);
  });

  it('allows lead teacher access to teaching, curriculum, pricing, and payouts, but blocks billing/payments/academy/audit', () => {
    const context = { activeRole: 'teacher' as const, userRole: 'lead' as const };
    expect(canAccessRoute('/app/dashboard', context)).toBe(true);
    expect(canAccessRoute('/app/scheduling', context)).toBe(true);
    expect(canAccessRoute('/app/curriculum', context)).toBe(true);
    expect(canAccessRoute('/app/pricing', context)).toBe(true);
    expect(canAccessRoute('/app/payouts', context)).toBe(true);

    expect(canAccessRoute('/app/billing', context)).toBe(false);
    expect(canAccessRoute('/app/payments', context)).toBe(false);
    expect(canAccessRoute('/app/academy', context)).toBe(false);
    expect(canAccessRoute('/app/audit', context)).toBe(false);
    expect(canAccessRoute('/app/settings', context)).toBe(false);
  });

  it('strictly restricts staff role to personal surfaces', () => {
    const context = { activeRole: 'staff' as const, userRole: null };
    expect(canAccessRoute('/app/dashboard', context)).toBe(true);
    expect(canAccessRoute('/app/academy', context)).toBe(false);
    expect(canAccessRoute('/app/teachers', context)).toBe(false);
    expect(canAccessRoute('/app/students', context)).toBe(false);
    expect(canAccessRoute('/app/billing', context)).toBe(false);
    expect(canAccessRoute('/app/payments', context)).toBe(false);
    expect(canAccessRoute('/app/audit', context)).toBe(false);
  });
});

describe('Dashboard Role-Specific Experience Rendering', () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  const renderDashboard = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <DashboardPage />
      </QueryClientProvider>
    );

  it('renders OwnerAdminDashboard for owner active role', () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({
      user: { id: 1, username: 'owner_user' },
      isLoading: false,
    } as any);
    vi.mocked(AcademyProvider.useAcademy).mockReturnValue({
      activeRole: 'owner',
      activeAcademy: { id: 10, name: 'Main Academy' },
    } as any);

    renderDashboard();
    expect(screen.getByTestId('owner-admin-dashboard')).toBeInTheDocument();
  });

  it('renders TeacherDashboard for teacher active role', () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({
      user: { id: 2, username: 'teacher_user' },
      isLoading: false,
    } as any);
    vi.mocked(AcademyProvider.useAcademy).mockReturnValue({
      activeRole: 'teacher',
      activeAcademy: { id: 10, name: 'Main Academy' },
    } as any);

    renderDashboard();
    expect(screen.getByTestId('teacher-dashboard')).toBeInTheDocument();
  });

  it('renders ParentDashboard for parent account', () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({
      user: { id: 3, username: 'parent_user', role: 'parent' },
      isLoading: false,
    } as any);
    vi.mocked(AcademyProvider.useAcademy).mockReturnValue({
      activeRole: null,
      activeAcademy: { id: 10, name: 'Main Academy' },
    } as any);

    renderDashboard();
    expect(screen.getByTestId('parent-dashboard')).toBeInTheDocument();
  });

  it('renders StudentDashboard for student account', () => {
    vi.mocked(AuthProvider.useAuth).mockReturnValue({
      user: { id: 4, username: 'student_user', role: 'student' },
      isLoading: false,
    } as any);
    vi.mocked(AcademyProvider.useAcademy).mockReturnValue({
      activeRole: null,
      activeAcademy: { id: 10, name: 'Main Academy' },
    } as any);

    renderDashboard();
    expect(screen.getByTestId('student-dashboard')).toBeInTheDocument();
  });
});
