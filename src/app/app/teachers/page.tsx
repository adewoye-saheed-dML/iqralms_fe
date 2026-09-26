'use client';

import { PageHeader } from '@/components/ui/page-header';
import { TeacherDirectory } from '@/features/teachers/components/teacher-directory';

export default function TeachersPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Teachers"
        description="Manage academy teachers, invitations, and teaching configuration."
      />

      <TeacherDirectory />
    </div>
  );
}
