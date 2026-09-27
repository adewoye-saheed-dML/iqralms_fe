'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { studentsApi } from '@/features/students/api/students';
import { curriculumApi, TrackBrief, Level, TeacherTrack } from '../api/curriculum';
import { Membership } from '@/features/memberships/api/memberships';
import { curriculumKeys, studentKeys } from '@/lib/api/query-keys';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GraduationCap,
  UserCheck,
  AlertCircle,
  Users,
  CheckCircle2,
} from 'lucide-react';

export interface AllocatableStudent {
  id: number | string;
  user_id: number;
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  is_minor?: boolean;
  date_of_birth?: string;
  enrollment_status?: string;
  track_id?: number | null;
  level_id?: number | null;
  teacher_id?: number | null;
  teacher_name?: string | null;
  hasEnrollment?: boolean;
  appliedTrackName?: string | null;
  appliedLevelName?: string | null;
  appliedAsBeginner?: boolean;
}

export interface AllocateStudentModalProps {
  student: AllocatableStudent;
  allStudents?: AllocatableStudent[];
  tracks: TrackBrief[];
  levels: Level[];
  teacherTracks: TeacherTrack[];
  members: Membership[];
  onClose: () => void;
  onOpenTeacherAssignments?: () => void;
}

export function AllocateStudentModal({
  student,
  allStudents,
  tracks,
  levels,
  teacherTracks,
  members,
  onClose,
  onOpenTeacherAssignments,
}: AllocateStudentModalProps) {
  const queryClient = useQueryClient();
  const { activeAcademy } = useAcademy();

  const [currentStudent, setCurrentStudent] = React.useState<AllocatableStudent>(student);

  // Determine initial track: prioritize existing track_id, then track matching appliedTrackName, then first track
  const initialTrackId = React.useMemo(() => {
    if (student.track_id) return String(student.track_id);
    if (student.appliedTrackName) {
      const match = tracks.find(
        (t) =>
          t.name.toLowerCase() === student.appliedTrackName?.toLowerCase() ||
          t.slug.toLowerCase() === student.appliedTrackName?.toLowerCase()
      );
      if (match) return String(match.id);
    }
    return tracks[0] ? String(tracks[0].id) : '';
  }, [student, tracks]);

  const [selectedTrackId, setSelectedTrackId] = React.useState<string>(initialTrackId);

  const availableLevels = React.useMemo(() => {
    if (!selectedTrackId) return [];
    return levels
      .filter((l) => String(l.track) === selectedTrackId)
      .sort((a, b) => a.order - b.order);
  }, [levels, selectedTrackId]);

  // Initial level
  const initialLevelId = React.useMemo(() => {
    if (student.level_id) return String(student.level_id);
    if (student.appliedLevelName) {
      const match = availableLevels.find(
        (lvl) => lvl.name.toLowerCase() === student.appliedLevelName?.toLowerCase()
      );
      if (match) return String(match.id);
    }
    if (student.appliedAsBeginner && availableLevels.length > 0) {
      const firstLevel = availableLevels.find((l) => l.order === 1) || availableLevels[0];
      return String(firstLevel.id);
    }
    return '';
  }, [student, availableLevels]);

  const [selectedLevelId, setSelectedLevelId] = React.useState<string>(initialLevelId);

  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>(
    student.teacher_id ? String(student.teacher_id) : 'unassigned'
  );

  const handleStudentSwitch = (newStudentId: string) => {
    const s = allStudents?.find((st) => String(st.id) === newStudentId);
    if (!s) return;
    setCurrentStudent(s);

    let tId = s.track_id ? String(s.track_id) : '';
    if (!tId && s.appliedTrackName) {
      const match = tracks.find(
        (t) =>
          t.name.toLowerCase() === s.appliedTrackName?.toLowerCase() ||
          t.slug.toLowerCase() === s.appliedTrackName?.toLowerCase()
      );
      if (match) tId = String(match.id);
    }
    if (!tId && tracks[0]) tId = String(tracks[0].id);

    setSelectedTrackId(tId);
    setSelectedLevelId(s.level_id ? String(s.level_id) : '');
    setSelectedTeacherId(s.teacher_id ? String(s.teacher_id) : 'unassigned');
  };

  const effectiveLevelId = React.useMemo(() => {
    if (availableLevels.length === 0) return '';
    const matches = availableLevels.some((l) => String(l.id) === selectedLevelId);
    return matches ? selectedLevelId : String(availableLevels[0].id);
  }, [availableLevels, selectedLevelId]);

  const handleTrackChange = (newTrackId: string) => {
    setSelectedTrackId(newTrackId);
    const newLevels = levels
      .filter((l) => String(l.track) === newTrackId)
      .sort((a, b) => a.order - b.order);
    setSelectedLevelId(newLevels[0] ? String(newLevels[0].id) : '');

    // Reset teacher selection if current teacher is not eligible for new track
    const newActiveTt = teacherTracks.filter(
      (tt) => tt.active && String(tt.track) === newTrackId
    );
    const newTeacherUserIds = newActiveTt.map((tt) => tt.user);
    if (selectedTeacherId !== 'unassigned' && !newTeacherUserIds.includes(Number(selectedTeacherId))) {
      setSelectedTeacherId('unassigned');
    }
  };

  // Teachers teaching the selected track
  const eligibleTeachers = React.useMemo(() => {
    if (!selectedTrackId) return [];
    const activeTt = teacherTracks.filter(
      (tt) => tt.active && String(tt.track) === selectedTrackId
    );
    const teacherUserIds = new Set(activeTt.map((tt) => tt.user));

    const fromTracks = activeTt.map((tt) => {
      const mem = members.find((m) => m.user === tt.user);
      return {
        id: tt.id,
        user: tt.user,
        username: mem?.username || tt.username,
      };
    });

    const fromMembers = members
      .filter((m) => teacherUserIds.has(m.user) && !fromTracks.some((t) => t.user === m.user))
      .map((m) => ({
        id: m.id,
        user: m.user,
        username: m.username,
      }));

    return [...fromTracks, ...fromMembers];
  }, [teacherTracks, selectedTrackId, members]);

  // Other academy teachers not yet authorized for this track
  const otherTeachers = React.useMemo(() => {
    const eligibleUserIds = new Set(eligibleTeachers.map((t) => t.user));
    return members
      .filter(
        (m) =>
          (m.role === 'teacher' || m.role === 'staff' || m.role === 'admin' || m.role === 'owner') &&
          !eligibleUserIds.has(m.user)
      )
      .map((m) => ({
        id: m.id,
        user: m.user,
        username: m.username,
      }));
  }, [members, eligibleTeachers]);

  // Quick authorize mutation for when user selects an unauthorized teacher
  const [authorizeError, setAuthorizeError] = React.useState<string>('');
  const authorizeMutation = useMutation({
    mutationFn: async () => {
      setAuthorizeError('');
      if (!activeAcademy || !selectedTrackId || selectedTeacherId === 'unassigned') return;
      return curriculumApi.assignTeacherTrack(activeAcademy.id, {
        user: Number(selectedTeacherId),
        track: Number(selectedTrackId),
        active: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: curriculumKeys.teacherTracks(activeAcademy?.id),
      });
    },
    onError: (err: unknown) => {
      setAuthorizeError(err instanceof Error ? err.message : 'Failed to authorize teacher for this track.');
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!activeAcademy) throw new Error('No active academy context');

      const track_id = selectedTrackId ? Number(selectedTrackId) : null;
      const level_id = effectiveLevelId ? Number(effectiveLevelId) : null;
      const teacher_id =
        selectedTeacherId && selectedTeacherId !== 'unassigned'
          ? Number(selectedTeacherId)
          : null;

      // Check if student already has a valid enrollment record
      const hasRealEnrollment =
        currentStudent.hasEnrollment !== false &&
        typeof currentStudent.id === 'number' &&
        currentStudent.id > 0;

      if (!hasRealEnrollment) {
        // Create new enrollment attaching the student to this academy with track/level/teacher
        return studentsApi.addStudent(activeAcademy.id, {
          user: currentStudent.user_id,
          track_id,
          level_id,
          teacher_id,
        });
      } else {
        // Update existing enrollment
        return studentsApi.updateStudentStatus(activeAcademy.id, Number(currentStudent.id), {
          track_id,
          level_id,
          teacher_id,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: studentKeys.all(activeAcademy?.id),
      });
      queryClient.invalidateQueries({
        queryKey: ['memberships', activeAcademy?.id],
      });
      queryClient.invalidateQueries({
        queryKey: curriculumKeys.all(activeAcademy?.id),
      });
      onClose();
    },
  });

  const isStudentAllocated = !!currentStudent.track_id && !!currentStudent.level_id;
  const studentFullName = currentStudent.first_name || currentStudent.last_name
    ? `${currentStudent.first_name || ''} ${currentStudent.last_name || ''}`.trim()
    : currentStudent.username;

  const isSelectedTeacherUnauthorized =
    selectedTeacherId !== 'unassigned' &&
    selectedTrackId &&
    !eligibleTeachers.some((t) => String(t.user) === selectedTeacherId);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            {!isStudentAllocated
              ? `Allocate Level for ${studentFullName}`
              : `Student-Teacher Mapping: ${studentFullName}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {mutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {mutation.error instanceof Error
                  ? mutation.error.message
                  : 'Failed to update student allocation.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Applied Track / Placement Notification Banner */}
          {(currentStudent.appliedTrackName || currentStudent.appliedAsBeginner) && (
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Student Applied Curriculum Placement
              </div>
              <p className="text-muted-foreground">
                Applied Subject:{' '}
                <strong className="text-foreground">{currentStudent.appliedTrackName || 'Track'}</strong>
                {currentStudent.appliedAsBeginner ? ' (Declared Complete Beginner)' : ''}
                {currentStudent.appliedLevelName && (
                  <>
                    {' '}· Recommended Level:{' '}
                    <strong className="text-foreground">{currentStudent.appliedLevelName}</strong>
                  </>
                )}
              </p>
            </div>
          )}

          {allStudents && allStudents.length > 1 && (
            <div className="space-y-1.5">
              <Label htmlFor="alloc-student-select">Select Student</Label>
              <Select
                value={String(currentStudent.id)}
                onValueChange={handleStudentSwitch}
                disabled={mutation.isPending}
              >
                <SelectTrigger id="alloc-student-select">
                  <SelectValue placeholder="Choose student..." />
                </SelectTrigger>
                <SelectContent>
                  {allStudents.map((s) => {
                    const name = `${s.first_name || ''} ${s.last_name || ''}`.trim() || s.username;
                    const hasTeacher = !!s.teacher_id;
                    const hasLevel = !!s.level_id;
                    return (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {name} {!hasLevel ? '· Needs Level' : !hasTeacher ? '· Needs Teacher' : '· Mapped'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="alloc-track">Curriculum Subject (Track)</Label>
            <Select
              value={selectedTrackId}
              onValueChange={handleTrackChange}
              disabled={mutation.isPending}
            >
              <SelectTrigger id="alloc-track">
                <SelectValue placeholder="Select curriculum subject..." />
              </SelectTrigger>
              <SelectContent>
                {tracks.map((track) => (
                  <SelectItem key={track.id} value={String(track.id)}>
                    {track.name} ({track.slug})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alloc-level">Progressive Level</Label>
            {availableLevels.length > 0 ? (
              <Select
                value={effectiveLevelId}
                onValueChange={setSelectedLevelId}
                disabled={mutation.isPending}
              >
                <SelectTrigger id="alloc-level">
                  <SelectValue placeholder="Choose level..." />
                </SelectTrigger>
                <SelectContent>
                  {availableLevels.map((lvl) => (
                    <SelectItem key={lvl.id} value={String(lvl.id)}>
                      Level {lvl.order}: {lvl.name} {lvl.min_age ? `(Age ${lvl.min_age}+)` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground bg-muted/20">
                No progressive levels defined yet for this track. You can still confirm mapping and assign a teacher (levels can be added later under Tracks &amp; Levels).
              </div>
            )}
          </div>

          {/* Assigned Teacher (Student-Teacher Mapping) */}
          <div className="space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="alloc-teacher" className="font-semibold text-foreground flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-primary" />
                Assigned Teacher (Instructor)
              </Label>
              <Badge variant="outline" className="text-[10px]">
                {selectedTeacherId && selectedTeacherId !== 'unassigned' ? 'Teacher Assigned' : 'Unassigned'}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Assign an instructor to this student for their curriculum track. Only instructors authorized for this subject can be assigned.
            </p>
            <Select
              value={selectedTeacherId}
              onValueChange={setSelectedTeacherId}
              disabled={mutation.isPending}
            >
              <SelectTrigger id="alloc-teacher" aria-label="Select instructor">
                <SelectValue placeholder="Select instructor..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">-- No Teacher Assigned (Unassigned) --</SelectItem>
                {eligibleTeachers.map((t) => (
                  <SelectItem key={`el-${t.user}`} value={String(t.user)}>
                    Ustadh {t.username}
                  </SelectItem>
                ))}
                {otherTeachers.length > 0 && selectedTrackId && (
                  <>
                    {otherTeachers.map((t) => (
                      <SelectItem key={`oth-${t.user}`} value={String(t.user)}>
                        Ustadh {t.username} (Requires Track Authorization)
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>

            {isSelectedTeacherUnauthorized && selectedTrackId && (
              <div className="flex items-center justify-between rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-700 dark:text-amber-400">
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
                  <span>Teacher is not yet authorized for this track.</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-6 text-[11px] px-2 border-amber-600/40 hover:bg-amber-500/20"
                  onClick={() => authorizeMutation.mutate()}
                  disabled={authorizeMutation.isPending}
                >
                  {authorizeMutation.isPending ? 'Authorizing...' : 'Authorize Now'}
                </Button>
              </div>
            )}
            {authorizeError && (
              <p className="text-[11px] text-destructive">{authorizeError}</p>
            )}

            {eligibleTeachers.length === 0 ? (
              <div className="flex flex-col gap-1 pt-1">
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  No instructor is currently authorized to teach this track. Use &quot;Teacher Subject Assignments&quot; to authorize teachers first.
                </p>
                {onOpenTeacherAssignments && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs justify-start text-primary"
                    onClick={onOpenTeacherAssignments}
                  >
                    Authorize a teacher for this subject &rarr;
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Only instructors authorized to teach this subject are eligible.
              </p>
            )}
          </div>

          {/* Qualified Teachers for this subject */}
          <div className="rounded-md bg-muted/40 p-3 text-xs space-y-1.5 border border-border">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              Qualified Instructors for this Subject ({eligibleTeachers.length})
            </div>
            {eligibleTeachers.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {eligibleTeachers.map((t) => (
                  <Badge key={t.user} variant="secondary" className="text-[11px]">
                    Ustadh {t.username}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No teacher has been assigned to teach this track yet.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Allocating...' : 'Confirm Allocation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
