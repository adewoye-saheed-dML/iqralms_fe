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
} from 'lucide-react';

// Based on the spec and schema
export type UserRole = 'lead' | 'sub' | 'student' | 'parent';
export type OrgRole = 'owner' | 'admin' | 'staff' | 'teacher';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  // If allowedUserRoles is undefined, all user roles are allowed
  allowedUserRoles?: UserRole[];
  // If allowedOrgRoles is undefined, all org roles are allowed
  allowedOrgRoles?: OrgRole[];
}

export const navigationConfig: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/app/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Staff',
    href: '/app/staff',
    icon: Users,
    allowedOrgRoles: ['owner', 'admin', 'staff', 'teacher'],
  },
  {
    label: 'Academy',
    href: '/app/academy',
    icon: GraduationCap,
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
    allowedOrgRoles: ['owner', 'admin', 'staff', 'teacher'],
  },
  {
    label: 'Finance',
    href: '/app/finance',
    icon: Wallet,
    allowedOrgRoles: ['owner', 'admin'],
  },
  {
    label: 'Pricing',
    href: '/app/pricing',
    icon: CreditCard,
  },
  {
    label: 'Payouts',
    href: '/app/payouts',
    icon: Banknote,
    allowedOrgRoles: ['owner', 'admin', 'staff', 'teacher'],
  },
  {
    label: 'Settings',
    href: '/app/settings',
    icon: Settings,
  },
];
