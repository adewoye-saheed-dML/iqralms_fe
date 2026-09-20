import type { UserRole, OrgRole } from '@/lib/navigation/config';

export type Capability =
  | 'manage_academy'
  | 'manage_teachers'
  | 'manage_invitations'
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
 * Frontend capability gate. Backend authorization remains authoritative.
 */
export function can(capability: Capability, context: PermissionContext): boolean {
  const { activeRole, userRole } = context;

  switch (capability) {
    case 'manage_academy':
    case 'manage_teachers':
    case 'manage_invitations':
    case 'manage_students':
    case 'manage_curriculum':
    case 'manage_finance':
    case 'view_audit':
    case 'view_academy_payouts':
    case 'manage_notifications':
    case 'manage_imports':
    case 'manage_pricing':
      return activeRole === 'admin' || activeRole === 'owner';

    case 'manage_scheduling':
    case 'manage_progress':
    case 'manage_assessments':
      return (
        activeRole === 'admin' ||
        activeRole === 'owner' ||
        activeRole === 'teacher' ||
        userRole === 'lead' ||
        userRole === 'sub'
      );

    case 'view_own_payouts':
      return (
        activeRole === 'teacher' ||
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
