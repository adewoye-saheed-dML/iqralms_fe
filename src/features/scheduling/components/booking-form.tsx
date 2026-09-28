'use client';

import { studentKeys, curriculumKeys, schedulingKeys } from '@/lib/api/query-keys';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { schedulingApi } from '../api/scheduling';
import { curriculumApi, Level } from '@/features/curriculum/api/curriculum';
import { teachersApi } from '@/features/teachers/api/teachers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ApiError } from '@/lib/api/errors';
import type { RouteRequest, Routed } from '../api/scheduling';
import { Bell, CheckCircle2, Calendar, Clock, Video, UserCheck, Info, CalendarCheck, Users } from 'lucide-react';

import { studentsApi } from '@/features/students/api/students';
import { useAuth } from '@/lib/auth/auth-provider';

export function BookingForm() {
  const { activeAcademy, activeRole } = useAcademy();
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [levelId, setLevelId] = React.useState<string>('');
  const [startTime, setStartTime] = React.useState<string>('');
  const [duration, setDuration] = React.useState<string>('30');
  const [preferredTeacher, setPreferredTeacher] = React.useState<string>('');
  const [studentId, setStudentId] = React.useState<string>('');

  const [error, setError] = React.useState<string | null>(null);
  const [routedResult, setRoutedResult] = React.useState<Routed | null>(null);
  const [waitlistSuccessInfo, setWaitlistSuccessInfo] = React.useState<{
    levelName?: string;
    requestedTime?: string;
    duration?: string;
    teacherName?: string;
  } | null>(null);

  const isParent = user?.role === 'parent';
  const isLead = user?.role === 'lead';
  const isSub = user?.role === 'sub';
  const isTeacher = isLead || isSub || activeRole === 'teacher';
  const isOwnerOrAdmin =
    activeRole === 'owner' ||
    activeRole === 'admin' ||
    (user?.role as string) === 'owner' ||
    (user?.role as string) === 'admin';
  const canSelectStudent = isParent;

  const { data: tracks, isLoading: isLoadingTracks } = useQuery({
    queryKey: curriculumKeys.tracks(activeAcademy?.id),
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No academy');
      return curriculumApi.getTracks(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id,
  });

  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: isParent
      ? studentKeys.mine(activeAcademy?.id)
      : ['students', 'academy', activeAcademy?.id],
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No academy');
      if (isParent) {
        return studentsApi.getMyStudents(activeAcademy.id);
      }
      return studentsApi.getAcademyStudents(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id && canSelectStudent,
  });

  const { data: teacherConfigs } = useQuery({
    queryKey: ['teachers', 'configurations', activeAcademy?.id],
    queryFn: async () => {
      if (!activeAcademy?.id) return [];
      try {
        return await teachersApi.getTeacherConfigurations(activeAcademy.id);
      } catch {
        return [];
      }
    },
    enabled: !!activeAcademy?.id,
  });

  const { data: myBookings = [] } = useQuery({
    queryKey: schedulingKeys.bookings(activeAcademy?.id),
    queryFn: async () => {
      if (!activeAcademy?.id) return [];
      try {
        const res = await schedulingApi.getMyBookings(activeAcademy.id);
        return res ?? [];
      } catch {
        return [];
      }
    },
    enabled: !!activeAcademy?.id && !isOwnerOrAdmin && !isTeacher,
  });

  const availableTeachers = React.useMemo(() => {
    const list: { id: number; name: string }[] = [];
    if (teacherConfigs && teacherConfigs.length > 0) {
      teacherConfigs.forEach((tc) => {
        const tId =
          (tc as unknown as { teacher?: number; user?: number }).teacher ||
          (tc as unknown as { user?: number }).user ||
          tc.id;
        const tName =
          (tc as unknown as { teacher_username?: string; teacher_name?: string }).teacher_username ||
          (tc as unknown as { teacher_name?: string }).teacher_name ||
          tc.username ||
          `Teacher #${tId}`;
        list.push({ id: Number(tId), name: tName });
      });
    }
    if (myBookings && myBookings.length > 0) {
      myBookings.forEach((b) => {
        if (b.teacher?.id && !list.some((t) => t.id === b.teacher!.id)) {
          const name = b.teacher.first_name
            ? `${b.teacher.first_name} ${b.teacher.last_name || ''}`.trim()
            : b.teacher.username || `Teacher #${b.teacher.id}`;
          list.push({ id: b.teacher.id, name });
        }
      });
    }
    return list;
  }, [teacherConfigs, myBookings]);

  const selectedTeacherId =
    preferredTeacher && preferredTeacher !== 'none' ? Number(preferredTeacher) : null;

  const { data: teacherAvailability, isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['scheduling', 'availability', activeAcademy?.id, selectedTeacherId],
    queryFn: () => {
      if (!activeAcademy?.id || !selectedTeacherId) return [];
      return schedulingApi.getAvailability(activeAcademy.id, selectedTeacherId);
    },
    enabled: !!activeAcademy?.id && !!selectedTeacherId,
  });

  const embeddedLevels = React.useMemo(() => {
    const list: { id: number; name: string; trackName: string }[] = [];
    tracks?.forEach((t) => {
      const embedded = (t as unknown as { levels?: Level[] }).levels;
      if (Array.isArray(embedded)) {
        embedded.forEach((l) => {
          list.push({ id: l.id, name: l.name, trackName: t.name });
        });
      }
    });
    return list;
  }, [tracks]);

  const routeMutation = useMutation({
    mutationFn: (data: RouteRequest) => {
      if (!activeAcademy?.id) throw new Error('No academy');
      return schedulingApi.routeBooking(activeAcademy.id, data);
    },
    onSuccess: (result) => {
      setError(null);
      setRoutedResult(result);
      setWaitlistSuccessInfo(null);
      queryClient.invalidateQueries({
        queryKey: schedulingKeys.bookings(activeAcademy?.id),
      });
      queryClient.invalidateQueries({
        queryKey: schedulingKeys.waitlist(activeAcademy?.id),
      });
    },
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        // Backend returns 409 when capacity is full and student is registered on the waitlist/schedule queue
        setError(null);
        const selectedLevel = embeddedLevels.find((l) => String(l.id) === levelId);
        const selectedTeacherObj = teacherConfigs?.find((tc) => {
          const tId = (tc as unknown as { teacher?: number }).teacher || (tc as unknown as { user?: number }).user || tc.id;
          return String(tId) === preferredTeacher;
        });
        const teacherName = selectedTeacherObj
          ? (selectedTeacherObj as unknown as { teacher_username?: string; teacher_name?: string }).teacher_username ||
            (selectedTeacherObj as unknown as { teacher_name?: string }).teacher_name ||
            selectedTeacherObj.username
          : 'Academy Teacher Pool';

        setWaitlistSuccessInfo({
          levelName: selectedLevel ? `${selectedLevel.trackName} — ${selectedLevel.name}` : 'Curriculum Lesson',
          requestedTime: startTime
            ? new Date(startTime).toLocaleString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : '',
          duration: duration || '30',
          teacherName,
        });
        queryClient.invalidateQueries({
          queryKey: schedulingKeys.waitlist(activeAcademy?.id),
        });
      } else if (err instanceof ApiError) {
        setError(err.message || 'Failed to book session.');
        setWaitlistSuccessInfo(null);
      } else {
        setError('An unexpected error occurred.');
        setWaitlistSuccessInfo(null);
      }
      setRoutedResult(null);
    },
  });

  React.useEffect(() => {
    if (isTeacher && teacherConfigs && teacherConfigs.length > 0 && !preferredTeacher) {
      const myConfig = teacherConfigs.find(
        (tc) =>
          tc.membership === user?.id ||
          (tc as unknown as { user?: number }).user === user?.id ||
          (tc as unknown as { teacher?: number }).teacher === user?.id ||
          (tc as unknown as { teacher_username?: string }).teacher_username === user?.username
      );
      if (myConfig) {
        const tId =
          (myConfig as unknown as { teacher?: number }).teacher ||
          (myConfig as unknown as { user?: number }).user ||
          myConfig.id;
        setPreferredTeacher(String(tId));
      }
    }
  }, [isTeacher, teacherConfigs, user, preferredTeacher]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelId || !startTime) return;
    if (canSelectStudent && !studentId) {
      setError('You must select a student.');
      return;
    }

    const localDate = new Date(startTime);

    const payload: RouteRequest = {
      level: parseInt(levelId, 10),
      requested_time_window: {
        start_time_utc: localDate.toISOString(),
        duration_minutes: duration ? parseInt(duration, 10) : 30,
      },
    };

    if (canSelectStudent && studentId) {
      payload.student = parseInt(studentId, 10);
    }

    if (preferredTeacher && preferredTeacher !== 'none') {
      payload.preferred_teacher = parseInt(preferredTeacher, 10);
    }

    routeMutation.mutate(payload);
  };

  if (isTeacher || isOwnerOrAdmin) {
    return (
      <Card className="max-w-xl mx-auto shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <Info className="h-5 w-5" />
            <CardTitle>Class Scheduling Overview</CardTitle>
          </div>
          <CardDescription>
            {isTeacher
              ? 'As a teacher, your classes are scheduled through student requests matching your declared availability, or assigned by academy leadership.'
              : 'As academy leadership, 1-on-1 sessions are requested by students and parents. You review student requests against teacher schedules and allocate confirmed sessions.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            {isTeacher
              ? 'To view your upcoming scheduled classes with your students or start a live Jitsi classroom, visit your Teaching Schedule. To review or declare your available working hours, visit My Availability.'
              : 'To review open student requests and allocate them to teachers, visit the Requests & Allocation tab on the scheduling dashboard. To open group classes, use the Cohorts tab.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {isTeacher && (
              <>
                <Button onClick={() => router.push('/app/scheduling')}>
                  <Calendar className="mr-2 h-4 w-4" /> Go to Teaching Schedule
                </Button>
                <Button variant="outline" onClick={() => router.push('/app/scheduling?tab=availability')}>
                  <CalendarCheck className="mr-2 h-4 w-4" /> View My Availability
                </Button>
                {isLead && (
                  <Button variant="outline" onClick={() => router.push('/app/scheduling?tab=waitlist')}>
                    <Users className="mr-2 h-4 w-4" /> Review Student Requests
                  </Button>
                )}
              </>
            )}
            {isOwnerOrAdmin && (
              <>
                <Button onClick={() => router.push('/app/scheduling?tab=waitlist')}>
                  <UserCheck className="mr-2 h-4 w-4" /> Open Allocation Workspace
                </Button>
                <Button variant="outline" onClick={() => router.push('/app/scheduling?tab=cohorts')}>
                  Manage Cohorts
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (routedResult) {
    return (
      <Card className="max-w-xl mx-auto shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
            <CardTitle>Session Scheduled Successfully</CardTitle>
          </div>
          <CardDescription>
            Your live class has been confirmed and scheduled in the academy calendar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="default" className="border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
            <AlertTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Booking Confirmed
            </AlertTitle>
            <AlertDescription className="mt-1 text-xs space-y-1">
              <p>
                {routedResult.routed
                  ? 'Your session was successfully matched and booked.'
                  : 'Booking request has been processed.'}
              </p>
              <div className="font-semibold text-emerald-900 dark:text-emerald-100">
                Placement Method: {routedResult.routed_reason}
              </div>
            </AlertDescription>
          </Alert>

          {/* Advance Notification Notice */}
          <div className="p-3 rounded-lg border bg-muted/30 text-xs text-muted-foreground flex items-start gap-2.5">
            <Bell className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Advance Notifications Active</span>
              <p className="mt-0.5">
                Automated email and in-app reminder notifications with secure video room links have been scheduled for both student and teacher prior to class start.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => router.push('/app/scheduling')}>
              View in Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (waitlistSuccessInfo) {
    return (
      <Card className="max-w-xl mx-auto shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            <CardTitle>Schedule Request Placed in Queue</CardTitle>
          </div>
          <CardDescription>
            Your requested session time has been recorded in the academy scheduling queue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-primary/30 bg-primary/5 text-foreground text-xs space-y-2">
            <AlertTitle className="font-semibold text-primary flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              Availability Request Recorded
            </AlertTitle>
            <AlertDescription className="space-y-1">
              <p>
                <strong>Requested Slot:</strong> {waitlistSuccessInfo.requestedTime} ({waitlistSuccessInfo.duration} minutes)
              </p>
              <p>
                <strong>Curriculum:</strong> {waitlistSuccessInfo.levelName}
              </p>
              <p>
                <strong>Teacher Preference:</strong> {waitlistSuccessInfo.teacherName}
              </p>
            </AlertDescription>
          </Alert>

          <div className="p-3 rounded-lg border bg-muted/30 text-xs text-muted-foreground flex items-start gap-2.5">
            <Bell className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">What happens next?</span>
              <p className="mt-0.5">
                The academy leadership reviews incoming student requests, compares with teacher availability, and allocates the class session. Both student and teacher will receive advance notifications once the session is confirmed.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setWaitlistSuccessInfo(null)}>
              Request Another Time
            </Button>
            <Button onClick={() => router.push('/app/scheduling')}>
              View My Requests & Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl mx-auto shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Schedule a Session</CardTitle>
          <Badge variant="outline" className="text-xs">
            SSoT Verified
          </Badge>
        </div>
        <CardDescription>
          Schedule a live 1:1 or group class with automated teacher routing and advance student notifications.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isOwnerOrAdmin && (
            <div className="p-3 rounded-lg border border-amber-300/60 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="font-semibold">Management Allocation Flow</span>
                <p className="mt-0.5 text-muted-foreground dark:text-amber-300/80">
                  Review student availability requests, compare with teacher schedules, and allocate confirmed sessions directly.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs bg-background text-foreground shrink-0"
                onClick={() => router.push('/app/scheduling')}
              >
                Go to Allocation Queue
              </Button>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTitle>Cannot Book Session</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Advance notification banner */}
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-primary flex items-start gap-2.5">
            <Bell className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Advance Notification Guarantee</span>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Students and teachers are notified ahead of class with embedded meeting room credentials, syllabus targets, and teaching hours tracking.
              </p>
            </div>
          </div>

          {canSelectStudent && (
            <div className="space-y-2">
              <Label>{isParent ? 'Student (Child)' : 'Student'}</Label>
              <Select
                value={studentId}
                onValueChange={setStudentId}
                disabled={isLoadingStudents || routeMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students?.map((s) => {
                    const studentUserId = s.user_id ?? (s as unknown as { user?: number }).user ?? s.id;
                    const studentDisplayName = s.first_name || s.username || `Student #${s.id}`;
                    return (
                      <SelectItem key={s.id} value={String(studentUserId)}>
                        {studentDisplayName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Curriculum Level</Label>
            <Select
              value={levelId}
              onValueChange={setLevelId}
              disabled={isLoadingTracks || routeMutation.isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a level" />
              </SelectTrigger>
              <SelectContent>
                {embeddedLevels.map((lvl) => (
                  <SelectItem key={lvl.id} value={String(lvl.id)}>
                    {lvl.trackName} — {lvl.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time (Local)</Label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                disabled={routeMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Select
                value={duration}
                onValueChange={setDuration}
                disabled={routeMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 mins</SelectItem>
                  <SelectItem value="45">45 mins</SelectItem>
                  <SelectItem value="60">60 mins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Preferred Teacher (Optional)</Label>
              <span className="text-[11px] text-muted-foreground">Auto-match if empty</span>
            </div>
            {availableTeachers && availableTeachers.length > 0 ? (
              <Select
                value={preferredTeacher}
                onValueChange={setPreferredTeacher}
                disabled={routeMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auto-assign best available teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Auto-assign best available teacher</SelectItem>
                  {availableTeachers.map((tc) => (
                    <SelectItem key={tc.id} value={String(tc.id)}>
                      {tc.name.toLowerCase().startsWith('ustadh') ? tc.name : `Ustadh ${tc.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select
                value={preferredTeacher === 'none' || !preferredTeacher ? 'none' : preferredTeacher}
                onValueChange={setPreferredTeacher}
                disabled={routeMutation.isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auto-assign best available teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Auto-assign best available teacher (Recommended)</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Teacher Declared Availability Display */}
          {selectedTeacherId && (
            <div className="rounded-lg border p-3 bg-muted/20 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Teacher's Declared Schedule Hours
                </span>
                {isLoadingAvailability && (
                  <span className="text-[11px] text-muted-foreground">Loading declared hours...</span>
                )}
              </div>
              {teacherAvailability && teacherAvailability.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {teacherAvailability.map((block) => (
                      <div
                        key={block.id}
                        className="flex items-center justify-between px-2.5 py-1.5 rounded bg-background border text-[11px]"
                      >
                        <span className="font-medium text-foreground">
                          {block.local?.weekday || block.weekday_display}
                        </span>
                        <span className="text-muted-foreground font-mono">
                          {block.local?.start_time
                            ? `${block.local.start_time.slice(0, 5)} - ${block.local.end_time?.slice(0, 5)}`
                            : `${block.start_time_utc.slice(0, 5)} - ${block.end_time_utc.slice(0, 5)} UTC`}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground pt-1">
                    Slots within declared hours confirm instantly if capacity allows. Slots outside these hours will be placed on the academy queue for management allocation.
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  No fixed recurring weekly hours declared by this teacher. Your requested time will be submitted to the academy scheduling queue for management allocation.
                </p>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={routeMutation.isPending}>
            {routeMutation.isPending ? 'Processing Booking...' : 'Schedule Class Session'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
