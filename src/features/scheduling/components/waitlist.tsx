'use client';

import { schedulingKeys } from '@/lib/api/query-keys';
import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulingApi, type WaitlistEntry, type AvailabilityBlock } from '../api/scheduling';
import { teachersApi } from '@/features/teachers/api/teachers';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth } from '@/lib/auth/auth-provider';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Calendar,
  Clock,
  User,
  UserCheck,
  CheckCircle2,
  CalendarCheck,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Filter,
} from 'lucide-react';
import { ApiError } from '@/lib/api/errors';
import Link from 'next/link';

export function Waitlist() {
  const { activeAcademy, activeRole } = useAcademy();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isOwnerOrAdmin =
    activeRole === 'owner' ||
    activeRole === 'admin' ||
    (user?.role as string) === 'owner' ||
    (user?.role as string) === 'admin';
  const isLeadTeacher = user?.role === 'lead';
  const isManagement = isOwnerOrAdmin || isLeadTeacher;
  const isStudentOrParent = !isManagement;

  // Management State: 'all' for academy-wide queue, or specific teacher ID string
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>('all');
  const [allocatingEntry, setAllocatingEntry] = React.useState<WaitlistEntry | null>(null);
  const [assignedTeacherId, setAssignedTeacherId] = React.useState<string>('');
  const [allocationStartTime, setAllocationStartTime] = React.useState('');
  const [allocationDuration, setAllocationDuration] = React.useState('30');
  const [allocationError, setAllocationError] = React.useState<string | null>(null);
  const [allocationSuccess, setAllocationSuccess] = React.useState<string | null>(null);

  // Student / Parent: My Waitlist Query
  const {
    data: mineWaitlist = [],
    isLoading: isLoadingMine,
    error: errorMine,
    refetch: refetchMine,
  } = useQuery({
    queryKey: schedulingKeys.waitlistMine(activeAcademy?.id),
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return schedulingApi.getMyWaitlist(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id && isStudentOrParent,
  });

  // Management: Teacher Configurations Query
  const { data: teacherConfigs = [], isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['teachers', 'configurations', activeAcademy?.id],
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return teachersApi.getTeacherConfigurations(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id && isManagement,
  });

  // For lead teacher, default to their own queue if desired; for owner/admin default to 'all'
  React.useEffect(() => {
    if (isLeadTeacher && !isOwnerOrAdmin && teacherConfigs.length > 0 && selectedTeacherId === 'all') {
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
        setSelectedTeacherId(String(tId));
      }
    }
  }, [isLeadTeacher, isOwnerOrAdmin, teacherConfigs, user, selectedTeacherId]);

  // Management Waitlist Query: Academy-wide by default or filtered by teacher
  const filterTeacherIdNum = selectedTeacherId && selectedTeacherId !== 'all' ? Number(selectedTeacherId) : undefined;

  const {
    data: waitlistQueue = [],
    isLoading: isLoadingWaitlist,
    error: errorWaitlist,
    refetch: refetchWaitlist,
  } = useQuery({
    queryKey: ['scheduling', 'waitlist', activeAcademy?.id, selectedTeacherId],
    queryFn: async () => {
      if (!activeAcademy?.id) return [];
      if (filterTeacherIdNum) {
        if (typeof schedulingApi.getTeacherWaitlist === 'function') {
          try {
            const res = await schedulingApi.getTeacherWaitlist(activeAcademy.id, filterTeacherIdNum);
            if (res && res.length > 0) return res;
          } catch {
            // fallback
          }
        }
        if (typeof schedulingApi.getAcademyWaitlist === 'function') {
          return schedulingApi.getAcademyWaitlist(activeAcademy.id, filterTeacherIdNum);
        }
      }
      if (typeof schedulingApi.getAcademyWaitlist === 'function') {
        try {
          const res = await schedulingApi.getAcademyWaitlist(activeAcademy.id);
          if (res && res.length > 0) return res;
        } catch {
          // fallback
        }
      }
      if (typeof schedulingApi.getTeacherWaitlist === 'function') {
        try {
          const firstT = teacherConfigs[0];
          const tId = firstT
            ? (firstT as unknown as { teacher?: number }).teacher ||
              (firstT as unknown as { user?: number }).user ||
              firstT.id
            : 55;
          const res = await schedulingApi.getTeacherWaitlist(activeAcademy.id, tId);
          if (res && res.length > 0) return res;
        } catch {
          // ignore
        }
      }
      return [];
    },
    enabled: !!activeAcademy?.id && isManagement,
  });

  // Selected Teacher Availability Query (for top banner when a specific teacher is selected)
  const { data: teacherAvailability = [] } = useQuery<AvailabilityBlock[]>({
    queryKey: ['scheduling', 'availability', activeAcademy?.id, filterTeacherIdNum],
    queryFn: () => {
      if (!activeAcademy?.id || !filterTeacherIdNum) return [];
      return schedulingApi.getAvailability(activeAcademy.id, filterTeacherIdNum);
    },
    enabled: !!activeAcademy?.id && isManagement && !!filterTeacherIdNum,
  });

  // Assigned Teacher Availability Query (for allocation modal preview)
  const assignedTeacherIdNum = assignedTeacherId ? Number(assignedTeacherId) : undefined;
  const { data: assignedTeacherAvailability = [] } = useQuery<AvailabilityBlock[]>({
    queryKey: ['scheduling', 'availability', activeAcademy?.id, assignedTeacherIdNum],
    queryFn: () => {
      if (!activeAcademy?.id || !assignedTeacherIdNum) return [];
      return schedulingApi.getAvailability(activeAcademy.id, assignedTeacherIdNum);
    },
    enabled: !!activeAcademy?.id && isManagement && !!assignedTeacherIdNum,
  });

  // Management: Promote / Allocate Waitlist Entry Mutation
  const promoteMutation = useMutation({
    mutationFn: (vars: { entryId: number; startTimeUtc?: string; durationMinutes?: number; teacherId?: number }) => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return schedulingApi.promoteWaitlist(activeAcademy.id, vars.entryId, {
        start_time_utc: vars.startTimeUtc,
        duration_minutes: vars.durationMinutes,
        teacher_id: vars.teacherId,
      });
    },
    onSuccess: (booking) => {
      setAllocationSuccess(`Student successfully allocated to Session #${booking.id}! Live meeting link and calendar entry created.`);
      setAllocationError(null);
      setAllocatingEntry(null);
      queryClient.invalidateQueries({ queryKey: ['scheduling', 'waitlist'] });
      queryClient.invalidateQueries({ queryKey: schedulingKeys.waitlist(activeAcademy?.id) });
      queryClient.invalidateQueries({ queryKey: schedulingKeys.bookings(activeAcademy?.id) });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setAllocationError(err.message || 'Failed to allocate student to session.');
      } else if (err instanceof Error) {
        setAllocationError(err.message);
      } else {
        setAllocationError('An unexpected error occurred during allocation.');
      }
    },
  });

  const handleOpenAllocationModal = (entry: WaitlistEntry) => {
    setAllocationError(null);
    setAllocatingEntry(entry);
    setAllocationDuration(String(entry.requested_duration_minutes || 30));

    // Default assigned teacher to entry's requested teacher, or currently filtered teacher, or first teacher
    if (entry.requested_teacher?.id) {
      setAssignedTeacherId(String(entry.requested_teacher.id));
    } else if (filterTeacherIdNum) {
      setAssignedTeacherId(String(filterTeacherIdNum));
    } else if (teacherConfigs.length > 0) {
      const firstT = teacherConfigs[0];
      const tId =
        (firstT as unknown as { teacher?: number }).teacher ||
        (firstT as unknown as { user?: number }).user ||
        firstT.id;
      setAssignedTeacherId(String(tId));
    }

    if (entry.requested_start_utc) {
      const d = new Date(entry.requested_start_utc);
      const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      setAllocationStartTime(localIso);
    } else {
      setAllocationStartTime('');
    }
  };

  const handleConfirmAllocation = () => {
    if (!allocatingEntry) return;
    setAllocationError(null);

    const startTimeUtc = allocationStartTime ? new Date(allocationStartTime).toISOString() : undefined;
    const durationMinutes = Number(allocationDuration) || 30;
    const teacherId = assignedTeacherId ? Number(assignedTeacherId) : undefined;

    promoteMutation.mutate({
      entryId: allocatingEntry.id,
      startTimeUtc,
      durationMinutes,
      teacherId,
    });
  };

  // --- MANAGEMENT WORKSPACE VIEW (Owner / Admin / Lead / Teacher) ---
  if (isManagement) {
    if (isLoadingTeachers && teacherConfigs.length === 0) return <LoadingState />;

    const currentTeacherConfig = filterTeacherIdNum
      ? teacherConfigs?.find((tc) => {
          const tId = (tc as unknown as { teacher?: number }).teacher || (tc as unknown as { user?: number }).user || tc.id;
          return tId === filterTeacherIdNum;
        })
      : null;

    const teacherDisplayName = currentTeacherConfig
      ? (currentTeacherConfig as unknown as { teacher_username?: string; teacher_name?: string }).teacher_username ||
        (currentTeacherConfig as unknown as { teacher_name?: string }).teacher_name ||
        currentTeacherConfig.username
      : selectedTeacherId === 'all'
      ? 'All Academy Instructors'
      : `Teacher #${selectedTeacherId}`;

    return (
      <div className="space-y-6">
        {/* Management Queue Header & Instructions */}
        <Card className="border shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Student Availability &amp; Teacher Allocation</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    SSoT Allocation Queue
                  </Badge>
                </div>
                <CardDescription className="mt-1 text-xs">
                  Review student requested times across the academy, compare with teacher availability windows, and allocate confirmed class sessions.
                </CardDescription>
              </div>

              {/* Teacher Selector Filter */}
              <div className="w-full sm:w-auto flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">Filter Queue:</span>
                <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                  <SelectTrigger className="w-[240px] text-xs h-8">
                    <SelectValue placeholder="All Teachers (Academy Queue)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Teachers (Academy-wide Queue)
                    </SelectItem>
                    {teacherConfigs?.map((tc) => {
                      const tId =
                        (tc as unknown as { teacher?: number }).teacher ||
                        (tc as unknown as { user?: number }).user ||
                        tc.id;
                      const name =
                        (tc as unknown as { teacher_username?: string; teacher_name?: string }).teacher_username ||
                        (tc as unknown as { teacher_name?: string }).teacher_name ||
                        tc.username;
                      return (
                        <SelectItem key={tc.id} value={String(tId)}>
                          Ustadh {name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          {/* Teacher Declared Working Hours Pill bar (if specific teacher selected) */}
          {filterTeacherIdNum && (
            <div className="px-6 py-2.5 border-t bg-muted/20 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium text-foreground">{teacherDisplayName}&apos;s Declared Hours:</span>
                {teacherAvailability && teacherAvailability.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {teacherAvailability.map((block) => (
                      <Badge key={block.id} variant="secondary" className="text-[10px] font-normal">
                        {block.local?.weekday || block.weekday_display}:{' '}
                        {block.local?.start_time ? block.local.start_time.slice(0, 5) : block.start_time_utc.slice(0, 5)} -{' '}
                        {block.local?.end_time ? block.local.end_time.slice(0, 5) : block.end_time_utc.slice(0, 5)}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground italic text-[11px]">
                    No fixed hours declared yet.
                  </span>
                )}
              </div>

              <Badge variant="outline" className="text-[11px]">
                {waitlistQueue.length} Open Request{waitlistQueue.length === 1 ? '' : 's'}
              </Badge>
            </div>
          )}
        </Card>

        {/* Global Success / Feedback */}
        {allocationSuccess && (
          <Alert className="bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <AlertTitle>Allocation Confirmed</AlertTitle>
            <AlertDescription className="text-xs">{allocationSuccess}</AlertDescription>
          </Alert>
        )}

        {/* Queue List of Open Requests */}
        {isLoadingWaitlist ? (
          <LoadingState />
        ) : errorWaitlist ? (
          <ErrorState
            title="Failed to Load Requests"
            message={errorWaitlist.message || 'Could not retrieve waitlist queue.'}
            onRetry={() => refetchWaitlist()}
          />
        ) : waitlistQueue.length === 0 ? (
          <EmptyState
            title="Queue is Clear"
            description={
              selectedTeacherId === 'all'
                ? 'No pending student requests across the entire academy queue.'
                : `No pending student availability requests in ${teacherDisplayName}'s queue.`
            }
            icon={<UserCheck className="h-10 w-10 text-muted-foreground" />}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {waitlistQueue.map((entry) => {
              const requestedDateStr = entry.requested_start_local || entry.requested_start_utc;
              const formattedDate = requestedDateStr
                ? new Date(requestedDateStr).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Flexible';

              const formattedTime = requestedDateStr
                ? new Date(requestedDateStr).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

              const requestedTeacherName = entry.requested_teacher
                ? `Ustadh ${entry.requested_teacher.first_name || entry.requested_teacher.username}`
                : 'Any Available Instructor';

              return (
                <Card
                  key={entry.id}
                  className="flex flex-col justify-between shadow-2xs hover:shadow-sm transition-shadow border"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {entry.student?.first_name || entry.student?.username || `Student #${entry.student?.id}`}
                        </CardTitle>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {entry.track} • {entry.level?.name || 'Class Level'}
                        </p>
                      </div>
                      <Badge
                        variant={entry.status === 'fulfilled' ? 'secondary' : 'default'}
                        className="text-[10px] capitalize"
                      >
                        {entry.status === 'fulfilled' ? 'Allocated' : 'Pending Allocation'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 text-xs flex-1 flex flex-col justify-between">
                    <div className="space-y-2 bg-muted/20 p-2.5 rounded-md border text-[11px]">
                      <div className="flex items-center text-foreground font-medium">
                        <Calendar className="mr-1.5 h-3.5 w-3.5 text-primary shrink-0" />
                        <span>Requested Time Slot:</span>
                      </div>
                      <div className="pl-5 space-y-1 text-muted-foreground">
                        <div>
                          <strong>Day &amp; Time:</strong> {formattedDate} {formattedTime ? `at ${formattedTime}` : ''}
                        </div>
                        <div>
                          <strong>Duration:</strong> {entry.requested_duration_minutes || 30} mins
                        </div>
                        <div>
                          <strong>Requested Instructor:</strong> {requestedTeacherName}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => handleOpenAllocationModal(entry)}
                      >
                        <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                        Review &amp; Allocate Class
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Allocation Modal */}
        <Dialog open={!!allocatingEntry} onOpenChange={(open) => !open && setAllocatingEntry(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <span>Review &amp; Allocate Student to Class</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Confirm session start time and assign an academy Ustadh to fulfill this request.
              </DialogDescription>
            </DialogHeader>

            {allocatingEntry && (
              <div className="space-y-4 py-2 text-xs">
                {allocationError && (
                  <Alert variant="destructive" className="py-2 text-xs">
                    <AlertTitle className="text-xs">Allocation Failed</AlertTitle>
                    <AlertDescription>{allocationError}</AlertDescription>
                  </Alert>
                )}

                {/* Section 1: Student Request Details */}
                <div className="rounded-lg border p-3 bg-muted/20 space-y-1.5">
                  <div className="font-semibold text-foreground flex items-center justify-between">
                    <span>
                      Student: {allocatingEntry.student?.first_name || allocatingEntry.student?.username}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      Request #{allocatingEntry.id}
                    </Badge>
                  </div>
                  <div className="text-muted-foreground space-y-0.5">
                    <p>
                      <strong>Curriculum:</strong> {allocatingEntry.track} — {allocatingEntry.level?.name || 'Class Level'}
                    </p>
                    <p>
                      <strong>Original Student Requested Slot:</strong>{' '}
                      {allocatingEntry.requested_start_local
                        ? new Date(allocatingEntry.requested_start_local).toLocaleString()
                        : new Date(allocatingEntry.requested_start_utc).toLocaleString()}{' '}
                      ({allocatingEntry.requested_duration_minutes} min)
                    </p>
                  </div>
                </div>

                {/* Section 2: Assigned Teacher Selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Assign Instructor / Ustadh</Label>
                  <Select value={assignedTeacherId} onValueChange={setAssignedTeacherId}>
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue placeholder="Select teacher to assign" />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherConfigs.map((tc) => {
                        const tId =
                          (tc as unknown as { teacher?: number }).teacher ||
                          (tc as unknown as { user?: number }).user ||
                          tc.id;
                        const name =
                          (tc as unknown as { teacher_username?: string; teacher_name?: string }).teacher_username ||
                          (tc as unknown as { teacher_name?: string }).teacher_name ||
                          tc.username;
                        return (
                          <SelectItem key={tc.id} value={String(tId)}>
                            Ustadh {name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Section 3: Teacher Availability Windows */}
                <div className="rounded-lg border p-3 bg-primary/5 border-primary/20 space-y-2">
                  <div className="font-semibold text-primary flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>Teacher Schedule Comparison:</span>
                  </div>

                  <div className="space-y-1 text-muted-foreground text-[11px]">
                    {assignedTeacherAvailability && assignedTeacherAvailability.length > 0 ? (
                      <ul className="list-disc list-inside space-y-0.5 pl-1">
                        {assignedTeacherAvailability.map((b) => (
                          <li key={b.id}>
                            {b.local?.weekday || b.weekday_display}:{' '}
                            {b.local?.start_time ? b.local.start_time.slice(0, 5) : b.start_time_utc.slice(0, 5)} -{' '}
                            {b.local?.end_time ? b.local.end_time.slice(0, 5) : b.end_time_utc.slice(0, 5)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="italic text-muted-foreground">
                        No declared fixed windows for this teacher.
                      </p>
                    )}
                  </div>
                </div>

                {/* Section 4: Confirmed Slot Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Confirmed Session Time (Local)</Label>
                    <Input
                      type="datetime-local"
                      value={allocationStartTime}
                      onChange={(e) => setAllocationStartTime(e.target.value)}
                      className="text-xs h-9"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Session Duration</Label>
                    <Select value={allocationDuration} onValueChange={setAllocationDuration}>
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" size="sm" onClick={() => setAllocatingEntry(null)} className="text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmAllocation}
                disabled={promoteMutation.isPending}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                {promoteMutation.isPending ? 'Allocating...' : 'Confirm Allocation & Create Session'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // --- STUDENT / PARENT VIEW (My Schedule Requests & Waitlist) ---
  if (isLoadingMine) return <LoadingState />;

  if (errorMine) {
    if (errorMine instanceof ApiError && errorMine.status === 403) {
      return (
        <ErrorState
          title="Access Denied"
          message="You do not have permission to view schedule requests."
        />
      );
    }
    return (
      <ErrorState
        title="Failed to Load Schedule Requests"
        message={errorMine.message || 'Could not retrieve your waitlist requests.'}
        onRetry={() => refetchMine()}
      />
    );
  }

  if (!mineWaitlist || mineWaitlist.length === 0) {
    return (
      <EmptyState
        title="No Active Schedule Requests"
        description="You have not requested any classes on the waitlist. Use 'Book a Class' to request a class slot."
        icon={<Calendar className="h-10 w-10 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border shadow-xs bg-muted/20">
        <CardContent className="py-3 px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>
              The academy reviews schedule availability and allocates teachers to confirmed sessions.
            </span>
          </div>
          <Badge variant="outline" className="text-[11px]">
            {mineWaitlist.length} Request{mineWaitlist.length === 1 ? '' : 's'}
          </Badge>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mineWaitlist.map((entry) => {
          const isFulfilled = entry.status === 'fulfilled';
          const requestedDateStr = entry.requested_start_local || entry.requested_start_utc;
          const formattedDate = requestedDateStr
            ? new Date(requestedDateStr).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })
            : 'Flexible';

          const formattedTime = requestedDateStr
            ? new Date(requestedDateStr).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '';

          return (
            <Card
              key={entry.id}
              className="flex flex-col justify-between shadow-2xs hover:shadow-sm transition-shadow border"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      {entry.level?.name || 'Class Lesson'}
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {entry.track} • Request #{entry.id}
                    </p>
                  </div>
                  <Badge variant={isFulfilled ? 'default' : 'secondary'} className="text-[10px] capitalize">
                    {isFulfilled ? 'Allocated & Confirmed' : 'Under Academy Review'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center text-muted-foreground">
                    <User className="mr-2 h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      Teacher:{' '}
                      {entry.requested_teacher?.first_name ||
                        entry.requested_teacher?.username ||
                        'Academy Teacher Pool'}
                    </span>
                  </div>

                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-2 h-3.5 w-3.5 text-primary shrink-0" />
                    <span>
                      Requested: {formattedDate} {formattedTime ? `at ${formattedTime}` : ''} ({entry.requested_duration_minutes || 30} min)
                    </span>
                  </div>

                  {!isFulfilled ? (
                    <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-[11px] flex items-start gap-1.5 border border-amber-200/60">
                      <Clock className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>
                        Under review by academy management. You will be notified once a teacher is assigned.
                      </span>
                    </div>
                  ) : (
                    <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 text-[11px] flex items-start gap-1.5 border border-emerald-200/60">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        Session confirmed! Jitsi meeting room generated and advance notification scheduled.
                      </span>
                    </div>
                  )}
                </div>

                {isFulfilled && entry.fulfilled_booking && (
                  <div className="pt-2 border-t">
                    <Button asChild size="sm" className="w-full text-xs h-7">
                      <Link href={`/app/scheduling/${entry.fulfilled_booking}`}>
                        <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                        Go to Class Session
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
