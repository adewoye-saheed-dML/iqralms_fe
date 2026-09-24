/**
 * Canonical Identity & Role Model for IQRA LMS
 * Source of truth: backend accounts.models.Role and organizations.models.OrganizationRole
 */

export type GlobalAccountRole = 'lead' | 'sub' | 'student' | 'parent';

export type AcademyMembershipRole =
  | 'owner'
  | 'admin'
  | 'staff'
  | 'teacher'
  | 'parent'
  | 'student';

export type RoleExperience =
  | 'owner_admin'
  | 'lead_teacher'
  | 'teacher'
  | 'staff'
  | 'parent'
  | 'student'
  | 'unscoped';

// Backward compatibility aliases
export type UserRole = GlobalAccountRole;
export type OrgRole = AcademyMembershipRole;

export interface RoleResolutionContext {
  activeRole?: AcademyMembershipRole | string | null;
  userRole?: GlobalAccountRole | string | null;
  academyId?: number | null;
}

/**
 * Resolves the role experience from backend data.
 * Active academy membership is authoritative for tenant actions.
 * Global account role determines lead vs sub teacher differentiation.
 */
export function resolveRoleExperience(context: RoleResolutionContext): RoleExperience {
  const { activeRole, userRole, academyId } = context;

  // Explicitly unscoped if no academy is selected when academy context is requested
  if (academyId === null && !activeRole) {
    return 'unscoped';
  }

  // Active academy membership takes precedence
  if (activeRole === 'owner' || activeRole === 'admin') {
    return 'owner_admin';
  }
  if (activeRole === 'teacher') {
    if (userRole === 'lead') {
      return 'lead_teacher';
    }
    return 'teacher';
  }
  if (activeRole === 'staff') {
    return 'staff';
  }
  if (activeRole === 'parent') {
    return 'parent';
  }
  if (activeRole === 'student') {
    return 'student';
  }

  // Fallback to global account role when no active membership role is present
  if (userRole === 'lead') {
    return 'owner_admin'; // or lead_teacher fallback
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

  return 'unscoped';
}
