import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { AddStudentForm } from '@/features/students/components/add-student-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Add Student | Quran Academy',
};

export default function AddStudentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/app/students">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to students</span>
          </Link>
        </Button>
        <PageHeader
          title="Add Student"
          description="Attach an existing student user to this academy."
        />
      </div>

      <div className="mx-auto mt-8 max-w-2xl">
        <AddStudentForm />
      </div>
    </div>
  );
}
