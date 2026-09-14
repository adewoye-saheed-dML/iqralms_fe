'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { studentsApi } from '../api/students';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Users, Plus } from 'lucide-react';

export function StudentDirectory() {
  const { activeAcademy } = useAcademy();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['academy', activeAcademy?.id, 'students'],
    queryFn: () => studentsApi.getStudents(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  if (!activeAcademy) {
    return <EmptyState title="No Academy Context" description="Please select an academy." />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <LoadingState />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load students"
        message={error instanceof Error ? error.message : 'An unknown error occurred.'}
        onRetry={refetch}
      />
    );
  }

  const students = data || [];

  if (students.length === 0) {
    return (
      <EmptyState
        icon={<Users className="text-muted-foreground h-10 w-10" />}
        title="No students enrolled yet."
        description="Add an existing student to this academy to get started."
        action={
          <Button asChild>
            <Link href="/app/students/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link href="/app/students/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="p-4 text-left font-medium">User ID</th>
              <th className="p-4 text-left font-medium">Username</th>
              <th className="p-4 text-left font-medium">Status</th>
              <th className="p-4 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student.id}
                className="hover:bg-muted/50 border-b transition-colors last:border-0"
              >
                <td className="p-4">{student.user}</td>
                <td className="p-4">{student.username || 'Unknown'}</td>
                <td className="p-4">
                  <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                    {student.status}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/app/students/${student.id}`}>Manage</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
