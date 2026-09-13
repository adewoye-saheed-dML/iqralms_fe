import { LayoutDashboard, Users, Calendar, GraduationCap, Settings, Wallet } from 'lucide-react';

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
    label: 'Academy',
    href: '/app/academy',
    icon: GraduationCap,
    allowedOrgRoles: ['owner', 'admin'],
  },
  {
    label: 'Scheduling',
    href: '/app/scheduling',
    icon: Calendar,
  },
  {
    label: 'Users',
    href: '/app/users',
    icon: Users,
    allowedOrgRoles: ['owner', 'admin', 'staff'],
  },
  {
    label: 'Finance',
    href: '/app/finance',
    icon: Wallet,
    allowedOrgRoles: ['owner', 'admin'],
  },
  {
    label: 'Settings',
    href: '/app/settings',
    icon: Settings,
  },
];
