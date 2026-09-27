'use client';

import { studentKeys, curriculumKeys } from '@/lib/api/query-keys';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { studentsApi, StudentEnrollmentCreate, StudentList } from '../api/students';
import { membershipsApi, Membership } from '@/features/memberships/api/memberships';
import { curriculumApi, TrackBrief, Level, TeacherTrack } from '@/features/curriculum/api/curriculum';
import { ApiError } from '@/lib/api/errors';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, UserCheck, BookOpen, GraduationCap } from 'lucide-react';

export function AddStudentForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeAcademy } = useAcademy();
  const [userId, setUserId] = React.useState('');
  const [selectedTrackId, setSelectedTrackId] = React.useState<string>('');
  const [selectedLevelId, setSelectedLevelId] = React.useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>('unassigned');

  // Fetch student members in this academy
  const { data: members = [] } = useQuery<Membership[]>({
    queryKey: ['memberships', activeAcademy?.id],
    queryFn: async () => {
      if (!activeAcademy?.id) return [];
      const res = await membershipsApi.list(activeAcademy.id);
      return res ?? [];
    },
    enabled: !!activeAcademy?.id,
  });

  // Fetch already enrolled students
  const { data: enrolledStudents = [] } = useQuery<StudentList[]>({
    queryKey: studentKeys.all(activeAcademy?.id),
    queryFn: async () => {
      if (!activeAcademy?.id) return [];
      const res = await studentsApi.getAcademyStudents(activeAcademy.id);
      return res ?? [];
    },
    enabled: !!activeAcademy?.id,
  });

  // Fetch tracks
  const { data: tracks = [] } = useQuery<TrackBrief[]>({
    queryKey: curriculumKeys.tracks(activeAcademy?.id),
    queryFn: async () => {
      if (!activeAcademy?.id) return [];
      const res = await curriculumApi.getTracks(activeAcademy.id);
      return res ?? [];
    },
    enabled: !!activeAcademy?.id,
  });

  // Fetch levels
  const { data: levels = [] } = useQuery<Level[]>({
    queryKey: curriculumKeys.levels(activeAcademy?.id),
    queryFn: async () => {
      if (!activeAcademy?.id) return [];
      const res = await curriculumApi.getLevels(activeAcademy.id);
      return res ?? [];
    },
    enabled: !!activeAcademy?.id,
  });

  // Fetch teacher tracks
  const { data: teacherTracks = [] } = useQuery<TeacherTrack[]>({
    queryKey: curriculumKeys.teacherTracks(activeAcademy?.id),
    queryFn: async () => {
      if (!activeAcademy?.id) return [];
      const res = await curriculumApi.getAcademyTeacherTracks(activeAcademy.id);
      return res ?? [];
    },
    enabled: !!activeAcademy?.id,
  });

  // Unplaced students who have memberships but no enrollment row
  const unplacedStudents = React.useMemo(() => {
    const enrolledUserIds = new Set(enrolledStudents.map((s) => s.user_id));
    return members.filter((m) => m.role === 'student' && !enrolledUserIds.has(m.user));
  }, [members, enrolledStudents]);

  const availableLevels = React.useMemo(() => {
    if (!selectedTrackId) return [];
    return levels
      .filter((l) => String(l.track) === selectedTrackId)
      .sort((a, b) => a.order - b.order);
  }, [levels, selectedTrackId]);

  const eligibleTeachers = React.useMemo(() => {
    if (!selectedTrackId) return [];
    const activeTt = teacherTracks.filter(
      (tt) => tt.active && String(tt.track) === selectedTrackId
    );
    const teacherUserIds = new Set(activeTt.map((tt) => tt.user));
    return members
      .filter((m) => teacherUserIds.has(m.user))
      .map((m) => ({ user: m.user, username: m.username }));
  }, [teacherTracks, selectedTrackId, members]);

  const handleTrackChange = (newTrackId: string) => {
    setSelectedTrackId(newTrackId);
    const newLevels = levels
      .filter((l) => String(l.track) === newTrackId)
      .sort((a, b) => a.order - b.order);
    setSelectedLevelId(newLevels[0] ? String(newLevels[0].id) : '');
  };

  const mutation = useMutation({
    mutationFn: async (id: number) => {
      if (!activeAcademy) throw new Error('No academy context');
      const payload: StudentEnrollmentCreate = { user: id };
      if (selectedTrackId) payload.track_id = Number(selectedTrackId);
      if (selectedLevelId) payload.level_id = Number(selectedLevelId);
      if (selectedTeacherId && selectedTeacherId !== 'unassigned') {
        payload.teacher_id = Number(selectedTeacherId);
      }
      return studentsApi.addStudent(activeAcademy.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentKeys.all(activeAcademy?.id) });
      queryClient.invalidateQueries({ queryKey: ['memberships', activeAcademy?.id] });
      queryClient.invalidateQueries({ queryKey: curriculumKeys.all(activeAcademy?.id) });
      router.push('/app/students');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = parseInt(userId, 10);
    if (!isNaN(id)) {
      mutation.mutate(id);
    }
  };

  let errorMessage = '';
  if (mutation.isError) {
    if (mutation.error instanceof ApiError) {
      if (mutation.error.status === 400) {
        // We attempt to extract a specific error if possible
        const data = mutation.error.data as Record<string, string[]>;
        if (data?.non_field_errors) {
          errorMessage = data.non_field_errors.join(' ');
        } else if (data?.user) {
          errorMessage = `User error: ${data.user.join(' ')}`;
        } else {
          errorMessage =
            'Validation failed. The user might not exist, is not a student, or is already enrolled.';
        }
      } else if (mutation.error.status === 403) {
        errorMessage = 'You do not have permission to add students to this academy.';
      } else {
        errorMessage = mutation.error.message || 'An unexpected error occurred.';
      }
    } else {
      errorMessage = mutation.error.message;
    }
  }

  if (!activeAcademy) {
    return (
      <Alert>
        <AlertDescription>Please select an academy to add students.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Enroll Student</CardTitle>
          <CardDescription>
            Select an onboarded student member or enter their User ID to place and enroll them into
            a curriculum track.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3 bg-muted/30">
            <div className="text-xs text-muted-foreground">
              Prefer inviting a new student via email? You can send an academy invitation directly.
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push('/app/invitations?role=student')}
            >
              Invite by Email
            </Button>
          </div>

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Quick picker for onboarded students awaiting placement */}
          {unplacedStudents.length > 0 && (
            <div className="space-y-1.5 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-primary" />
                Select Onboarded Student Awaiting Placement ({unplacedStudents.length})
              </Label>
              <p className="text-[11px] text-muted-foreground">
                These students joined your academy through invitations and are waiting to be placed.
              </p>
              <Select
                value={userId}
                onValueChange={(val) => setUserId(val)}
                disabled={mutation.isPending}
              >
                <SelectTrigger className="text-xs bg-background">
                  <SelectValue placeholder="Choose an onboarded student..." />
                </SelectTrigger>
                <SelectContent>
                  {unplacedStudents.map((s) => (
                    <SelectItem key={s.id} value={String(s.user)}>
                      {s.username} (User #{s.user}) · {s.status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              type="number"
              required
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g. 123"
              disabled={mutation.isPending}
            />
          </div>

          {/* Track selection */}
          {tracks.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="trackId" className="flex items-center gap-1.5 text-xs font-medium">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                Curriculum Subject (Track) <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Select
                value={selectedTrackId}
                onValueChange={handleTrackChange}
                disabled={mutation.isPending}
              >
                <SelectTrigger id="trackId" className="text-xs">
                  <SelectValue placeholder="-- Select track --" />
                </SelectTrigger>
                <SelectContent>
                  {tracks.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name} ({t.slug})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Level selection */}
          {selectedTrackId && availableLevels.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="levelId" className="flex items-center gap-1.5 text-xs font-medium">
                <GraduationCap className="h-3.5 w-3.5 text-primary" />
                Progressive Level <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Select
                value={selectedLevelId}
                onValueChange={setSelectedLevelId}
                disabled={mutation.isPending}
              >
                <SelectTrigger id="levelId" className="text-xs">
                  <SelectValue placeholder="-- Select level --" />
                </SelectTrigger>
                <SelectContent>
                  {availableLevels.map((lvl) => (
                    <SelectItem key={lvl.id} value={String(lvl.id)}>
                      Level {lvl.order}: {lvl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Teacher selection */}
          {selectedTrackId && eligibleTeachers.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="teacherId" className="flex items-center gap-1.5 text-xs font-medium">
                <UserCheck className="h-3.5 w-3.5 text-primary" />
                Assigned Instructor <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Select
                value={selectedTeacherId}
                onValueChange={setSelectedTeacherId}
                disabled={mutation.isPending}
              >
                <SelectTrigger id="teacherId" className="text-xs">
                  <SelectValue placeholder="-- Select instructor --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">-- No Teacher Assigned --</SelectItem>
                  {eligibleTeachers.map((t) => (
                    <SelectItem key={t.user} value={String(t.user)}>
                      Ustadh {t.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/app/students')}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!userId || mutation.isPending}>
            {mutation.isPending ? 'Enrolling...' : 'Enroll Student'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
