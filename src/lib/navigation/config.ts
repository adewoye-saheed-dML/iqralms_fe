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
  CreditCard,
  Banknote,
  Bell,
  FileUp,
} from 'lucide-react';
import type { Capability } from '@/lib/permissions/capabilities';

// Based on the spec and schema
export type UserRole = 'lead' | 'sub' | 'student' | 'parent';
export type OrgRole = 'owner' | 'admin' | 'staff' | 'teacher';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  // If undefined, all roles can access the base route (but components inside might still restrict).
  requiredCapability?: Capability;
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
    requiredCapability: 'manage_staff', // Changed from staff, only staff/admins should manage teachers
    // Teachers might view their own schedule, but they don't view the entire "Teacher Directory" natively, they view their classes.
    // Let's assume manage_staff provides directory access.
  },
  {
    label: 'Academy',
    href: '/app/academy',
    icon: GraduationCap,
    requiredCapability: 'manage_academy',
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
  },
  {
    label: 'Finance',
    href: '/app/finance',
    icon: Wallet,
    requiredCapability: 'manage_finance',
  },
  {
    label: 'Payouts',
    href: '/app/payouts',
    icon: Banknote,
    requiredCapability: 'view_own_payouts', // Handled by capabilities (admin views all, teacher views own)
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
  },
  {
    label: 'Settings',
    href: '/app/settings',
    icon: Settings,
  },
];
