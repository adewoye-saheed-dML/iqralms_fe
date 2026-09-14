import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StudentDetail } from '@/features/students/components/student-detail';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Student Details | Quran Academy',
};

interface StudentDetailPageProps {
  params: {
    studentId: string;
  };
}

export default function StudentDetailPage({ params }: StudentDetailPageProps) {
  const enrollmentId = parseInt(params.studentId, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/app/students">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to students</span>
          </Link>
        </Button>
        <PageHeader title="Student Details" description="Manage student enrollment status." />
      </div>

      <div className="mt-8">
        <StudentDetail enrollmentId={enrollmentId} />
      </div>
    </div>
  );
}
