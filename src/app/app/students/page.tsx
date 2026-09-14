import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StudentDirectory } from '@/features/students/components/student-directory';

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
      <StudentDirectory />
    </div>
  );
}
