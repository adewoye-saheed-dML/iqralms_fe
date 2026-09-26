'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckSquare,
  Wallet,
  Shield,
  ArrowRight,
  UserPlus,
  Settings,
  Video,
  Clock,
  Mail,
  Search,
  UserCheck,
  UserX,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/loading';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { invitationKeys, studentKeys, curriculumKeys, schedulingKeys, teacherKeys } from '@/lib/api/query-keys';
import { invitationsApi } from '@/features/invitations/api/invitations';
import { studentsApi } from '@/features/students/api/students';
import { curriculumApi } from '@/features/curriculum/api/curriculum';
import { schedulingApi, type Booking } from '@/features/scheduling/api/scheduling';
import { teachersApi } from '@/features/teachers/api/teachers';
import { membershipsApi, type Membership } from '@/features/memberships/api/memberships';

export function OwnerAdminDashboard() {
  const { user } = useAuth();
  const { activeAcademy, activeRole } = useAcademy();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const initialTab = searchParams?.get('tab') === 'members' ? 'members' : 'overview';
  const [activeTab, setActiveTab] = React.useState(initialTab);

  const { data: invitationsList = [] } = useQuery({
    queryKey: invitationKeys.all(activeAcademy?.id),
    queryFn: () => invitationsApi.list(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  const { data: teachersList = [] } = useQuery({
    queryKey: teacherKeys.all(activeAcademy?.id),
    queryFn: () => teachersApi.getTeacherConfigurations(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  const { data: studentsList = [] } = useQuery({
    queryKey: studentKeys.all(activeAcademy?.id),
    queryFn: () => studentsApi.getStudents(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  const { data: tracksList = [] } = useQuery({
    queryKey: curriculumKeys.tracks(activeAcademy?.id),
    queryFn: () => curriculumApi.getTracks(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  const { data: todayBookings = [] } = useQuery<Booking[]>({
    queryKey: schedulingKeys.bookings(activeAcademy?.id),
    queryFn: () => schedulingApi.getAcademyBookings(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  const { data: membersList = [], isLoading: isMembersLoading } = useQuery<Membership[]>({
    queryKey: ['memberships', activeAcademy?.id],
    queryFn: async () => {
      if (!activeAcademy?.id) return [];
      const res = await membershipsApi.list(activeAcademy.id);
      return res ?? [];
    },
    enabled: !!activeAcademy?.id,
  });

  const updateMemberMutation = useMutation({
    mutationFn: ({ memberId, status }: { memberId: number; status: 'active' | 'suspended' }) => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return membershipsApi.update(activeAcademy.id, memberId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberships', activeAcademy?.id] });
    },
  });

  const pendingTeachersCount = invitationsList.filter(
    (inv) => inv.role === 'teacher' && inv.status === 'pending',
  ).length;

  const pendingStudentsCount = invitationsList.filter(
    (inv) => inv.role === 'student' && inv.status === 'pending',
  ).length;

  const pendingParentsCount = invitationsList.filter(
    (inv) => inv.role === 'parent' && inv.status === 'pending',
  ).length;

  const [memberSearch, setMemberSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [page, setPage] = React.useState(1);
  const pageSize = 25;

  const totalPendingInvitations = invitationsList.filter(
    (inv) => inv.status === 'pending',
  ).length;

  const filteredMembers = React.useMemo(() => {
    return membersList.filter((m) => {
      const matchesSearch =
        m.username.toLowerCase().includes(memberSearch.toLowerCase());
      const matchesRole = roleFilter === 'all' || m.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [membersList, memberSearch, roleFilter]);

  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = React.useMemo(() => {
    return filteredMembers.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredMembers, page, pageSize]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <PageHeader
            title="Academy Administration"
            description={`Welcome back, ${user?.first_name || user?.username}. Managing ${activeAcademy?.name || 'Academy'}.`}
            className="pb-2"
          />
          {activeAcademy && (
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="font-semibold text-foreground">{activeAcademy.name}</span>
              <Badge variant="outline" className="font-mono text-[11px]">
                slug: {activeAcademy.slug}
              </Badge>
              <Badge variant="outline" className="text-[11px] flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                {activeAcademy.timezone}
              </Badge>
              <Badge variant="outline" className="font-mono text-[11px]">
                ID: #{activeAcademy.id}
              </Badge>
              <Badge
                variant={activeAcademy.is_active ? 'default' : 'secondary'}
                className="text-[11px]"
              >
                {activeAcademy.is_active ? 'Operating' : 'Inactive'}
              </Badge>
              <Badge variant="secondary" className="text-[11px] uppercase tracking-wider font-semibold">
                {activeRole || 'Owner'}
              </Badge>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/onboarding">
              <Settings className="h-4 w-4 mr-1.5" /> Setup Progress
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/invitations?role=student">
              <UserPlus className="h-4 w-4 mr-1.5" /> Invite Student
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/teachers">
              <UserPlus className="h-4 w-4 mr-1.5" /> Invite Teacher
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/app/invitations">
              <Mail className="h-4 w-4 mr-1.5" /> Invitations
              {totalPendingInvitations > 0 && (
                <span className="ml-1.5 rounded-full bg-primary-foreground/20 px-1.5 py-0.2 text-[10px] font-bold">
                  {totalPendingInvitations}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview &amp; Schedule</TabsTrigger>
          <TabsTrigger value="members">
            Members &amp; Access {membersList.length > 0 && `(${membersList.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Card
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setActiveTab('members')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Academy Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{membersList.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active &amp; staff members &rarr;
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Teachers</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teachersList.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingTeachersCount > 0 ? (
                    <span className="text-amber-600 font-medium">
                      +{pendingTeachersCount} pending invite{pendingTeachersCount > 1 ? 's' : ''}
                    </span>
                  ) : (
                    'Active academy members'
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studentsList.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingStudentsCount > 0 ? (
                    <span className="text-blue-600 font-medium">
                      +{pendingStudentsCount} pending invite{pendingStudentsCount > 1 ? 's' : ''}
                    </span>
                  ) : (
                    'Active enrollments'
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPendingInvitations}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalPendingInvitations > 0 ? (
                    <Link href="/app/invitations" className="text-primary hover:underline">
                      {pendingTeachersCount} teacher, {pendingStudentsCount} student, {pendingParentsCount} parent
                    </Link>
                  ) : (
                    'No pending invitations'
                  )}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Curriculum Tracks</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tracksList.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Structured learning paths</p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Classes & Live Sessions (SSoT Section 10) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Today&apos;s Classes &amp; Live Sessions</h3>
                <p className="text-xs text-muted-foreground">Monitor real-time teaching rooms and scheduled cohort sessions.</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/scheduling">
                  <Calendar className="mr-1.5 h-4 w-4" /> Full Schedule
                </Link>
              </Button>
            </div>

            {todayBookings.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-xs text-muted-foreground">
                  No sessions scheduled for today. New bookings and cohorts will appear here in real-time.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {todayBookings.slice(0, 6).map((booking) => {
                  const studentName =
                    booking.student?.first_name
                      ? `${booking.student.first_name} ${booking.student.last_name || ''}`.trim()
                      : booking.student?.username || 'Student';
                  const teacherName =
                    booking.teacher?.first_name
                      ? `${booking.teacher.first_name} ${booking.teacher.last_name || ''}`.trim()
                      : booking.teacher?.username || 'Teacher';
                  return (
                    <Card key={booking.id} className="flex flex-col justify-between">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-primary truncate">
                            {booking.level?.name || 'Recitation Session'}
                          </span>
                          <span className="capitalize px-2 py-0.5 bg-muted rounded text-[10px] font-medium">
                            {booking.status}
                          </span>
                        </div>
                        <CardDescription className="text-xs">
                          Student: {studentName} · Teacher: {teacherName}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 text-xs text-muted-foreground flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {booking.start_time_local ||
                              new Date(booking.start_time_utc).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                          </span>
                        </div>
                        {booking.status !== 'cancelled' && (
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2" asChild>
                            <Link href={`/app/scheduling/${booking.id}`}>
                              <Video className="mr-1 h-3 w-3" /> Class Session
                            </Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Management Operations Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold tracking-tight">Core Management Operations</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Invitations &amp; Onboarding</CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-2">
                    Send, track, resend, and revoke invitations for teachers, students, and parents.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" asChild className="w-full justify-between">
                    <Link href="/app/invitations">Manage Invitations <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Teachers</CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-2">
                    Manage teachers, send invitations, upload teacher lists, and configure teaching terms.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" asChild className="w-full justify-between">
                    <Link href="/app/teachers">Manage Teachers <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Curriculum &amp; Levels</CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-2">
                    Design custom tracks (Hifz, Tajweed, Arabic) and sequence progressive ordered levels.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" asChild className="w-full justify-between">
                    <Link href="/app/curriculum">Manage Tracks <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Scheduling &amp; Bookings</CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-2">
                    View academy lesson calendars, monitor cohort enrollments, and manage the student waitlist.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" asChild className="w-full justify-between">
                    <Link href="/app/scheduling">Open Scheduling <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Assessments &amp; Reviews</CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-2">
                    Review placement tests and periodic recitation evaluation queues submitted by instructors.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" asChild className="w-full justify-between">
                    <Link href="/app/assessments">Review Queue <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Academy Finance &amp; Payouts</CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-2">
                    Manage student pricing agreements, generate monthly teacher payout runs, and audit statements.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" asChild className="w-full justify-between">
                    <Link href="/app/finance">Academy Finance <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <CardTitle className="text-base">Audit &amp; Governance</CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-2">
                    Inspect immutable system audit logs, track administrative changes, and monitor notifications.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" asChild className="w-full justify-between">
                    <Link href="/app/audit">Audit History <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">Academy Members Directory</h3>
                <Badge variant="secondary" className="text-xs">
                  {membersList.length} total
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Manage registered staff, instructors, students, and account activation statuses for {activeAcademy?.name}.
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/app/invitations">
                <UserPlus className="mr-1.5 h-4 w-4" /> Invite Member
              </Link>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search by username..."
                value={memberSearch}
                onChange={(e) => {
                  setMemberSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {['all', 'teacher', 'student', 'parent', 'admin', 'owner'].map((r) => {
                const count =
                  r === 'all'
                    ? membersList.length
                    : membersList.filter((m) => m.role === r).length;
                return (
                  <Button
                    key={r}
                    variant={roleFilter === r ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs capitalize"
                    onClick={() => {
                      setRoleFilter(r);
                      setPage(1);
                    }}
                  >
                    {r} {count > 0 && `(${count})`}
                  </Button>
                );
              })}
            </div>
          </div>

          {isMembersLoading ? (
            <div className="flex justify-center p-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <EmptyState
              title={memberSearch || roleFilter !== 'all' ? 'No matching members found' : 'No members'}
              description={
                memberSearch || roleFilter !== 'all'
                  ? 'Try adjusting your search query or role filter.'
                  : 'There are no members registered in this academy yet.'
              }
              action={
                memberSearch || roleFilter !== 'all' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setMemberSearch('');
                      setRoleFilter('all');
                      setPage(1);
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              <div className="rounded-md border bg-card overflow-x-auto shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b text-xs text-muted-foreground font-medium">
                    <tr>
                      <th className="p-3 text-left font-medium">Member</th>
                      <th className="p-3 text-left font-medium">Role</th>
                      <th className="p-3 text-left font-medium">Status</th>
                      <th className="p-3 text-left font-medium hidden sm:table-cell">Joined</th>
                      <th className="p-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedMembers.map((member) => (
                      <tr
                        key={member.id}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
                              {member.username.slice(0, 2)}
                            </div>
                            <span className="font-medium text-foreground">
                              {member.username}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={
                              member.role === 'owner'
                                ? 'default'
                                : member.role === 'admin'
                                ? 'secondary'
                                : 'outline'
                            }
                            className="text-[11px] capitalize font-medium"
                          >
                            {member.role_display || member.role}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={member.status === 'active' ? 'default' : 'destructive'}
                            className="text-[11px]"
                          >
                            {member.status === 'active' ? (
                              <span className="flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                Suspended
                              </span>
                            )}
                          </Badge>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">
                          {member.created_at
                            ? new Date(member.created_at).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="p-3 text-right">
                          {member.role === 'owner' ? (
                            <span className="text-[11px] text-muted-foreground italic pr-2">
                              Academy Owner
                            </span>
                          ) : member.status === 'active' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2.5"
                              disabled={updateMemberMutation.isPending}
                              onClick={() =>
                                updateMemberMutation.mutate({
                                  memberId: member.id,
                                  status: 'suspended',
                                })
                              }
                            >
                              <UserX className="mr-1 h-3.5 w-3.5" /> Suspend
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 h-7 px-2.5"
                              disabled={updateMemberMutation.isPending}
                              onClick={() =>
                                updateMemberMutation.mutate({
                                  memberId: member.id,
                                  status: 'active',
                                })
                              }
                            >
                              <UserCheck className="mr-1 h-3.5 w-3.5" /> Reactivate
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground px-1 pt-1">
                  <span>
                    Showing {(page - 1) * pageSize + 1} to{' '}
                    {Math.min(page * pageSize, filteredMembers.length)} of{' '}
                    {filteredMembers.length} members
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <span className="px-2">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
