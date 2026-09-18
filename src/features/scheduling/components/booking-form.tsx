'use client';
import { studentKeys, curriculumKeys, schedulingKeys } from '@/lib/api/query-keys';
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { schedulingApi } from '../api/scheduling';
import { curriculumApi } from '@/features/curriculum/api/curriculum';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ApiError } from '@/lib/api/errors';
import type { RouteRequest, Routed } from '../api/scheduling';

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
    queryKey: studentKeys.all(activeAcademy?.id),
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No academy');
      return studentsApi.getStudents(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id && isParent,
  });

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
          setError('No capacity available for the requested time. You may have been waitlisted if you requested a specific teacher.');
        } else {
          setError(err.message || 'Failed to book session.');
        }
      } else {
        setError('An unexpected error occurred.');
      }
      setRoutedResult(null);
    }
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
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Booking Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="default" className="border-green-500 bg-green-50 text-green-700">
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              {routedResult.routed 
                ? 'Your session was successfully booked.' 
                : 'Request processed.'}
              <div className="mt-2 text-sm font-semibold">
                Reason: {routedResult.routed_reason}
              </div>
            </AlertDescription>
          </Alert>

          <Button onClick={() => router.push('/app/scheduling')}>
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Schedule a Session</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Cannot Book Session</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isParent && (
            <div className="space-y-2">
              <Label>Student</Label>
              <Select value={studentId} onValueChange={setStudentId} disabled={isLoadingStudents || routeMutation.isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students?.map(s => (
                    <SelectItem key={s.id} value={String(s.user)}>
                      {s.first_name || s.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label>Curriculum Level</Label>
            <Select value={levelId} onValueChange={setLevelId} disabled={isLoadingTracks || routeMutation.isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select a level" />
              </SelectTrigger>
              <SelectContent>
                {tracks?.map(track => (
                  <React.Fragment key={track.id}>
                    {track.levels.map(level => (
                      <SelectItem key={level.id} value={String(level.id)}>
                        {track.name} — {level.name}
                      </SelectItem>
                    ))}
                  </React.Fragment>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label>Duration (Minutes)</Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="15"
                step="15"
                disabled={routeMutation.isPending}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred Teacher ID (Optional)</Label>
            <Input
              type="number"
              placeholder="e.g. 5"
              value={preferredTeacher}
              onChange={(e) => setPreferredTeacher(e.target.value)}
              disabled={routeMutation.isPending}
            />
            <p className="text-xs text-muted-foreground">
              If specified, you will be placed on their waitlist if they are not available.
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/app/scheduling')}>
              Cancel
            </Button>
            <Button type="submit" disabled={!levelId || !startTime || (isParent && !studentId) || routeMutation.isPending}>
              {routeMutation.isPending ? 'Requesting...' : 'Request Booking'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
