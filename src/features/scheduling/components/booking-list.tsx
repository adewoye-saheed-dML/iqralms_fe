'use client';

import { schedulingKeys } from '@/lib/api/query-keys';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulingApi } from '../api/scheduling';
import { useAcademy } from '@/lib/academy/academy-provider';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Calendar as CalendarIcon, Clock, User, X, Bell, Video, CheckCircle2 } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BookingListProps {
  type: 'mine' | 'teaching' | 'academy';
}

export function BookingList({ type }: BookingListProps) {
  const { activeAcademy } = useAcademy();
  const queryClient = useQueryClient();
  const [cancelError, setCancelError] = React.useState<string | null>(null);

  const queryKey = schedulingKeys.bookingsByType(activeAcademy?.id, type);

  const { data: bookings, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      if (type === 'mine') {
        return schedulingApi.getMyBookings(activeAcademy.id);
      }
      if (type === 'teaching') {
        return schedulingApi.getTeachingBookings(activeAcademy.id);
      }
      return schedulingApi.getAcademyBookings(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id,
  });

  const cancelMutation = useMutation({
    mutationFn: (bookingId: number) => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return schedulingApi.cancelBooking(activeAcademy.id, bookingId);
    },
    onSuccess: () => {
      setCancelError(null);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setCancelError(err.message || 'Failed to cancel booking. It may be too late or already cancelled.');
      } else {
        setCancelError('A network error occurred.');
      }
    },
  });

  if (isLoading) return <LoadingState />;
  if (error) {
    if (error instanceof ApiError && error.status === 403) {
      return (
        <ErrorState
          title="Access Denied"
          message="You don't have permission to view these bookings."
        />
      );
    }
    return (
      <ErrorState
        title="Failed to load bookings"
        message={error.message || 'An unknown error occurred'}
        onRetry={() => refetch()}
      />
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <EmptyState
        title="No bookings found"
        description="You don't have any upcoming or past bookings."
        icon={<CalendarIcon className="h-10 w-10 text-muted-foreground" />}
      />
    );
  }

  const formatCountdown = (startUtc: string, durationMinutes: number = 30) => {
    const startMs = new Date(startUtc).getTime();
    const nowMs = Date.now();
    const diffMinutes = Math.round((startMs - nowMs) / 60000);

    if (diffMinutes <= 0 && diffMinutes >= -durationMinutes) {
      return { label: 'Live Now', variant: 'destructive' as const, isLive: true };
    }
    if (diffMinutes > 0 && diffMinutes <= 30) {
      return { label: `Starts in ${diffMinutes}m`, variant: 'default' as const, isLive: true };
    }
    if (diffMinutes > 30 && diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      const mins = diffMinutes % 60;
      return { label: `In ${hours}h ${mins > 0 ? `${mins}m` : ''}`, variant: 'outline' as const, isLive: false };
    }
    if (diffMinutes >= 1440) {
      const days = Math.round(diffMinutes / 1440);
      return { label: `In ${days} day${days > 1 ? 's' : ''}`, variant: 'outline' as const, isLive: false };
    }
    return { label: 'Ended', variant: 'secondary' as const, isLive: false };
  };

  return (
    <div className="space-y-4">
      {cancelError && (
        <Alert variant="destructive">
          <AlertTitle>Cancellation Failed</AlertTitle>
          <AlertDescription>{cancelError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bookings.map((booking) => {
          const countdown = formatCountdown(booking.start_time_utc, booking.duration_minutes);
          return (
            <Card key={booking.id} className="flex flex-col justify-between shadow-2xs hover:shadow-sm transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      {booking.level?.name ||
                        (booking as unknown as { level_details?: { name?: string } }).level_details?.name ||
                        'Session'}
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Session #{booking.id} • {booking.video_provider || 'Jitsi'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge
                      variant={
                        booking.status === 'cancelled'
                          ? 'destructive'
                          : booking.status === 'completed'
                          ? 'secondary'
                          : 'default'
                      }
                    >
                      {booking.status}
                    </Badge>
                    {booking.status === 'scheduled' && (
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        countdown.isLive ? 'bg-amber-100 text-amber-900 animate-pulse' : 'text-muted-foreground'
                      }`}>
                        {countdown.label}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2.5 text-sm flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground text-xs">
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary" />
                    <span>
                      {new Date(booking.start_time_utc).toLocaleDateString(undefined, {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center text-muted-foreground text-xs">
                    <Clock className="mr-2 h-3.5 w-3.5 text-primary" />
                    <span>
                      {new Date(booking.start_time_utc).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {booking.duration_minutes ? ` (${booking.duration_minutes} min)` : ''}
                    </span>
                  </div>

                  <div className="flex items-center text-muted-foreground text-xs">
                    <User className="mr-2 h-3.5 w-3.5 text-primary" />
                    <span className="truncate">
                      {type === 'mine'
                        ? `Teacher: ${
                            booking.teacher?.first_name ||
                            (booking as unknown as { teacher_details?: { user?: { first_name?: string } } })
                              .teacher_details?.user?.first_name ||
                            booking.teacher?.username ||
                            'Unassigned'
                          }`
                        : type === 'teaching'
                        ? `Student: ${
                            booking.student?.first_name ||
                            (booking as unknown as { student_details?: { user?: { first_name?: string } } })
                              .student_details?.user?.first_name ||
                            booking.student?.username ||
                            'Unknown'
                          }`
                        : `Teacher: ${
                            booking.teacher?.first_name ||
                            (booking as unknown as { teacher_details?: { user?: { first_name?: string } } })
                              .teacher_details?.user?.first_name ||
                            booking.teacher?.username ||
                            'Unassigned'
                          } • Student: ${
                            booking.student?.first_name ||
                            (booking as unknown as { student_details?: { user?: { first_name?: string } } })
                              .student_details?.user?.first_name ||
                            booking.student?.username ||
                            'Unknown'
                          }`}
                    </span>
                  </div>

                  {/* Advance Notification Notice Badge */}
                  {booking.status === 'scheduled' && (
                    <div className="bg-primary/5 rounded px-2 py-1 text-[11px] text-primary flex items-center gap-1.5">
                      <Bell className="h-3 w-3 shrink-0" />
                      <span>Advance reminder dispatched</span>
                    </div>
                  )}

                  {booking.status === 'completed' && (
                    <div className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 rounded px-2 py-1 text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span>Verified & recorded for payout</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t space-y-2">
                  {booking.status !== 'cancelled' && (
                    <Button asChild size="sm" className="w-full">
                      <Link href={`/app/scheduling/${booking.id}`}>
                        <Video className="mr-1.5 h-3.5 w-3.5" />
                        Enter Class Session
                      </Link>
                    </Button>
                  )}

                  {booking.status === 'scheduled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-destructive hover:bg-destructive/10 text-xs h-7"
                      onClick={() => cancelMutation.mutate(booking.id)}
                      disabled={cancelMutation.isPending}
                    >
                      <X className="mr-1.5 h-3.5 w-3.5" />
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
