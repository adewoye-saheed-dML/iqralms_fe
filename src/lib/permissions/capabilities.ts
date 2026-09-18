import type { UserRole, OrgRole } from '@/lib/navigation/config';

export type Capability =
  | 'manage_academy'
  | 'manage_staff'
  | 'manage_students'
  | 'manage_curriculum'
  | 'manage_scheduling'
  | 'manage_finance'
  | 'view_audit'
  | 'view_own_payouts'
  | 'view_academy_payouts'
  | 'manage_notifications'
  | 'manage_imports'
  | 'manage_pricing'
  | 'view_own_progress'
  | 'manage_progress'
  | 'view_own_assessments'
  | 'manage_assessments'
  | 'view_own_schedule'
  | 'view_own_pricing'
  | 'manage_own_waitlist';

export interface PermissionContext {
  userRole?: UserRole | null;
  activeRole?: OrgRole | null;
}

/**
 * Validates whether a user has a specific capability based on their global and academy roles.
 * This is the central permission gate for UI rendering.
 */
export function can(capability: Capability, context: PermissionContext): boolean {
  const { userRole, activeRole } = context;

  switch (capability) {
    case 'manage_academy':
    case 'manage_finance':
    case 'view_audit':
    case 'view_academy_payouts':
    case 'manage_notifications':
    case 'manage_imports':
    case 'manage_pricing':
      // Strictly admin/owner actions
      return activeRole === 'admin' || activeRole === 'owner';

    case 'manage_staff':
    case 'manage_students':
    case 'manage_curriculum':
      // Often delegated to staff as well
      return activeRole === 'admin' || activeRole === 'owner' || activeRole === 'staff';

    case 'manage_scheduling':
    case 'manage_progress':
    case 'manage_assessments':
      // Admin/Owner manage all, Lead Teachers manage for their groups, Teachers manage their own.
      // We grant baseline UI access for these roles, then filter scoped data in the components/backend.
      return (
        activeRole === 'admin' ||
        activeRole === 'owner' ||
        activeRole === 'staff' ||
        activeRole === 'teacher' ||
        userRole === 'lead' ||
        userRole === 'sub'
      );

    case 'view_own_payouts':
      return (
        activeRole === 'teacher' || 
        activeRole === 'staff' || 
        userRole === 'sub' ||
        activeRole === 'owner' ||
        activeRole === 'admin'
      );

    case 'view_own_progress':
    case 'view_own_assessments':
    case 'manage_own_waitlist':
    case 'view_own_schedule':
      return userRole === 'student' || userRole === 'parent';

    case 'view_own_pricing':
      return userRole === 'student';

    default:
      return false;
  }
}
