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

  it('resolves active academy teacher/staff to teacher experience', () => {
    expect(resolveRoleExperience({ activeRole: 'teacher', userRole: null })).toBe('teacher');
    expect(resolveRoleExperience({ activeRole: 'staff', userRole: null })).toBe('teacher');
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
    expect(labels).toContain('Academy');
    expect(labels).toContain('Teachers');
    expect(labels).toContain('Students');
    expect(labels).toContain('Curriculum');
    expect(labels).toContain('Finance');
    expect(labels).toContain('Audit');
  });

  it('parent navigation excludes Finance, Payouts, Teachers, and Academy administration', () => {
    const nav = getNavigationForRole('parent');
    const labels = nav.map((item) => item.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Children');
    expect(labels).toContain('Schedule');
    expect(labels).toContain('Progress');
    expect(labels).toContain('Assessments');

    expect(labels).not.toContain('Finance');
    expect(labels).not.toContain('Payouts');
    expect(labels).not.toContain('My Earnings');
    expect(labels).not.toContain('Academy');
    expect(labels).not.toContain('Teachers');
    expect(labels).not.toContain('Audit');
  });

  it('student navigation excludes Finance, Payouts, Teachers, and Academy administration', () => {
    const nav = getNavigationForRole('student');
    const labels = nav.map((item) => item.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('My Schedule');
    expect(labels).toContain('My Learning');
    expect(labels).toContain('Progress');
    expect(labels).toContain('Assessments');

    expect(labels).not.toContain('Finance');
    expect(labels).not.toContain('Payouts');
    expect(labels).not.toContain('My Earnings');
    expect(labels).not.toContain('Academy');
    expect(labels).not.toContain('Teachers');
    expect(labels).not.toContain('Audit');
  });

  it('teacher navigation has My Earnings but not Academy Finance or Academy Administration', () => {
    const nav = getNavigationForRole('teacher');
    const labels = nav.map((item) => item.label);
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('My Classes');
    expect(labels).toContain('My Earnings');

    expect(labels).not.toContain('Finance');
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
    expect(canAccessRoute('/app/finance', context)).toBe(true);
    expect(canAccessRoute('/app/audit', context)).toBe(true);
  });

  it('blocks teacher from accessing academy administration and academy finance', () => {
    const context = { activeRole: 'teacher' as const, userRole: null };
    expect(canAccessRoute('/app/dashboard', context)).toBe(true);
    expect(canAccessRoute('/app/scheduling', context)).toBe(true);
    expect(canAccessRoute('/app/payouts', context)).toBe(true);

    expect(canAccessRoute('/app/finance', context)).toBe(false);
    expect(canAccessRoute('/app/audit', context)).toBe(false);
    expect(canAccessRoute('/app/academy', context)).toBe(false);
  });

  it('blocks parent from accessing finance, payouts, teachers, and academy routes', () => {
    const context = { activeRole: null, userRole: 'parent' as const };
    expect(canAccessRoute('/app/dashboard', context)).toBe(true);
    expect(canAccessRoute('/app/students', context)).toBe(true);
    expect(canAccessRoute('/app/progress', context)).toBe(true);

    expect(canAccessRoute('/app/finance', context)).toBe(false);
    expect(canAccessRoute('/app/payouts', context)).toBe(false);
    expect(canAccessRoute('/app/academy', context)).toBe(false);
    expect(canAccessRoute('/app/teachers', context)).toBe(false);
    expect(canAccessRoute('/app/audit', context)).toBe(false);
  });

  it('blocks student from accessing finance, payouts, academy, teachers, and audit routes', () => {
    const context = { activeRole: null, userRole: 'student' as const };
    expect(canAccessRoute('/app/dashboard', context)).toBe(true);
    expect(canAccessRoute('/app/scheduling', context)).toBe(true);
    expect(canAccessRoute('/app/progress', context)).toBe(true);

    expect(canAccessRoute('/app/finance', context)).toBe(false);
    expect(canAccessRoute('/app/payouts', context)).toBe(false);
    expect(canAccessRoute('/app/academy', context)).toBe(false);
    expect(canAccessRoute('/app/teachers', context)).toBe(false);
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
