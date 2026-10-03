'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import * as AuthModule from '@/lib/auth/auth-provider';
import { studentKeys, curriculumKeys } from '@/lib/api/query-keys';
import { studentsApi, StudentList } from '@/features/students/api/students';
import { curriculumApi, TeacherTrack } from '@/features/curriculum/api/curriculum';
import { resolveRoleExperience } from '@/lib/navigation/config';

export interface TeacherAccessControl {
  isOwnerAdmin: boolean;
  isTeacher: boolean;
  attachedStudents: StudentList[];
  teachingTracks: TeacherTrack[];
  attachedStudentUserIds: Set<number>;
  attachedStudentEnrollmentIds: Set<number>;
  teachingTrackIds: Set<number>;
  isLoading: boolean;
  canTeacherAccessStudent: (student: {
    user_id?: number | null;
    id?: number | null;
    track_id?: number | null;
  }) => boolean;
  canTeacherAccessAssignment: (assignment: {
    created_by?: { id?: number | null } | null;
    track?: number | null;
    assigned_student?: number | null;
  }) => boolean;
  canTeacherAccessSubmission: (
    submission: {
      student?: { id?: number | null } | null;
      assignment?: number | null;
    },
    assignment?: {
      track?: number | null;
      created_by?: { id?: number | null } | null;
    } | null
  ) => boolean;
}

export function useTeacherAccessControl(): TeacherAccessControl {
  const { activeAcademy, activeRole } = useAcademy();
  const academyId = activeAcademy?.id;

  let user: any = null;
  try {
    if (typeof (AuthModule as any).useOptionalAuth === 'function') {
      user = (AuthModule as any).useOptionalAuth()?.user;
    } else if (typeof (AuthModule as any).useAuth === 'function') {
      user = (AuthModule as any).useAuth()?.user;
    }
  } catch {
    user = null;
  }

  const roleExp = resolveRoleExperience({ activeRole, userRole: user?.role });
  const isOwnerAdmin =
    roleExp === 'owner_admin' || activeRole === 'owner' || activeRole === 'admin';
  const isTeacher =
    !isOwnerAdmin &&
    (roleExp === 'teacher' ||
      roleExp === 'lead_teacher' ||
      activeRole === 'teacher' ||
      user?.role === 'lead' ||
      user?.role === 'sub');

  // Fetch students attached to this teacher in this academy
  const { data: attachedStudents = [], isLoading: isLoadingStudents } = useQuery<StudentList[]>({
    queryKey: studentKeys.mine(academyId),
    queryFn: () => (academyId ? studentsApi.getMyStudents(academyId) : []),
    enabled: !!academyId && isTeacher,
  });

  // Fetch tracks (subjects) this teacher is authorized to teach
  const { data: teachingTracks = [], isLoading: isLoadingTracks } = useQuery<TeacherTrack[]>({
    queryKey: curriculumKeys.teachingTracks(academyId),
    queryFn: () => (academyId ? curriculumApi.getMyTeachingTracks(academyId) : []),
    enabled: !!academyId && isTeacher,
  });

  const attachedStudentUserIds = React.useMemo(() => {
    return new Set(attachedStudents.map((s) => s.user_id).filter((id): id is number => typeof id === 'number'));
  }, [attachedStudents]);

  const attachedStudentEnrollmentIds = React.useMemo(() => {
    return new Set(attachedStudents.map((s) => s.id).filter((id): id is number => typeof id === 'number'));
  }, [attachedStudents]);

  const teachingTrackIds = React.useMemo(() => {
    return new Set(
      teachingTracks
        .filter((tt) => tt.active)
        .map((tt) => tt.track)
        .filter((id): id is number => typeof id === 'number')
    );
  }, [teachingTracks]);

  const canTeacherAccessStudent = React.useCallback(
    (student: { user_id?: number | null; id?: number | null; track_id?: number | null }) => {
      if (isOwnerAdmin) return true;
      if (!isTeacher) return false;

      // 1. Check attachment: student must be attached to this teacher
      const isAttached =
        (student.user_id != null && attachedStudentUserIds.has(student.user_id)) ||
        (student.id != null && attachedStudentEnrollmentIds.has(student.id));

      if (!isAttached) return false;

      // 2. Check subject offering: teacher must offer the student's registered subject
      if (student.track_id != null) {
        return teachingTrackIds.has(student.track_id);
      }

      // If student is attached but track is pending allocation, allow attached teacher
      return true;
    },
    [isOwnerAdmin, isTeacher, attachedStudentUserIds, attachedStudentEnrollmentIds, teachingTrackIds]
  );

  const canTeacherAccessAssignment = React.useCallback(
    (assignment: {
      created_by?: { id?: number | null } | null;
      track?: number | null;
      assigned_student?: number | null;
    }) => {
      if (isOwnerAdmin) return true;
      if (!isTeacher) return false;

      // Author of the assignment always has access
      if (assignment.created_by?.id != null && assignment.created_by.id === user?.id) {
        return true;
      }

      // If assignment belongs to a specific track/subject, teacher must teach that subject
      if (assignment.track != null && !teachingTrackIds.has(assignment.track)) {
        return false;
      }

      // If assignment is targeted to a specific student, that student must be attached to this teacher
      if (
        assignment.assigned_student != null &&
        !attachedStudentUserIds.has(assignment.assigned_student) &&
        !attachedStudentEnrollmentIds.has(assignment.assigned_student)
      ) {
        return false;
      }

      // If track is offered by this teacher and student is not exclusively someone else's
      if (assignment.track != null && teachingTrackIds.has(assignment.track)) {
        return true;
      }

      return false;
    },
    [isOwnerAdmin, isTeacher, user?.id, teachingTrackIds, attachedStudentUserIds, attachedStudentEnrollmentIds]
  );

  const canTeacherAccessSubmission = React.useCallback(
    (
      submission: {
        student?: { id?: number | null } | null;
        assignment?: number | null;
      },
      assignment?: {
        track?: number | null;
        created_by?: { id?: number | null } | null;
      } | null
    ) => {
      if (isOwnerAdmin) return true;
      if (!isTeacher) return false;

      const studentId = submission.student?.id;
      if (studentId == null) return false;

      // 1. Teacher must be attached to the student
      const isAttached = attachedStudentUserIds.has(studentId);
      if (!isAttached) return false;

      // 2. Teacher must offer the subject of the assignment
      if (assignment) {
        if (assignment.created_by?.id != null && assignment.created_by.id === user?.id) {
          return true;
        }
        if (assignment.track != null) {
          return teachingTrackIds.has(assignment.track);
        }
      }

      // Look up student's track in attached students
      const attachedStudent = attachedStudents.find((s) => s.user_id === studentId);
      if (attachedStudent?.track_id != null) {
        return teachingTrackIds.has(attachedStudent.track_id);
      }

      // If attached and no conflicting subject found, permit
      return true;
    },
    [isOwnerAdmin, isTeacher, attachedStudentUserIds, user?.id, teachingTrackIds, attachedStudents]
  );

  return {
    isOwnerAdmin,
    isTeacher,
    attachedStudents,
    teachingTracks,
    attachedStudentUserIds,
    attachedStudentEnrollmentIds,
    teachingTrackIds,
    isLoading: isLoadingStudents || isLoadingTracks,
    canTeacherAccessStudent,
    canTeacherAccessAssignment,
    canTeacherAccessSubmission,
  };
}
