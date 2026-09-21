import {
  LayoutDashboard,
  Users,
  Calendar,
  GraduationCap,
  Settings,
  Wallet,
  BookOpen,
  CheckSquare,
  TrendingUp,
  Banknote,
  Bell,
  FileUp,
  Shield,
  User,
  Clock,
  CalendarCheck,
} from 'lucide-react';
import type { Capability } from '@/lib/permissions/capabilities';

// Global user account roles vs academy membership roles
export type UserRole = 'lead' | 'sub' | 'student' | 'parent';
export type OrgRole = 'owner' | 'admin' | 'teacher' | 'parent' | 'student';
export type RoleExperience = 'owner_admin' | 'teacher' | 'parent' | 'student';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  requiredCapability?: Capability;
  allowedOrgRoles?: OrgRole[];
  allowedUserRoles?: UserRole[];
}

/**
 * Resolves the role experience for a user within an academy context.
 * The active academy membership role is prioritized.
 */
export function resolveRoleExperience(context: {
  activeRole?: OrgRole | string | null;
  userRole?: UserRole | null;
}): RoleExperience {
  const { activeRole, userRole } = context;

  // Active academy membership takes precedence
  if (activeRole === 'owner' || activeRole === 'admin') {
    return 'owner_admin';
  }
  if (activeRole === 'teacher') {
    return 'teacher';
  }
  if (activeRole === 'parent') {
    return 'parent';
  }
  if (activeRole === 'student') {
    return 'student';
  }

  // Fallback to user global account role
  if (userRole === 'lead') {
    return 'owner_admin';
  }
  if (userRole === 'sub') {
    return 'teacher';
  }
  if (userRole === 'parent') {
    return 'parent';
  }
  if (userRole === 'student') {
    return 'student';
  }

  return 'student';
}

/**
 * Base navigation catalog with role constraints.
 */
export const navigationConfig: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/app/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Academy',
    href: '/app/academy',
    icon: GraduationCap,
    requiredCapability: 'manage_academy',
    allowedOrgRoles: ['owner', 'admin'],
  },
  {
    label: 'Teachers',
    href: '/app/teachers',
    icon: Users,
    requiredCapability: 'manage_teachers',
    allowedOrgRoles: ['owner', 'admin'],
  },
  {
    label: 'Students',
    href: '/app/students',
    icon: Users,
    requiredCapability: 'manage_students',
    allowedOrgRoles: ['owner', 'admin'],
  },
  {
    label: 'Curriculum',
    href: '/app/curriculum',
    icon: BookOpen,
    requiredCapability: 'manage_curriculum',
    allowedOrgRoles: ['owner', 'admin'],
  },
  {
    label: 'Scheduling',
    href: '/app/scheduling',
    icon: Calendar,
  },
  {
    label: 'Assessments',
    href: '/app/assessments',
    icon: CheckSquare,
  },
  {
    label: 'Progress',
    href: '/app/progress',
    icon: TrendingUp,
  },
  {
    label: 'Finance',
    href: '/app/finance',
    icon: Wallet,
    requiredCapability: 'manage_finance',
    allowedOrgRoles: ['owner', 'admin'],
  },
  {
    label: 'Payouts',
    href: '/app/payouts',
    icon: Banknote,
    requiredCapability: 'view_own_payouts',
  },
  {
    label: 'Notifications',
    href: '/app/notifications',
    icon: Bell,
  },
  {
    label: 'Audit',
    href: '/app/audit',
    icon: Shield,
    requiredCapability: 'view_audit',
    allowedOrgRoles: ['owner', 'admin'],
  },
  {
    label: 'Imports',
    href: '/app/imports',
    icon: FileUp,
    requiredCapability: 'manage_imports',
    allowedOrgRoles: ['owner', 'admin'],
  },
  {
    label: 'Settings',
    href: '/app/settings',
    icon: Settings,
    allowedOrgRoles: ['owner', 'admin'],
  },
];

/**
 * Returns the exact role-specific navigation items according to Section 28 of the Architecture Reset.
 */
