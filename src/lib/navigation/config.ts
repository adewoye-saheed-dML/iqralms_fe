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
} from 'lucide-react';
import type { Capability } from '@/lib/permissions/capabilities';

// Global user account roles vs academy membership roles
export type UserRole = 'lead' | 'sub' | 'student' | 'parent';
export type OrgRole = 'owner' | 'admin' | 'staff' | 'teacher';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  requiredCapability?: Capability;
  allowedOrgRoles?: OrgRole[];
  allowedUserRoles?: UserRole[];
}

export const navigationConfig: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/app/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Teachers',
    href: '/app/teachers',
    icon: Users,
    requiredCapability: 'manage_staff',
    allowedOrgRoles: ['owner', 'admin'],
  },
  {
    label: 'Academy',
    href: '/app/academy',
    icon: GraduationCap,
    requiredCapability: 'manage_academy',
    allowedOrgRoles: ['owner', 'admin'],
  },
  {
    label: 'Curriculum',
    href: '/app/curriculum',
    icon: BookOpen,
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
    label: 'Students',
    href: '/app/students',
    icon: Users,
    requiredCapability: 'manage_students',
    allowedOrgRoles: ['owner', 'admin'],
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
  },
];
