import type {
  GlobalAccountRole,
  AcademyMembershipRole,
  UserRole,
  OrgRole,
} from '@/lib/identity/roles';

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
  | 'manage_payouts'
  | 'manage_notifications'
  | 'manage_imports'
  | 'manage_pricing'
  | 'review_assessments'
  | 'review_placements'
  | 'view_own_progress'
  | 'manage_progress'
  | 'view_own_assessments'
  | 'manage_assessments'
  | 'view_own_schedule'
  | 'view_own_pricing'
  | 'manage_own_waitlist';

export interface PermissionContext {
  userRole?: GlobalAccountRole | UserRole | string | null;
  activeRole?: AcademyMembershipRole | OrgRole | string | null;
}

/**
 * Backend authorization is authoritative.
 * These helpers mirror backend permission classes:
 * - is_owner_or_admin
 * - is_lead_teacher (active membership = teacher AND global user role = lead)
 * - is_owner_admin_or_lead_teacher
 */
export function isOwnerOrAdmin(context: PermissionContext): boolean {
  return context.activeRole === 'owner' || context.activeRole === 'admin';
}

export function isLeadTeacher(context: PermissionContext): boolean {
  return context.userRole === 'lead' && context.activeRole === 'teacher';
}

export function isOwnerAdminOrLead(context: PermissionContext): boolean {
  return isOwnerOrAdmin(context) || isLeadTeacher(context);
}

export function isTeacher(context: PermissionContext): boolean {
  return (
    context.activeRole === 'teacher' ||
    context.userRole === 'lead' ||
    context.userRole === 'sub'
  );
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
    case 'manage_notifications':
    case 'manage_imports':
      return activeRole === 'admin' || activeRole === 'owner';

    case 'view_academy_payouts':
    case 'manage_payouts':
    case 'manage_pricing':
    case 'review_assessments':
    case 'review_placements':
      return isOwnerAdminOrLead(context);

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
      return userRole === 'student' || userRole === 'parent' || activeRole === 'student' || activeRole === 'parent';

    case 'view_own_schedule':
      return userRole === 'student' || userRole === 'parent' || activeRole === 'student' || activeRole === 'parent';

    case 'view_own_pricing':
      return userRole === 'student' || activeRole === 'student';

    default:
      return false;
  }
}
