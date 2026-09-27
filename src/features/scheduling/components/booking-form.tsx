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
import { Bell, CheckCircle2, Calendar, Clock, Video, UserCheck } from 'lucide-react';

import { studentsApi } from '@/features/students/api/students';
import { useAuth } from '@/lib/auth/auth-provider';

export function BookingForm() {
  const { activeAcademy } = useAcademy();
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

  const isParent = user?.role === 'parent';

  const { data: tracks, isLoading: isLoadingTracks } = useQuery({
    queryKey: curriculumKeys.tracks(activeAcademy?.id),
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No academy');
      return curriculumApi.getTracks(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id,
  });

  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: studentKeys.mine(activeAcademy?.id),
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No academy');
      return studentsApi.getMyStudents(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id && isParent,
  });

  const { data: teacherConfigs } = useQuery({
    queryKey: ['teachers', 'configurations', activeAcademy?.id],
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No academy');
      return teachersApi.getTeacherConfigurations(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id,
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
      queryClient.invalidateQueries({
        queryKey: schedulingKeys.bookings(activeAcademy?.id),
      });
      queryClient.invalidateQueries({
        queryKey: schedulingKeys.waitlist(activeAcademy?.id),
      });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError(
            'No capacity available for the requested time. You may have been waitlisted if you requested a specific teacher.'
          );
        } else {
          setError(err.message || 'Failed to book session.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
      setRoutedResult(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!levelId || !startTime) return;
    if (isParent && !studentId) {
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

    if (isParent && studentId) {
      payload.student = parseInt(studentId, 10);
    }

    if (preferredTeacher) {
      payload.preferred_teacher = parseInt(preferredTeacher, 10);
    }

    routeMutation.mutate(payload);
  };

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

          {isParent && (
            <div className="space-y-2">
              <Label>Student</Label>
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
                    const studentUserId = s.user_id ?? (s as unknown as { user?: number }).user;
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
            {teacherConfigs && teacherConfigs.length > 0 ? (
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
                  {teacherConfigs.map((tc) => {
                    const tId = (tc as unknown as { teacher?: number; user?: number }).teacher || (tc as unknown as { user?: number }).user || tc.id;
                    const tName = (tc as unknown as { teacher_username?: string; teacher_name?: string }).teacher_username || (tc as unknown as { teacher_name?: string }).teacher_name || `Teacher #${tId}`;
                    return (
                      <SelectItem key={tc.id} value={String(tId)}>
                        {tName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type="number"
                placeholder="e.g. 5"
                value={preferredTeacher}
                onChange={(e) => setPreferredTeacher(e.target.value)}
                disabled={routeMutation.isPending}
              />
            )}
          </div>

          <Button type="submit" className="w-full" disabled={routeMutation.isPending}>
            {routeMutation.isPending ? 'Processing Booking...' : 'Schedule Class Session'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
