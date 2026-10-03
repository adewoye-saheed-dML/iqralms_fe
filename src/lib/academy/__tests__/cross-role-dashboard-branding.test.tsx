import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OwnerAdminDashboard } from '@/features/dashboard/owner-admin-dashboard';
import { TeacherDashboard } from '@/features/dashboard/teacher-dashboard';
import { StudentDashboard } from '@/features/dashboard/student-dashboard';
import { ParentDashboard } from '@/features/dashboard/parent-dashboard';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import * as AuthProvider from '@/lib/auth/auth-provider';
import {
  saveAcademyBranding,
  clearBrandingMemoryCache,
  type AcademyBranding,
} from '@/lib/academy/academy-branding';
import { invitationsApi } from '@/features/invitations/api/invitations';
import { studentsApi } from '@/features/students/api/students';
import { curriculumApi } from '@/features/curriculum/api/curriculum';
import { schedulingApi } from '@/features/scheduling/api/scheduling';
import { assessmentApi } from '@/features/assessment/api/assessment';
import { payoutsApi } from '@/features/payouts/api/payouts';
import { membershipsApi } from '@/features/memberships/api/memberships';
import { teachersApi } from '@/features/teachers/api/teachers';
import { familyApi } from '@/features/family/api/family';

vi.mock('@/features/invitations/api/invitations', () => ({
  invitationsApi: { list: vi.fn().mockResolvedValue([]) },
}));