export function getNavigationForRole(experience: RoleExperience): NavItem[] {
  switch (experience) {
    case 'owner_admin':
      return [
        { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
        { label: 'Academy', href: '/app/academy', icon: GraduationCap, requiredCapability: 'manage_academy' },
        { label: 'Teachers', href: '/app/teachers', icon: Users, requiredCapability: 'manage_teachers' },
        { label: 'Students', href: '/app/students', icon: Users, requiredCapability: 'manage_students' },
        { label: 'Curriculum', href: '/app/curriculum', icon: BookOpen, requiredCapability: 'manage_curriculum' },
        { label: 'Scheduling', href: '/app/scheduling', icon: Calendar },
        { label: 'Assessments', href: '/app/assessments', icon: CheckSquare },
        { label: 'Progress / Reports', href: '/app/progress', icon: TrendingUp },
        { label: 'Finance', href: '/app/finance', icon: Wallet, requiredCapability: 'manage_finance' },
        { label: 'Notifications', href: '/app/notifications', icon: Bell },
        { label: 'Audit', href: '/app/audit', icon: Shield, requiredCapability: 'view_audit' },
        { label: 'Settings', href: '/app/settings', icon: Settings },
      ];

    case 'teacher':
      return [
        { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
        { label: 'My Classes', href: '/app/scheduling', icon: Calendar },
        { label: 'My Schedule', href: '/app/scheduling?view=calendar', icon: Clock },
        { label: 'Students', href: '/app/students', icon: Users },
        { label: 'Assessments', href: '/app/assessments', icon: CheckSquare },
        { label: 'Progress', href: '/app/progress', icon: TrendingUp },
        { label: 'Availability', href: '/app/scheduling?tab=availability', icon: CalendarCheck },
        { label: 'My Earnings', href: '/app/payouts', icon: Banknote, requiredCapability: 'view_own_payouts' },
        { label: 'Notifications', href: '/app/notifications', icon: Bell },
        { label: 'Profile', href: '/app/profile', icon: User },
      ];

    case 'parent':
      return [
        { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
        { label: 'Children', href: '/app/students', icon: Users },
        { label: 'Schedule', href: '/app/scheduling', icon: Calendar },
        { label: 'Progress', href: '/app/progress', icon: TrendingUp },
        { label: 'Assessments', href: '/app/assessments', icon: CheckSquare },
        { label: 'Notifications', href: '/app/notifications', icon: Bell },
        { label: 'Profile', href: '/app/profile', icon: User },
      ];

    case 'student':
      return [
        { label: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
        { label: 'My Schedule', href: '/app/scheduling', icon: Calendar },
        { label: 'My Learning', href: '/app/progress', icon: BookOpen },
        { label: 'Progress', href: '/app/progress', icon: TrendingUp },
        { label: 'Assessments', href: '/app/assessments', icon: CheckSquare },
        { label: 'Notifications', href: '/app/notifications', icon: Bell },
        { label: 'Profile', href: '/app/profile', icon: User },
      ];
  }
}

/**
 * Central route access guard policy (Section 12 of Architecture Reset).
 * Enforces UX-level access control on direct URL navigation.
 */
export function canAccessRoute(
  pathname: string,
  context: { activeRole?: OrgRole | string | null; userRole?: UserRole | null }
): boolean {
  const experience = resolveRoleExperience(context);

  // Common routes accessible to all authenticated roles
  if (
    pathname === '/app/dashboard' ||
    pathname === '/app/notifications' ||
    pathname === '/app/profile' ||
    pathname === '/app/academy/create'
  ) {
    return true;
  }

  // Owner/Admin has full access to all app routes
  if (experience === 'owner_admin') {
    return true;
  }

  // Teacher route access
  if (experience === 'teacher') {
    // Strictly forbidden for teachers
    if (
      pathname.startsWith('/app/finance') ||
      pathname.startsWith('/app/audit') ||
      pathname.startsWith('/app/academy') ||
      pathname.startsWith('/app/imports') ||
      pathname.startsWith('/app/settings')
    ) {
      return false;
    }
    // Permitted teaching workflows
    return (
      pathname.startsWith('/app/scheduling') ||
      pathname.startsWith('/app/students') ||
      pathname.startsWith('/app/assessments') ||
      pathname.startsWith('/app/progress') ||
      pathname.startsWith('/app/payouts')
    );
  }

  // Parent route access
  if (experience === 'parent') {
    // Strictly forbidden for parents
    if (
      pathname.startsWith('/app/finance') ||
      pathname.startsWith('/app/payouts') ||
      pathname.startsWith('/app/academy') ||
      pathname.startsWith('/app/teachers') ||
      pathname.startsWith('/app/curriculum') ||
      pathname.startsWith('/app/imports') ||
      pathname.startsWith('/app/audit') ||
      pathname.startsWith('/app/settings')
    ) {
      return false;
    }
    return (
      pathname.startsWith('/app/students') ||
      pathname.startsWith('/app/scheduling') ||
      pathname.startsWith('/app/progress') ||
      pathname.startsWith('/app/assessments')
    );
  }

  // Student route access
  if (experience === 'student') {
    // Strictly forbidden for students
    if (
      pathname.startsWith('/app/finance') ||
      pathname.startsWith('/app/payouts') ||
      pathname.startsWith('/app/academy') ||
      pathname.startsWith('/app/teachers') ||
      pathname.startsWith('/app/curriculum') ||
      pathname.startsWith('/app/imports') ||
      pathname.startsWith('/app/audit') ||
      pathname.startsWith('/app/settings') ||
      pathname === '/app/students/add' ||
      pathname.startsWith('/app/students/add')
    ) {
      return false;
    }
    return (
      pathname.startsWith('/app/scheduling') ||
      pathname.startsWith('/app/progress') ||
      pathname.startsWith('/app/assessments')
    );
  }

  return false;
}
