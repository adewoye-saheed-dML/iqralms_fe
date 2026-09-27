import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StudentDetail } from '@/features/students/components/student-detail';

export const metadata = {
  title: 'Student Details | Quran Academy',
};

interface StudentDetailPageProps {
  params: Promise<{
    studentId: string;
  }>;
  searchParams?: Promise<{
    from?: string;
  }>;
}

export default async function StudentDetailPage({ params, searchParams }: StudentDetailPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const enrollmentId = parseInt(resolvedParams.studentId, 10);
  const from = resolvedSearchParams?.from;

  const backHref =
    from === 'dashboard-students' || from === 'dashboard'
      ? '/app/dashboard?tab=students'
      : '/app/students';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Details"
        description="Manage student enrollment status."
        backHref={backHref}
        backLabel="Back to Students"
      />

      <div className="mt-8">
        <StudentDetail enrollmentId={enrollmentId} />
      </div>
    </div>
  );
}
