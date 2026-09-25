'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { resolveRoleExperience } from '@/lib/navigation/config';
import { OwnerAdminDashboard } from '@/features/dashboard/owner-admin-dashboard';
import { TeacherDashboard } from '@/features/dashboard/teacher-dashboard';
import { ParentDashboard } from '@/features/dashboard/parent-dashboard';
import { StudentDashboard } from '@/features/dashboard/student-dashboard';
import { EmptyState } from '@/components/ui/empty-state';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeRole } = useAcademy();

  const experience = resolveRoleExperience({
    activeRole,
    userRole: user?.role,
  });

  switch (experience) {
    case 'owner_admin':
      return <OwnerAdminDashboard />;
    // A lead teacher's membership role is 'teacher'; the teacher dashboard
    // already surfaces the review queue for that case (see teacher-dashboard.tsx).
    case 'lead_teacher':
    case 'teacher':
      return <TeacherDashboard />;
    case 'parent':
      return <ParentDashboard />;
    case 'student':
      return <StudentDashboard />;
    // SSoT section 3 does not define a home experience for 'staff', and
    // 'unscoped' is normally caught earlier by the app shell (no-academy
    // empty state). Show an honest gap rather than silently rendering the
    // student dashboard for either.
    case 'staff':
    case 'unscoped':
    default:
      return (
        <div className="flex min-h-[60vh] items-center justify-center p-4">
          <EmptyState
            icon={<LayoutDashboard className="text-muted-foreground h-10 w-10" />}
            title="No dashboard defined for this role yet"
            description="This academy membership doesn't have a dedicated home screen in the current spec. Contact your academy admin if this looks wrong."
          />
        </div>
      );
  }
}
