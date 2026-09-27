'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { studentKeys, curriculumKeys } from '@/lib/api/query-keys';
import { studentsApi } from '../api/students';
import { membershipsApi, type Membership } from '@/features/memberships/api/memberships';
import {
  curriculumApi,
  type TrackBrief,
  type Level,
  type TeacherTrack,
  type PlacementResult,
} from '@/features/curriculum/api/curriculum';
import {
  AllocateStudentModal,
  type AllocatableStudent,
} from '@/features/curriculum/components/allocate-student-modal';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { LoadingState } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Users, Mail, FileUp, BookOpen } from 'lucide-react';

export function StudentDirectory() {
  const { activeAcademy, activeRole } = useAcademy();

  const isOwnerAdmin = activeRole === 'owner' || activeRole === 'admin';
  const canManage = isOwnerAdmin;

  const [selectedStudentToPlace, setSelectedStudentToPlace] =
    React.useState<AllocatableStudent | null>(null);

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

  const { data: members = [] } = useQuery<Membership[]>({
    queryKey: ['memberships', activeAcademy?.id],
    queryFn: async () => {
      try {
        if (!activeAcademy?.id) return [];
        const res = await membershipsApi.list(activeAcademy.id);
        return res ?? [];
      } catch {
        return [];
      }
    },
    enabled: !!activeAcademy && isOwnerAdmin,
  });

  const { data: tracks = [] } = useQuery<TrackBrief[]>({
    queryKey: curriculumKeys.tracks(activeAcademy?.id),
    queryFn: () => curriculumApi.getTracks(activeAcademy!.id),
    enabled: !!activeAcademy && isOwnerAdmin,
  });

  const { data: levels = [] } = useQuery<Level[]>({
    queryKey: curriculumKeys.levels(activeAcademy?.id),
    queryFn: () => curriculumApi.getLevels(activeAcademy!.id),
    enabled: !!activeAcademy && isOwnerAdmin,
  });

  const { data: teacherTracks = [] } = useQuery<TeacherTrack[]>({
    queryKey: curriculumKeys.teacherTracks(activeAcademy?.id),
    queryFn: () => curriculumApi.getAcademyTeacherTracks(activeAcademy!.id),
    enabled: !!activeAcademy && isOwnerAdmin,
  });

  const { data: pendingPlacements = [] } = useQuery<PlacementResult[]>({
    queryKey: ['placements', activeAcademy?.id, 'pending'],
    queryFn: async () => {
      try {
        if (!activeAcademy?.id) return [];
        return await curriculumApi.getPendingPlacements(activeAcademy.id);
      } catch {
        return [];
      }
    },
    enabled: !!activeAcademy && isOwnerAdmin,
  });

  const students = React.useMemo(() => {
    const list: Array<{
      id: number | string;
      userId: number;
      enrollmentId?: number;
      membershipId?: number;
      username: string;
      displayName: string;
      email?: string;
      status: string;
      hasEnrollment: boolean;
      appliedTrackName?: string | null;
      appliedLevelName?: string | null;
      appliedAsBeginner?: boolean;
    }> = [];

    const enrolledStudents = data || [];
    for (const s of enrolledStudents) {
      const displayName =
        s.first_name || s.last_name
          ? `${s.first_name || ''} ${s.last_name || ''}`.trim()
          : s.username || 'Unknown';
      const placement = pendingPlacements.find(
        (p) => p.student?.id === s.user_id || p.student?.username === s.username
      );
      list.push({
        id: s.id,
        userId: s.user_id,
        enrollmentId: s.id,
        username: s.username,
        displayName,
        email: s.email,
        status: s.enrollment_status || 'active',
        hasEnrollment: true,
        appliedTrackName: placement ? placement.track : null,
        appliedLevelName: placement?.recommended_level?.name || null,
        appliedAsBeginner: placement ? placement.skipped_as_beginner : false,
      });
    }

    if (isOwnerAdmin) {
      const studentMembers = members.filter((m) => m.role === 'student');
      for (const m of studentMembers) {
        const exists = list.some(
          (s) => s.username.toLowerCase() === m.username.toLowerCase()
        );
        if (!exists) {
          const placement = pendingPlacements.find(
            (p) => p.student?.id === m.user || p.student?.username === m.username
          );
          list.push({
            id: `member-${m.id}`,
            userId: m.user,
            membershipId: m.id,
            username: m.username,
            displayName: m.username,
            status: m.status === 'active' ? 'active' : m.status,
            hasEnrollment: false,
            appliedTrackName: placement ? placement.track : null,
            appliedLevelName: placement?.recommended_level?.name || null,
            appliedAsBeginner: placement ? placement.skipped_as_beginner : false,
          });
        }
      }
    }

    return list;
  }, [data, members, isOwnerAdmin, pendingPlacements]);

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
              <Link href="/app/invitations?role=student&from=students">
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
                  <Link href="/app/invitations?role=student&from=students">
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
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-muted/50 border-b transition-colors last:border-0"
                >
                  <td className="p-4">
                    <div className="font-medium">{student.displayName}</div>
                      {student.email && (
                        <div className="text-muted-foreground text-xs">{student.email}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                          {student.hasEnrollment ? (student.status || 'active') : 'Pending Placement'}
                        </Badge>
                        {student.appliedTrackName && (
                          <Badge variant="outline" className="text-primary border-primary/40 bg-primary/5 text-xs font-normal">
                            Applied: {student.appliedTrackName}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {student.hasEnrollment ? (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/app/students/${student.enrollmentId}?from=students`}>
                            {canManage ? 'Manage' : 'View Details'}
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStudentToPlace({
                              id: -(student.membershipId || student.userId || 0),
                              user_id: student.userId,
                              username: student.username,
                              first_name: '',
                              last_name: '',
                              email: student.email || '',
                              hasEnrollment: false,
                              track_id: null,
                              level_id: null,
                              teacher_id: null,
                              appliedTrackName: student.appliedTrackName,
                              appliedLevelName: student.appliedLevelName,
                              appliedAsBeginner: student.appliedAsBeginner,
                            });
                          }}
                        >
                          <BookOpen className="mr-1.5 h-3.5 w-3.5 text-primary" />
                          Enroll / Place
                        </Button>
                      )}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedStudentToPlace && (
        <AllocateStudentModal
          student={selectedStudentToPlace}
          tracks={tracks}
          levels={levels}
          teacherTracks={teacherTracks}
          members={members}
          onClose={() => setSelectedStudentToPlace(null)}
        />
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
