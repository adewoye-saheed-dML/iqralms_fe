'use client';

import { PageHeader } from '@/components/ui/page-header';
import { TeacherDirectory } from '@/features/teachers/components/teacher-directory';
import { Button } from '@/components/ui/button';
import { UserPlus, Upload } from 'lucide-react';
import Link from 'next/link';

export default function TeachersPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Teachers"
        description="Manage academy teachers, invitations, and teaching configuration."
      />

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/app/invitations?role=teacher">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Teacher
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/app/imports?kind=teachers">
            <Upload className="mr-2 h-4 w-4" />
            Upload Teacher List
          </Link>
        </Button>
      </div>

      <TeacherDirectory />
    </div>
  );
}
