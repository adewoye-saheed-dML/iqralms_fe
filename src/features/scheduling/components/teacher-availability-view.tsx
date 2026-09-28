'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth } from '@/lib/auth/auth-provider';
import { schedulingApi, type AvailabilityBlock, type AvailabilityCreate } from '../api/scheduling';
import { teachersApi, type TeacherConfiguration } from '@/features/teachers/api/teachers';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/ui/loading';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Clock,
  Calendar,
  CheckCircle2,
  Info,
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  Search,
  Users,
  UserCheck,
  ShieldCheck,
  Zap,
  Check,
  SlidersHorizontal,
} from 'lucide-react';

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
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const isOwnerOrAdmin =
    activeRole === 'owner' ||
    activeRole === 'admin' ||
    (user?.role as string) === 'owner' ||
    (user?.role as string) === 'admin';
  const isTeacher = user?.role === 'lead' || user?.role === 'sub' || activeRole === 'teacher';

  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'approved' | 'unapproved'>('all');

  // Declare Availability Dialog State
  const [isDeclareOpen, setIsDeclareOpen] = React.useState<boolean>(false);
  const [declareWeekday, setDeclareWeekday] = React.useState<string>('0');
  const [declareStartTime, setDeclareStartTime] = React.useState<string>('09:00');
  const [declareEndTime, setDeclareEndTime] = React.useState<string>('17:00');
  const [declareError, setDeclareError] = React.useState<string | null>(null);
  const [isBulkLoading, setIsBulkLoading] = React.useState<boolean>(false);

  // Auto-open modal if URL has ?declare=true
  React.useEffect(() => {
    if (searchParams.get('declare') === 'true') {
      setIsDeclareOpen(true);
    }
  }, [searchParams]);

  // Fetch teacher configurations for owner/admin
  const { data: teacherConfigs = [], isLoading: isLoadingConfigs } = useQuery({
    queryKey: ['teachers', 'configurations', activeAcademy?.id],
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No academy');
      return teachersApi.getTeacherConfigurations(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id && isOwnerOrAdmin,
  });

  // Resolve initial active teacher ID for owner/admin
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

  // For student/parent, fetch bookings to discover their teachers
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

  // Resolve initial active teacher ID for student/parent
  React.useEffect(() => {
    if (!isTeacher && !isOwnerOrAdmin && studentTeachers.length > 0 && !selectedTeacherId) {
      setSelectedTeacherId(String(studentTeachers[0].id));
    }
  }, [isTeacher, isOwnerOrAdmin, studentTeachers, selectedTeacherId]);

  // For a teacher, their teacher ID is user.id.
  // For owner/admin or student, use the selected teacher.
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

  // Create Availability Mutation
  const createMutation = useMutation({
    mutationFn: (body: AvailabilityCreate) => {
      if (!activeAcademy?.id) throw new Error('No academy');
      return schedulingApi.createAvailability(activeAcademy.id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling', 'availability'] });
      setIsDeclareOpen(false);
      setDeclareError(null);
    },
    onError: (err: unknown) => {
      setDeclareError(err instanceof Error ? err.message : 'Failed to declare availability window');
    },
  });

  // Delete Availability Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => {
      if (!activeAcademy?.id) throw new Error('No academy');
      return schedulingApi.deleteAvailability(activeAcademy.id, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduling', 'availability'] });
    },
  });

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    setDeclareError(null);
    const body: AvailabilityCreate = {
      weekday: Number(declareWeekday),
      start_time: declareStartTime,
      end_time: declareEndTime,
      ...(isOwnerOrAdmin && selectedTeacherId ? { teacher_id: Number(selectedTeacherId) } : {}),
    };
    createMutation.mutate(body);
  };

  const handleBulkWeekdayDeclaration = async () => {
    if (!activeAcademy?.id) return;
    setIsBulkLoading(true);
    setDeclareError(null);
    try {
      for (let day = 0; day <= 4; day++) {
        await schedulingApi.createAvailability(activeAcademy.id, {
          weekday: day,
          start_time: declareStartTime,
          end_time: declareEndTime,
          ...(isOwnerOrAdmin && selectedTeacherId ? { teacher_id: Number(selectedTeacherId) } : {}),
        });
      }
      queryClient.invalidateQueries({ queryKey: ['scheduling', 'availability'] });
      setIsDeclareOpen(false);
    } catch (err: unknown) {
      setDeclareError(err instanceof Error ? err.message : 'Bulk declare failed');
    } finally {
      setIsBulkLoading(false);
    }
  };

  // Filtered teachers list for management
  const filteredTeachers = React.useMemo(() => {
    return teacherConfigs.filter((tc) => {
      const username = tc.username || (tc as unknown as { teacher_username?: string }).teacher_username || '';
      const name = (tc as unknown as { teacher_name?: string }).teacher_name || '';
      const matchesSearch =
        username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        name.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterStatus === 'approved') return tc.approved === true;
      if (filterStatus === 'unapproved') return tc.approved === false;
      return true;
    });
  }, [teacherConfigs, searchQuery, filterStatus]);

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

  // Compute total weekly declared hours for selected teacher
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

  const totalWeeklyHours = (totalWeeklyMinutes / 60).toFixed(1);
  const maxWeeklyHours = selectedTeacherConfig?.max_weekly_hours || 20;
  const capacityPercent = Math.min(100, Math.round((Number(totalWeeklyHours) / maxWeeklyHours) * 100));

  const canManageCurrentTeacher = isTeacher || isOwnerOrAdmin;

  if (isOwnerOrAdmin && isLoadingConfigs && !selectedTeacherId) {
    return <LoadingState />;
  }

  // --- TEACHER INDIVIDUAL VIEW (Simple & Clean) ---
  if (isTeacher && !isOwnerOrAdmin) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">My Declared Teaching Availability</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {totalWeeklyHours} Hours / Week
                </Badge>
                <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Active Schedule
                </Badge>
                <Button size="sm" onClick={() => setIsDeclareOpen(true)} className="ml-2">
                  <Plus className="h-4 w-4 mr-1.5" /> Declare My Hours
                </Button>
              </div>
            </div>
            <CardDescription className="text-xs">
              These weekly time windows declare when you are available for recitation classes in this academy. Lessons can only be booked during your declared hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Notice:</span> Weekly teaching hours are established in the academy system.
                Session requests from students are matched against these windows to ensure you are never double-booked.
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoadingAvailability ? (
          <LoadingState />
        ) : availabilityList.length === 0 ? (
          <Card className="border-dashed p-8 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
            <h4 className="font-medium text-sm">No Availability Windows Declared</h4>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              No recurring weekly teaching hours have been declared yet for your profile in {activeAcademy?.name || 'this academy'}. Declare your available hours now so students and academy management can schedule classes with you.
            </p>
            <Button size="sm" onClick={() => setIsDeclareOpen(true)} className="mt-2">
              <Plus className="mr-1.5 h-4 w-4" /> Declare My Hours Now
            </Button>
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
                          className="rounded-md border bg-card p-2.5 text-xs space-y-1 shadow-2xs group relative"
                        >
                          <div className="flex items-center justify-between font-medium">
                            <span className="text-primary flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {block.start_time_utc?.slice(0, 5)} – {block.end_time_utc?.slice(0, 5)}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-muted-foreground font-mono">UTC</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => deleteMutation.mutate(block.id)}
                                disabled={deleteMutation.isPending}
                                title="Delete this availability slot"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
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

        {/* Dialog for Declaring Hours */}
        <DeclareDialog
          isOpen={isDeclareOpen}
          onOpenChange={setIsDeclareOpen}
          isTeacherOnly={true}
          teacherDisplayName={teacherDisplayName}
          declareWeekday={declareWeekday}
          setDeclareWeekday={setDeclareWeekday}
          declareStartTime={declareStartTime}
          setDeclareStartTime={setDeclareStartTime}
          declareEndTime={declareEndTime}
          setDeclareEndTime={setDeclareEndTime}
          declareError={declareError}
          isBulkLoading={isBulkLoading}
          createPending={createMutation.isPending}
          onSaveSlot={handleSaveSlot}
          onBulkDeclare={handleBulkWeekdayDeclaration}
        />
      </div>
    );
  }

  // --- MANAGEMENT (OWNER / ADMIN / LEAD) MASTER-DETAIL SCALABLE WORKSPACE ---
  return (
    <div className="space-y-6">
      {/* Top Academy Capacity Summary Metrics */}
      {isOwnerOrAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Faculty Roster</p>
                <h3 className="text-xl font-bold mt-1">{teacherConfigs.length} Teachers</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {teacherConfigs.filter((t) => t.approved).length} active & approved
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Current Ustadh Hours</p>
                <h3 className="text-xl font-bold mt-1">{totalWeeklyHours} hrs / wk</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Cap: {maxWeeklyHours} hrs/wk ({capacityPercent}% allocated)
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Clock className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-2xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Selected Instructor</p>
                <h3 className="text-base font-bold mt-1 truncate max-w-[170px]" title={teacherDisplayName}>
                  Ustadh {teacherDisplayName}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {selectedTeacherConfig?.approved ? '✓ Approved to teach' : 'Pending configuration'}
                </p>
              </div>
              <Button size="sm" onClick={() => setIsDeclareOpen(true)} className="shrink-0">
                <Plus className="h-4 w-4 mr-1" /> Add Slots
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Two-Column Master-Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Faculty Directory & Selector (4 cols on lg) */}
        {isOwnerOrAdmin && (
          <Card className="lg:col-span-4 xl:col-span-3.5 shadow-2xs overflow-hidden">
            <CardHeader className="p-4 border-b bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-bold">Faculty Directory</CardTitle>
                </div>
                <Badge variant="outline" className="text-[11px]">
                  {filteredTeachers.length} of {teacherConfigs.length}
                </Badge>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search faculty by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-background"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 pt-1">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  size="sm"
                  className="h-6 text-[10px] px-2.5 rounded-full"
                  onClick={() => setFilterStatus('all')}
                >
                  All ({teacherConfigs.length})
                </Button>
                <Button
                  variant={filterStatus === 'approved' ? 'default' : 'outline'}
                  size="sm"
                  className="h-6 text-[10px] px-2.5 rounded-full"
                  onClick={() => setFilterStatus('approved')}
                >
                  Approved
                </Button>
                <Button
                  variant={filterStatus === 'unapproved' ? 'default' : 'outline'}
                  size="sm"
                  className="h-6 text-[10px] px-2.5 rounded-full"
                  onClick={() => setFilterStatus('unapproved')}
                >
                  Pending
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0 max-h-[600px] overflow-y-auto divide-y">
              {filteredTeachers.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground space-y-1">
                  <p className="font-semibold">No teachers found</p>
                  <p>Try adjusting your search query or filters.</p>
                </div>
              ) : (
                filteredTeachers.map((tc) => {
                  const tId =
                    (tc as unknown as { teacher?: number }).teacher ||
                    (tc as unknown as { user?: number }).user ||
                    tc.id;
                  const isSelected = String(tId) === selectedTeacherId;
                  const name =
                    (tc as unknown as { teacher_username?: string; teacher_name?: string }).teacher_username ||
                    (tc as unknown as { teacher_name?: string }).teacher_name ||
                    tc.username ||
                    `Teacher #${tId}`;
                  const maxHours = tc.max_weekly_hours || 20;
                  const rate = tc.hourly_payout_rate ? `$${tc.hourly_payout_rate}/hr` : 'Standard Rate';

                  return (
                    <button
                      key={tId}
                      type="button"
                      onClick={() => setSelectedTeacherId(String(tId))}
                      className={`w-full text-left p-3.5 transition-all flex items-start justify-between gap-3 hover:bg-muted/50 ${
                        isSelected
                          ? 'bg-primary/10 border-l-4 border-l-primary font-medium'
                          : 'border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            Ustadh {name}
                          </span>
                          {tc.approved && (
                            <span title="Approved to teach in this academy">
                              <ShieldCheck className="h-3 w-3 text-emerald-600 shrink-0" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span>Max {maxHours}h/wk</span>
                          <span>•</span>
                          <span>{rate}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {isSelected ? (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
                            Selected
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 h-4 ${
                              tc.approved
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {tc.approved ? 'Active' : 'Setup'}
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </CardContent>
          </Card>
        )}

        {/* RIGHT COLUMN: Selected Teacher's Weekly Schedule & Details (8 cols on lg) */}
        <div className={`space-y-4 ${isOwnerOrAdmin ? 'lg:col-span-8 xl:col-span-8.5' : 'w-full'}`}>
          {/* Schedule Detail Card */}
          <Card className="shadow-2xs">
            <CardHeader className="pb-3 border-b">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base sm:text-lg">
                      {isOwnerOrAdmin
                        ? `Teaching Availability — Ustadh ${teacherDisplayName}`
                        : !isTeacher
                        ? `Ustadh ${teacherDisplayName}'s Teaching Schedule`
                        : 'My Declared Teaching Availability'}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs">
                    Recurring weekly availability for student routing and session allocation in {activeAcademy?.name || 'this academy'}.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs px-2.5 py-1">
                    <Clock className="w-3 h-3 mr-1 text-primary" />
                    {totalWeeklyHours} Hours / Week
                  </Badge>
                  {canManageCurrentTeacher && (
                    <Button size="sm" onClick={() => setIsDeclareOpen(true)}>
                      <Plus className="h-4 w-4 mr-1.5" /> Declare Slots
                    </Button>
                  )}
                </div>
              </div>

              {/* Capacity Progress Dial */}
              <div className="pt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Capacity Utilization</span>
                  <span className="font-semibold text-foreground">
                    {totalWeeklyHours} / {maxWeeklyHours} hrs declared ({capacityPercent}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      capacityPercent > 100
                        ? 'bg-amber-500'
                        : capacityPercent >= 80
                        ? 'bg-emerald-500'
                        : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(100, capacityPercent)}%` }}
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4">
              <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2 mb-4">
                <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold">Notice:</span> Weekly teaching hours are automatically converted to your local timezone. Confirmed class sessions are scheduled within these windows.
                </div>
              </div>

              {/* Weekly Day Cards Grid */}
              {isLoadingAvailability ? (
                <LoadingState />
              ) : availabilityList.length === 0 ? (
                <div className="border border-dashed rounded-lg p-8 text-center space-y-3 bg-muted/10">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                  <h4 className="font-medium text-sm">No Availability Windows Declared</h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    No recurring weekly working hours have been registered for Ustadh {teacherDisplayName}. Declare availability windows now to enable automated student routing and allocation.
                  </p>
                  {canManageCurrentTeacher && (
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <Button size="sm" onClick={() => setIsDeclareOpen(true)}>
                        <Plus className="mr-1.5 h-4 w-4" /> Declare Availability
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBulkWeekdayDeclaration}
                        disabled={isBulkLoading}
                      >
                        {isBulkLoading ? (
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-1.5 h-4 w-4 text-primary" />
                        )}
                        Apply Mon–Fri (09:00 – 17:00)
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                  {WEEKDAYS.map((dayName, idx) => {
                    const blocks = groupedByDay[idx] || [];
                    const hasBlocks = blocks.length > 0;
                    return (
                      <Card
                        key={dayName}
                        className={`transition-all ${
                          hasBlocks ? 'border-primary/20 shadow-2xs bg-card' : 'opacity-60 bg-muted/20 border-dashed'
                        }`}
                      >
                        <CardHeader className="py-2.5 px-3.5 border-b bg-muted/10">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs">{dayName}</span>
                            <Badge
                              variant={hasBlocks ? 'default' : 'outline'}
                              className="text-[10px] px-1.5 py-0 h-4"
                            >
                              {hasBlocks ? `${blocks.length} slot${blocks.length > 1 ? 's' : ''}` : 'Off'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-3 space-y-2">
                          {hasBlocks ? (
                            blocks.map((block) => (
                              <div
                                key={block.id}
                                className="rounded-md border bg-background p-2 text-xs space-y-1 shadow-2xs group relative"
                              >
                                <div className="flex items-center justify-between font-medium">
                                  <span className="text-primary flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {block.start_time_utc?.slice(0, 5)} – {block.end_time_utc?.slice(0, 5)}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-muted-foreground font-mono">UTC</span>
                                    {canManageCurrentTeacher && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => deleteMutation.mutate(block.id)}
                                        disabled={deleteMutation.isPending}
                                        title="Delete slot"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                {block.local && (
                                  <div className="text-[11px] text-muted-foreground">
                                    Local: {block.local.start_time?.slice(0, 5)} – {block.local.end_time?.slice(0, 5)} ({block.local.timezone || 'Local'})
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-[11px] text-muted-foreground py-1 text-center italic">
                              No slots
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Declare Teaching Availability Modal Dialog */}
      <DeclareDialog
        isOpen={isDeclareOpen}
        onOpenChange={setIsDeclareOpen}
        isTeacherOnly={isTeacher && !isOwnerOrAdmin}
        teacherDisplayName={teacherDisplayName}
        declareWeekday={declareWeekday}
        setDeclareWeekday={setDeclareWeekday}
        declareStartTime={declareStartTime}
        setDeclareStartTime={setDeclareStartTime}
        declareEndTime={declareEndTime}
        setDeclareEndTime={setDeclareEndTime}
        declareError={declareError}
        isBulkLoading={isBulkLoading}
        createPending={createMutation.isPending}
        onSaveSlot={handleSaveSlot}
        onBulkDeclare={handleBulkWeekdayDeclaration}
      />
    </div>
  );
}

// Subcomponent: Reusable Declare Availability Dialog
interface DeclareDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isTeacherOnly: boolean;
  teacherDisplayName: string;
  declareWeekday: string;
  setDeclareWeekday: (day: string) => void;
  declareStartTime: string;
  setDeclareStartTime: (time: string) => void;
  declareEndTime: string;
  setDeclareEndTime: (time: string) => void;
  declareError: string | null;
  isBulkLoading: boolean;
  createPending: boolean;
  onSaveSlot: (e: React.FormEvent) => void;
  onBulkDeclare: () => void;
}

function DeclareDialog({
  isOpen,
  onOpenChange,
  isTeacherOnly,
  teacherDisplayName,
  declareWeekday,
  setDeclareWeekday,
  declareStartTime,
  setDeclareStartTime,
  declareEndTime,
  setDeclareEndTime,
  declareError,
  isBulkLoading,
  createPending,
  onSaveSlot,
  onBulkDeclare,
}: DeclareDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSaveSlot}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>
                {isTeacherOnly
                  ? 'Declare Teaching Availability'
                  : `Declare Availability — Ustadh ${teacherDisplayName}`}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Register recurring weekly windows when the teacher is available. Times are entered in local timezone and automatically converted for students worldwide.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {declareError && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{declareError}</span>
              </div>
            )}

            {/* Day of Week */}
            <div className="space-y-1.5">
              <Label htmlFor="weekday" className="text-xs font-semibold">Day of the Week</Label>
              <Select value={declareWeekday} onValueChange={setDeclareWeekday}>
                <SelectTrigger id="weekday" className="h-9">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAYS.map((name, index) => (
                    <SelectItem key={name} value={String(index)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start-time" className="text-xs font-semibold">Start Time (Local)</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={declareStartTime}
                  onChange={(e) => setDeclareStartTime(e.target.value)}
                  required
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end-time" className="text-xs font-semibold">End Time (Local)</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={declareEndTime}
                  onChange={(e) => setDeclareEndTime(e.target.value)}
                  required
                  className="h-9"
                />
              </div>
            </div>

            {/* Quick Bulk Action */}
            <div className="pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={onBulkDeclare}
                disabled={isBulkLoading || createPending}
              >
                {isBulkLoading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" />
                )}
                Quick Apply: Mon – Fri ({declareStartTime} – {declareEndTime})
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createPending || isBulkLoading}
            >
              {createPending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5 mr-1.5" />
              )}
              Save Availability Slot
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
