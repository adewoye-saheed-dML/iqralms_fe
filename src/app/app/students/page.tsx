import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StudentsPlaceholder } from '@/features/students/components/students-placeholder';

export const metadata = {
  title: 'Students | Quran Academy',
};

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Management"
        description="Manage students, enrollments, and parent links."
      />
      <StudentsPlaceholder />
    </div>
  );
}
