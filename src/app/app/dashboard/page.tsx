'use client';

import * as React from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { resolveRoleExperience } from '@/lib/navigation/config';
import { OwnerAdminDashboard } from '@/features/dashboard/owner-admin-dashboard';
import { TeacherDashboard } from '@/features/dashboard/teacher-dashboard';
import { ParentDashboard } from '@/features/dashboard/parent-dashboard';
import { StudentDashboard } from '@/features/dashboard/student-dashboard';

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
    case 'teacher':
      return <TeacherDashboard />;
    case 'parent':
      return <ParentDashboard />;
    case 'student':
    default:
      return <StudentDashboard />;
  }
}
