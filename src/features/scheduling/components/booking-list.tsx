'use client';

import { schedulingKeys } from '@/lib/api/query-keys';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulingApi, type Booking } from '../api/scheduling';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth } from '@/lib/auth/auth-provider';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  X,
  Bell,
  Video,
  CheckCircle2,
  Search,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { ApiError } from '@/lib/api/errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BookingListProps {
  type: 'mine' | 'teaching' | 'academy';
}

export function BookingList({ type }: BookingListProps) {
  const { activeAcademy, activeRole } = useAcademy();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [cancelError, setCancelError] = React.useState<string | null>(null);

  // Default to compact table layout for academy schedules to cleanly scale to 100s of sessions
  const [viewMode, setViewMode] = React.useState<'table' | 'grid'>(
    type === 'academy' ? 'table' : 'grid'
  );
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [dateFilter, setDateFilter] = React.useState<'all' | 'upcoming' | 'today' | 'past'>('all');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<number>(type === 'academy' ? 20 : 12);

  const isParent = activeRole === 'parent' || user?.role === 'parent';

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

  const getStudentLabel = (booking: Booking) => {
    const b = booking as unknown as { student_details?: { user?: { first_name?: string } } };
    return (
      booking.student?.first_name ||
      b.student_details?.user?.first_name ||
      booking.student?.username ||
      'Student'
    );
  };

  const getTeacherLabel = (booking: Booking) => {
    const b = booking as unknown as { teacher_details?: { user?: { first_name?: string } } };
    return (
      booking.teacher?.first_name ||
      b.teacher_details?.user?.first_name ||
      booking.teacher?.username ||
      'Unassigned'
    );
  };

  const getLevelLabel = (booking: Booking) => {
    const b = booking as unknown as { level_details?: { name?: string } };
    return booking.level?.name || b.level_details?.name || 'Session';
  };

  // Filter and pagination pipeline
  const filteredBookings = React.useMemo(() => {
    if (!bookings) return [];

    return bookings.filter((booking) => {
      // 1. Status Filter
      if (statusFilter !== 'all' && booking.status !== statusFilter) {
        return false;
      }

      // 2. Date Filter
      if (dateFilter !== 'all') {
        const bookingDate = new Date(booking.start_time_utc);
        const now = new Date();
        const isToday =
          bookingDate.getDate() === now.getDate() &&
          bookingDate.getMonth() === now.getMonth() &&
          bookingDate.getFullYear() === now.getFullYear();

        if (dateFilter === 'today' && !isToday) return false;
        if (dateFilter === 'upcoming' && bookingDate.getTime() < now.getTime()) return false;
        if (dateFilter === 'past' && bookingDate.getTime() >= now.getTime()) return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const student = getStudentLabel(booking).toLowerCase();
        const teacher = getTeacherLabel(booking).toLowerCase();
        const level = getLevelLabel(booking).toLowerCase();
        const idStr = `#${booking.id}`;

        const matches =
          student.includes(query) ||
          teacher.includes(query) ||
          level.includes(query) ||
          idStr.includes(query);

        if (!matches) return false;
      }

      return true;
    });
  }, [bookings, statusFilter, dateFilter, searchQuery]);

  // Reset pagination on filter change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter, pageSize]);

  const totalPages = Math.ceil(filteredBookings.length / pageSize) || 1;
  const paginatedBookings = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredBookings.slice(startIndex, startIndex + pageSize);
  }, [filteredBookings, currentPage, pageSize]);

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
        description={
          isParent
            ? "You don't have any scheduled sessions for your children yet."
            : "You don't have any upcoming or past bookings."
        }
        icon={<CalendarIcon className="h-10 w-10 text-muted-foreground" />}
      />
    );
  }

  const counts = {
    all: bookings.length,
    scheduled: bookings.filter((b) => b.status === 'scheduled').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  return (
    <div className="space-y-4">
      {cancelError && (
        <Alert variant="destructive">
          <AlertTitle>Cancellation Failed</AlertTitle>
          <AlertDescription>{cancelError}</AlertDescription>
        </Alert>
      )}

      {/* Control bar: Search, Filters, Stats & View Mode Toggle */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Quick-Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <Button
              type="button"
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => setStatusFilter('all')}
            >
              All ({counts.all})
            </Button>
            <Button
              type="button"
              variant={statusFilter === 'scheduled' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => setStatusFilter('scheduled')}
            >
              Scheduled ({counts.scheduled})
            </Button>
            <Button
              type="button"
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => setStatusFilter('completed')}
            >
              Completed ({counts.completed})
            </Button>
            <Button
              type="button"
              variant={statusFilter === 'cancelled' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => setStatusFilter('cancelled')}
            >
              Cancelled ({counts.cancelled})
            </Button>
          </div>

          {/* View mode toggle (Table vs Card Grid) */}
          <div className="flex items-center gap-1 border rounded-md p-0.5 bg-muted/40">
            <Button
              type="button"
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2.5 text-xs gap-1.5"
              onClick={() => setViewMode('table')}
              title="Table View (Ideal for high volume)"
            >
              <List className="h-3.5 w-3.5" /> Table
            </Button>
            <Button
              type="button"
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2.5 text-xs gap-1.5"
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Cards
            </Button>
          </div>
        </div>

        {/* Search & Timeline Filter Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student, teacher, level, or ID (#101)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={dateFilter}
              onValueChange={(val) => setDateFilter(val as 'all' | 'upcoming' | 'today' | 'past')}
            >
              <SelectTrigger className="h-9 text-xs w-[130px]">
                <SelectValue placeholder="Date Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today Only</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>

            {type === 'academy' && (
              <Select
                value={String(pageSize)}
                onValueChange={(val) => setPageSize(Number(val))}
              >
                <SelectTrigger className="h-9 text-xs w-[110px]">
                  <SelectValue placeholder="Page Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="20">20 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                  <SelectItem value="100">100 / page</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-muted-foreground text-xs space-y-2">
          <Filter className="h-6 w-6 mx-auto text-muted-foreground/60" />
          <p className="font-medium text-sm text-foreground">No matching sessions found</p>
          <p>Try clearing your search query or adjusting your filters.</p>
          <Button
            variant="outline"
            size="sm"
            className="text-xs mt-2"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setDateFilter('all');
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : viewMode === 'table' ? (
        /* ================= HIGH-DENSITY SCALABLE TABLE VIEW ================= */
        <div className="rounded-md border bg-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="p-3 text-left">Session &amp; Level</th>
                  <th className="p-3 text-left">Date &amp; Time</th>
                  <th className="p-3 text-left">Teacher</th>
                  <th className="p-3 text-left">Student</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedBookings.map((booking) => {
                  const countdown = formatCountdown(booking.start_time_utc, booking.duration_minutes);
                  const studentName = getStudentLabel(booking);
                  const teacherName = getTeacherLabel(booking);
                  const levelName = getLevelLabel(booking);

                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      {/* Session / Level */}
                      <td className="p-3 align-middle">
                        <div className="font-medium text-foreground">{levelName}</div>
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono">#{booking.id}</span>
                          <span>•</span>
                          <span>{booking.video_provider || 'Jitsi'}</span>
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="p-3 align-middle whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                          <CalendarIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>
                            {new Date(booking.start_time_utc).toLocaleDateString(undefined, {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-primary shrink-0" />
                            <span>
                              {new Date(booking.start_time_utc).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              {booking.duration_minutes ? ` (${booking.duration_minutes}m)` : ''}
                            </span>
                          </div>
                          {booking.status === 'scheduled' && (
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-medium ${
                                countdown.isLive
                                  ? 'bg-amber-100 text-amber-900 animate-pulse'
                                  : 'text-muted-foreground bg-muted'
                              }`}
                            >
                              {countdown.label}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Teacher */}
                      <td className="p-3 align-middle text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <User className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span>Teacher: {teacherName}</span>
                        </div>
                        {booking.teacher?.username && booking.teacher?.username !== teacherName && (
                          <div className="text-[11px] text-muted-foreground pl-4.5">
                            @{booking.teacher.username}
                          </div>
                        )}
                      </td>

                      {/* Student */}
                      <td className="p-3 align-middle text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <User className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span>
                            {type === 'mine' && isParent ? `Child: ${studentName}` : `Student: ${studentName}`}
                          </span>
                        </div>
                        {booking.student?.username && booking.student?.username !== studentName && (
                          <div className="text-[11px] text-muted-foreground pl-4.5">
                            @{booking.student.username}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3 align-middle whitespace-nowrap">
                        <Badge
                          variant={
                            booking.status === 'cancelled'
                              ? 'destructive'
                              : booking.status === 'completed'
                              ? 'secondary'
                              : 'default'
                          }
                          className="text-[11px] capitalize"
                        >
                          {booking.status}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="p-3 align-middle text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {booking.status === 'scheduled' ? (
                            <>
                              <Button asChild size="sm" className="h-8 text-xs">
                                <Link href={`/app/scheduling/${booking.id}`}>
                                  <Video className="mr-1.5 h-3.5 w-3.5" />
                                  Enter Class Session
                                </Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-destructive hover:bg-destructive/10 text-xs px-2"
                                onClick={() => cancelMutation.mutate(booking.id)}
                                disabled={cancelMutation.isPending}
                                title="Cancel booking"
                              >
                                <X className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:ml-1">Cancel</span>
                              </Button>
                            </>
                          ) : booking.status === 'completed' ? (
                            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              Concluded
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Cancelled</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-muted/20 border-t text-xs text-muted-foreground">
            <div>
              Showing{' '}
              <span className="font-medium text-foreground">
                {(currentPage - 1) * pageSize + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium text-foreground">
                {Math.min(currentPage * pageSize, filteredBookings.length)}
              </span>{' '}
              of <span className="font-medium text-foreground">{filteredBookings.length}</span> sessions
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
              </Button>
              <span className="px-2 font-medium text-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* ================= CARD GRID VIEW ================= */
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedBookings.map((booking) => {
              const countdown = formatCountdown(booking.start_time_utc, booking.duration_minutes);
              const studentName = getStudentLabel(booking);
              const teacherName = getTeacherLabel(booking);
              const levelName = getLevelLabel(booking);

              return (
                <Card key={booking.id} className="flex flex-col justify-between shadow-2xs hover:shadow-sm transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-lg">{levelName}</CardTitle>
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
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                              countdown.isLive
                                ? 'bg-amber-100 text-amber-900 animate-pulse'
                                : 'text-muted-foreground'
                            }`}
                          >
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
                            ? isParent
                              ? `Child: ${studentName} • Teacher: ${teacherName}`
                              : `Teacher: ${teacherName}`
                            : type === 'teaching'
                            ? `Student: ${studentName}`
                            : `Teacher: ${teacherName} • Student: ${studentName}`}
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
                      {booking.status === 'scheduled' ? (
                        <>
                          <Button asChild size="sm" className="w-full">
                            <Link href={`/app/scheduling/${booking.id}`}>
                              <Video className="mr-1.5 h-3.5 w-3.5" />
                              Enter Class Session
                            </Link>
                          </Button>

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
                        </>
                      ) : booking.status === 'completed' ? (
                        <div className="text-center py-1.5 text-xs text-muted-foreground font-medium flex items-center justify-center gap-1.5 bg-muted/40 rounded">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          Class Concluded
                        </div>
                      ) : (
                        <div className="text-center py-1.5 text-xs text-muted-foreground italic bg-muted/20 rounded">
                          Booking Cancelled
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Grid Pagination Footer if multiple pages */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 p-3 bg-muted/20 rounded-md border text-xs text-muted-foreground">
              <div>
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filteredBookings.length)} of{' '}
                {filteredBookings.length} sessions
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                </Button>
                <span className="px-2 font-medium text-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs px-2"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
