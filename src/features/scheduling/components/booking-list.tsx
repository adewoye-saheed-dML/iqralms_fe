import { schedulingKeys } from '@/lib/api/query-keys';
'use client';

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
import { Calendar as CalendarIcon, Clock, User, X } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BookingListProps {
  type: 'mine' | 'teaching';
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
      return type === 'mine'
        ? schedulingApi.getMyBookings(activeAcademy.id)
        : schedulingApi.getTeachingBookings(activeAcademy.id);
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
    }
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
        message={error.message || "An unknown error occurred"} 
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

  return (
    <div className="space-y-4">
      {cancelError && (
        <Alert variant="destructive">
          <AlertTitle>Cancellation Failed</AlertTitle>
          <AlertDescription>{cancelError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{booking.level?.name || 'Session'}</CardTitle>
                <Badge variant={booking.status === 'cancelled' ? 'destructive' : booking.status === 'completed' ? 'secondary' : 'default'}>
                  {booking.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center text-muted-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>
                  {new Date(booking.start_time_utc).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>
                  {new Date(booking.start_time_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {booking.duration_minutes ? ` (${booking.duration_minutes} min)` : ''}
                </span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <User className="mr-2 h-4 w-4" />
                <span>
                  {type === 'mine' 
                    ? `Teacher: ${booking.teacher?.first_name || booking.teacher?.username || 'Unassigned'}`
                    : `Student: ${booking.student?.first_name || booking.student?.username || 'Unknown'}`}
                </span>
              </div>

              {booking.video_join_url && booking.status !== 'cancelled' && (
                <div className="pt-2">
                  <a href={booking.video_join_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    Join Session
                  </a>
                </div>
              )}

              {booking.status === 'scheduled' && (
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-destructive hover:bg-destructive/10"
                    onClick={() => cancelMutation.mutate(booking.id)}
                    disabled={cancelMutation.isPending}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel Booking
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
