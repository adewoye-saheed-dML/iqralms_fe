'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { studentKeys } from '@/lib/api/query-keys';
import { studentsApi } from '../api/students';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Users, Plus, Mail, FileUp } from 'lucide-react';

export function StudentDirectory() {
  const { activeAcademy, activeRole } = useAcademy();

  const isOwnerAdmin = activeRole === 'owner' || activeRole === 'admin';
  const canManage = isOwnerAdmin;

  const queryKey = isOwnerAdmin
    ? studentKeys.list(activeAcademy?.id)
    : studentKeys.mine(activeAcademy?.id);

  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: () =>
      isOwnerAdmin
        ? studentsApi.getStudents(activeAcademy!.id)
        : studentsApi.getMyStudents(activeAcademy!.id),
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
      />
    );
  }

  const students = data || [];

  return (
    <div className="space-y-8">
      {canManage && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Student Roster</h2>
            <p className="text-xs text-muted-foreground">
              Students currently enrolled in {activeAcademy.name}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href="/app/invitations?role=student">
                <Mail className="mr-2 h-4 w-4" />
                Invite Students
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/app/imports?kind=students">
                <FileUp className="mr-2 h-4 w-4" />
                Import CSV / Excel
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/app/students/add">
                <Plus className="mr-2 h-4 w-4" />
                Enroll Existing User
              </Link>
            </Button>
          </div>
        </div>
      )}

      {students.length === 0 ? (
        <EmptyState
          icon={<Users className="text-muted-foreground h-10 w-10" />}
          title={isOwnerAdmin ? 'No students enrolled yet.' : 'No assigned students.'}
          description={
            isOwnerAdmin
              ? 'Send email invitations or import a spreadsheet of students to get started.'
              : 'You currently have no students assigned to you in this academy.'
          }
          action={
            canManage ? (
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild>
                  <Link href="/app/invitations?role=student">
                    <Mail className="mr-2 h-4 w-4" />
                    Invite Students
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/app/imports?kind=students">
                    <FileUp className="mr-2 h-4 w-4" />
                    Import CSV / Excel
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/app/students/add">
                    <Plus className="mr-2 h-4 w-4" />
                    Enroll Existing User
                  </Link>
                </Button>
              </div>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="p-4 text-left font-medium">Student</th>
                <th className="p-4 text-left font-medium">Status</th>
                <th className="p-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const displayName =
                  student.first_name || student.last_name
                    ? `${student.first_name || ''} ${student.last_name || ''}`.trim()
                    : student.username || 'Unknown';
                return (
                  <tr
                    key={student.id}
                    className="hover:bg-muted/50 border-b transition-colors last:border-0"
                  >
                    <td className="p-4">
                      <div className="font-medium">{displayName}</div>
                      {student.email && (
                        <div className="text-muted-foreground text-xs">{student.email}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant={student.enrollment_status === 'active' ? 'default' : 'secondary'}>
                        {student.enrollment_status || 'active'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/app/students/${student.id}`}>
                          {canManage ? 'Manage' : 'View Details'}
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {canManage && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Need to manage pending student invitations?</span>
            <p className="text-xs">Track delivery status, resend, or revoke student invitations in the Invitations hub.</p>
          </div>
          <Button variant="ghost" size="sm" asChild className="self-start sm:self-auto shrink-0">
            <Link href="/app/invitations?role=student">
              View Student Invitations &rarr;
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