vi.mock('@/features/teachers/api/teachers', () => ({
  teachersApi: {
    getTeacherConfigurations: vi.fn().mockResolvedValue([]),
    getTeacherTracks: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/features/students/api/students', () => ({
  studentsApi: {
    getStudents: vi.fn().mockResolvedValue([]),
    getMyStudents: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/features/curriculum/api/curriculum', () => ({
  curriculumApi: {
    getTracks: vi.fn().mockResolvedValue([]),
    getLevels: vi.fn().mockResolvedValue([]),
    getAcademyTeacherTracks: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/features/scheduling/api/scheduling', () => ({
  schedulingApi: {
    getAcademyBookings: vi.fn().mockResolvedValue([]),
    getTeachingBookings: vi.fn().mockResolvedValue([]),
    getMyBookings: vi.fn().mockResolvedValue([]),
    getAvailability: vi.fn().mockResolvedValue([]),
    getMyWaitlist: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/features/assessment/api/assessment', () => ({
  assessmentApi: {
    getQueue: vi.fn().mockResolvedValue([]),
    getTeacherAssessments: vi.fn().mockResolvedValue([]),
    getStudentAssessments: vi.fn().mockResolvedValue([]),
    getChildAssessments: vi.fn().mockResolvedValue([]),
    getMyAssessments: vi.fn().mockResolvedValue([]),
    getWardProgress: vi.fn().mockResolvedValue(null),
  },
}));

vi.mock('@/features/payouts/api/payouts', () => ({
  payoutsApi: {
    getMyPayouts: vi.fn().mockResolvedValue([]),
    getMyStatement: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('@/features/memberships/api/memberships', () => ({
  membershipsApi: {
    list: vi.fn().mockResolvedValue([]),
    update: vi.fn(),
  },
}));

vi.mock('@/features/family/api/family', () => ({
  familyApi: {
    getMyChildren: vi.fn().mockResolvedValue([]),
    createParentLink: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/app/dashboard',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

const mockAcademy = {
  id: 88,
  name: 'Al-Huda International Quran Academy',
  slug: 'al-huda',
  timezone: 'Africa/Cairo',
  is_active: true,
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

const customBranding: AcademyBranding = {
  academyId: 88,
  academyName: 'Al-Huda International Quran Academy',
  logoUrl: 'https://example.com/assets/al-huda-logo.png',
  primaryColor: '#1d4ed8', // Royal Blue
};

describe('Cross-Role Dashboard Logo and Theme Color Synchronization', () => {
  beforeEach(() => {
    localStorage.clear();
    clearBrandingMemoryCache();
    document.title = '';
    document.documentElement.style.removeProperty('--primary');
    document.documentElement.style.removeProperty('--color-primary');
    document.documentElement.style.removeProperty('--ring');

    // Save custom branding for academy 88
    saveAcademyBranding(customBranding);
  });

  it('reflects company logo, academy name, and theme color on Owner / Admin dashboard', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: mockAcademy,
      activeRole: 'owner',
    } as any);
    vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
      user: { id: 1, username: 'owner_ahmad', first_name: 'Sheikh Ahmad', role: 'owner' },
    } as any);

    renderWithProviders(<OwnerAdminDashboard />);

    // Custom logo is displayed
    const logoImg = screen.getByRole('img', { name: /Al-Huda International Quran Academy Logo/i });
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute('src', 'https://example.com/assets/al-huda-logo.png');

    // Academy name is rendered
    expect(screen.getByText('Al-Huda International Quran Academy')).toBeInTheDocument();
    expect(screen.getByText('Academy Administration')).toBeInTheDocument();

    // Theme color applied to CSS variables
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#1d4ed8');
    expect(document.documentElement.style.getPropertyValue('--ring')).toBe('#1d4ed8');
  });

  it('reflects company logo, academy name, and theme color on Teacher dashboard', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: mockAcademy,
      activeRole: 'teacher',
    } as any);
    vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
      user: { id: 2, username: 'ustadh_ali', first_name: 'Ustadh Ali', role: 'sub' },
    } as any);

    renderWithProviders(<TeacherDashboard />);

    // Custom logo is displayed on teacher dashboard
    const logoImg = screen.getByRole('img', { name: /Al-Huda International Quran Academy Logo/i });
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute('src', 'https://example.com/assets/al-huda-logo.png');

    // Academy name & teacher role are rendered
    expect(screen.getByText('Al-Huda International Quran Academy')).toBeInTheDocument();
    expect(screen.getByText('Teacher Dashboard')).toBeInTheDocument();

    // Theme color applied to CSS variables
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#1d4ed8');
    expect(document.documentElement.style.getPropertyValue('--ring')).toBe('#1d4ed8');
  });

  it('reflects company logo, academy name, and theme color on Adult Student dashboard', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: mockAcademy,
      activeRole: 'student',
    } as any);
    vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
      user: { id: 3, username: 'student_zayd', first_name: 'Zayd', role: 'student', is_minor: false },
    } as any);

    renderWithProviders(<StudentDashboard />);

    // Custom logo is displayed on student dashboard
    const logoImg = screen.getByRole('img', { name: /Al-Huda International Quran Academy Logo/i });
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute('src', 'https://example.com/assets/al-huda-logo.png');

    // Academy name & student role are rendered
    expect(screen.getByText('Al-Huda International Quran Academy')).toBeInTheDocument();
    expect(screen.getByText('Student Learning Portal')).toBeInTheDocument();

    // Theme color applied to CSS variables
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#1d4ed8');
  });

  it('reflects company logo, academy name, and brand styling on Verified Minor Student home screen', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: mockAcademy,
      activeRole: 'student',
    } as any);
    vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
      user: {
        id: 4,
        username: 'kid_maryam',
        first_name: 'Maryam',
        role: 'student',
        is_minor: true,
        is_fully_active: true,
      },
    } as any);

    renderWithProviders(<StudentDashboard />);

    // Custom logo is displayed on minor student hero
    const logoImg = screen.getByRole('img', { name: /Al-Huda International Quran Academy Logo/i });
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute('src', 'https://example.com/assets/al-huda-logo.png');

    // Greeting and academy name are rendered
    expect(screen.getByText(/Assalamu Alaikum, Maryam! 🌟/)).toBeInTheDocument();
    expect(screen.getByText(/Al-Huda International Quran Academy/)).toBeInTheDocument();

    // Theme color applied
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#1d4ed8');
  });

  it('reflects company logo, academy name, and theme color on Parent dashboard', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: mockAcademy,
      activeRole: 'parent',
    } as any);
    vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
      user: { id: 5, username: 'parent_ibrahim', first_name: 'Ibrahim', role: 'parent' },
    } as any);

    renderWithProviders(<ParentDashboard />);

    // Custom logo is displayed on parent dashboard
    const logoImg = screen.getByRole('img', { name: /Al-Huda International Quran Academy Logo/i });
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute('src', 'https://example.com/assets/al-huda-logo.png');

    // Academy name & parent role are rendered
    expect(screen.getByText('Al-Huda International Quran Academy')).toBeInTheDocument();
    expect(screen.getByText('Parent Portal')).toBeInTheDocument();

    // Theme color applied
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#1d4ed8');
  });
});
