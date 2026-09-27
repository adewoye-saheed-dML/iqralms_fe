'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth } from '@/lib/auth/auth-provider';
import { schedulingApi, type AvailabilityBlock } from '../api/scheduling';
import { teachersApi } from '@/features/teachers/api/teachers';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LoadingState } from '@/components/ui/loading';
import { Clock, Calendar, CheckCircle2, User, Info, AlertCircle } from 'lucide-react';

const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export function TeacherAvailabilityView() {
  const { activeAcademy, activeRole } = useAcademy();
  const { user } = useAuth();

  const isOwnerOrAdmin =
    activeRole === 'owner' ||
    activeRole === 'admin' ||
    (user?.role as string) === 'owner' ||
    (user?.role as string) === 'admin';
  const isTeacher = user?.role === 'lead' || user?.role === 'sub' || activeRole === 'teacher';

  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>('');

  // Fetch teacher configurations ONLY for owner/admin who can manage memberships
  const { data: teacherConfigs = [], isLoading: isLoadingConfigs } = useQuery({
    queryKey: ['teachers', 'configurations', activeAcademy?.id],
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No academy');
      return teachersApi.getTeacherConfigurations(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id && isOwnerOrAdmin,
  });

  // Resolve active teacher ID for owner/admin
  React.useEffect(() => {
    if (isOwnerOrAdmin && teacherConfigs.length > 0 && !selectedTeacherId) {
      const firstConfig = teacherConfigs[0];
      const tId =
        (firstConfig as unknown as { teacher?: number }).teacher ||
        (firstConfig as unknown as { user?: number }).user ||
        firstConfig.id;
      setSelectedTeacherId(String(tId));
    }
  }, [isOwnerOrAdmin, teacherConfigs, selectedTeacherId]);

  // For student/parent, fetch their bookings to discover assigned/past teachers
  const { data: myBookings = [] } = useQuery({
    queryKey: ['scheduling', 'bookings', activeAcademy?.id, 'mine'],
    queryFn: () => {
      if (!activeAcademy?.id) return [];
      return schedulingApi.getMyBookings(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id && !isTeacher && !isOwnerOrAdmin,
  });

  const studentTeachers = React.useMemo(() => {
    const map = new Map<number, { id: number; name: string }>();
    myBookings.forEach((b) => {
      if (b.teacher?.id) {
        const name = b.teacher.first_name
          ? `${b.teacher.first_name} ${b.teacher.last_name || ''}`.trim()
          : b.teacher.username || `Teacher #${b.teacher.id}`;
        map.set(b.teacher.id, { id: b.teacher.id, name });
      }
    });
    return Array.from(map.values());
  }, [myBookings]);

  // Resolve active teacher ID for student/parent
  React.useEffect(() => {
    if (!isTeacher && !isOwnerOrAdmin && studentTeachers.length > 0 && !selectedTeacherId) {
      setSelectedTeacherId(String(studentTeachers[0].id));
    }
  }, [isTeacher, isOwnerOrAdmin, studentTeachers, selectedTeacherId]);

  // For a teacher, their teacher ID is simply user.id (no need for management configurations API).
  // For owner/admin or student, use the selected teacher from dropdown/history.
  const teacherIdNum = isTeacher && !isOwnerOrAdmin
    ? user?.id
    : (selectedTeacherId ? Number(selectedTeacherId) : null);

  const { data: availabilityList = [], isLoading: isLoadingAvailability } = useQuery({
    queryKey: ['scheduling', 'availability', activeAcademy?.id, teacherIdNum],
    queryFn: () => {
      if (!activeAcademy?.id || !teacherIdNum) return [];
      return schedulingApi.getAvailability(activeAcademy.id, teacherIdNum);
    },
    enabled: !!activeAcademy?.id && !!teacherIdNum,
  });

  const selectedTeacherConfig = isOwnerOrAdmin
    ? teacherConfigs.find((tc) => {
        const tId =
          (tc as unknown as { teacher?: number }).teacher ||
          (tc as unknown as { user?: number }).user ||
          tc.id;
        return String(tId) === selectedTeacherId;
      })
    : null;

  const teacherDisplayName = isTeacher && !isOwnerOrAdmin
    ? user?.first_name
      ? `${user.first_name} ${user.last_name || ''}`.trim()
      : user?.username || 'Teacher'
    : selectedTeacherConfig
    ? (selectedTeacherConfig as unknown as { teacher_username?: string; teacher_name?: string }).teacher_username ||
      (selectedTeacherConfig as unknown as { teacher_name?: string }).teacher_name ||
      selectedTeacherConfig.username ||
      `Teacher #${selectedTeacherId}`
    : (!isTeacher && !isOwnerOrAdmin && studentTeachers.length > 0)
    ? (studentTeachers.find((st) => String(st.id) === selectedTeacherId)?.name || 'Teacher')
    : selectedTeacherId
    ? `Teacher #${selectedTeacherId}`
    : 'Teacher';

  // Group availability by weekday
  const groupedByDay = React.useMemo(() => {
    const map: Record<number, AvailabilityBlock[]> = {};
    for (let i = 0; i < 7; i++) {
      map[i] = [];
    }
    availabilityList.forEach((block) => {
      const day = block.weekday ?? 0;
      if (!map[day]) map[day] = [];
      map[day].push(block);
    });
    return map;
  }, [availabilityList]);

  // Compute total weekly declared hours
  const totalWeeklyMinutes = React.useMemo(() => {
    return availabilityList.reduce((acc, curr) => {
      if (curr.start_time_utc && curr.end_time_utc) {
        const [sh, sm] = curr.start_time_utc.split(':').map(Number);
        const [eh, em] = curr.end_time_utc.split(':').map(Number);
        const diff = eh * 60 + em - (sh * 60 + sm);
        return acc + (diff > 0 ? diff : 0);
      }
      return acc;
    }, 0);
  }, [availabilityList]);

  if (isOwnerOrAdmin && isLoadingConfigs && !selectedTeacherId) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Header controls for Management */}
      {isOwnerOrAdmin && teacherConfigs && teacherConfigs.length > 0 && (
        <Card className="bg-muted/40">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase font-semibold">Select Teacher</Label>
                <div className="mt-1">
                  <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                    <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Select teacher schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {teacherConfigs.map((tc) => {
                        const tId =
                          (tc as unknown as { teacher?: number }).teacher ||
                          (tc as unknown as { user?: number }).user ||
                          tc.id;
                        const label =
                          (tc as unknown as { teacher_username?: string; teacher_name?: string }).teacher_username ||
                          (tc as unknown as { teacher_name?: string }).teacher_name ||
                          tc.username ||
                          `Teacher #${tId}`;
                        return (
                          <SelectItem key={tId} value={String(tId)}>
                            Ustadh {label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-3 py-1 bg-background text-xs">
                  <Clock className="w-3.5 h-3.5 mr-1 text-primary" />
                  Total Weekly Capacity: {(totalWeeklyMinutes / 60).toFixed(1)} hrs
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header controls for Student/Parent to switch teachers */}
      {!isTeacher && !isOwnerOrAdmin && studentTeachers.length > 1 && (
        <Card className="bg-muted/40">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <Label className="text-xs text-muted-foreground uppercase font-semibold">Select Ustadh</Label>
                <div className="mt-1">
                  <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                    <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Select teacher schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {studentTeachers.map((st) => (
                        <SelectItem key={st.id} value={String(st.id)}>
                          Ustadh {st.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="px-3 py-1 bg-background text-xs">
                  <Clock className="w-3.5 h-3.5 mr-1 text-primary" />
                  Teaching Hours: {(totalWeeklyMinutes / 60).toFixed(1)} hrs
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Banner */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                {isTeacher && !isOwnerOrAdmin
                  ? 'My Declared Teaching Availability'
                  : !isTeacher && !isOwnerOrAdmin
                  ? `Ustadh ${teacherDisplayName}'s Teaching Schedule`
                  : `Teaching Availability — Ustadh ${teacherDisplayName}`}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {(totalWeeklyMinutes / 60).toFixed(1)} Hours / Week
              </Badge>
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Active Schedule
              </Badge>
            </div>
          </div>
          <CardDescription className="text-xs">
            {isTeacher && !isOwnerOrAdmin
              ? 'These weekly time windows declare when you are available for recitation classes in this academy.'
              : !isTeacher && !isOwnerOrAdmin
              ? `These weekly time windows declare when Ustadh ${teacherDisplayName} is available for recitation classes. Sessions booked during these hours confirm immediately.`
              : `These weekly time windows declare when Ustadh ${teacherDisplayName} is available for recitation classes. Students request sessions matching these hours, and academy leadership allocates confirmed sessions within them.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">Schedule SSoT Notice:</span> Weekly teaching hours are established in the academy system.
              Session requests from students are matched against these windows to ensure teachers are never double-booked or scheduled outside their working hours.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule Grid */}
      {isLoadingAvailability ? (
        <LoadingState />
      ) : availabilityList.length === 0 ? (
        <Card className="border-dashed p-8 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
          <h4 className="font-medium text-sm">No Availability Windows Declared</h4>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {isTeacher && !isOwnerOrAdmin
              ? `No recurring weekly teaching hours have been declared yet for your profile in ${activeAcademy?.name || 'this academy'}. Your declared hours determine when students and management can schedule classes with you. Please contact academy leadership to register your active teaching windows.`
              : !isTeacher && !isOwnerOrAdmin
              ? `Ustadh ${teacherDisplayName} does not currently have fixed recurring weekly hours declared in ${activeAcademy?.name || 'this academy'}. You can still request a class session and the academy will route or allocate an instructor.`
              : `No recurring weekly working hours have been registered for this teacher in ${activeAcademy?.name || 'this academy'}. In this backend version, availability windows are maintained by academy leadership to enable automated student routing and allocation.`}
          </p>
          {!isTeacher && !isOwnerOrAdmin && (
            <Button size="sm" asChild className="mt-2">
              <Link href="/app/scheduling/book">
                <Calendar className="mr-1.5 h-4 w-4" /> Book a Class Session
              </Link>
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {WEEKDAYS.map((dayName, idx) => {
            const blocks = groupedByDay[idx] || [];
            const hasBlocks = blocks.length > 0;
            return (
              <Card key={dayName} className={hasBlocks ? 'border-primary/20 shadow-xs' : 'opacity-70 bg-muted/20'}>
                <CardHeader className="py-3 px-4 border-b">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{dayName}</span>
                    <Badge variant={hasBlocks ? 'default' : 'outline'} className="text-[10px] px-2 py-0">
                      {hasBlocks ? `${blocks.length} slot${blocks.length > 1 ? 's' : ''}` : 'Off'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-2.5">
                  {hasBlocks ? (
                    blocks.map((block) => (
                      <div
                        key={block.id}
                        className="rounded-md border bg-card p-2.5 text-xs space-y-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-primary flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {block.start_time_utc?.slice(0, 5)} – {block.end_time_utc?.slice(0, 5)}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">UTC</span>
                        </div>
                        {block.local && (
                          <div className="text-[11px] text-muted-foreground">
                            Local: {block.local.start_time?.slice(0, 5)} – {block.local.end_time?.slice(0, 5)} ({block.local.timezone || 'Local'})
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground py-2 text-center italic">
                      No teaching hours scheduled
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
