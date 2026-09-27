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
  CalendarCheck,
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
import { studentsApi, type StudentList } from '@/features/students/api/students';
import {
  curriculumApi,
  type TrackBrief,
  type Level,
  type TeacherTrack,
  type PlacementResult,
} from '@/features/curriculum/api/curriculum';
import {
  AllocateStudentModal,
  type AllocatableStudent,
} from '@/features/curriculum/components/allocate-student-modal';
import { schedulingApi, type Booking } from '@/features/scheduling/api/scheduling';
import { teachersApi, type TeacherConfiguration } from '@/features/teachers/api/teachers';
import { membershipsApi, type Membership } from '@/features/memberships/api/memberships';

export function OwnerAdminDashboard() {
  const { user } = useAuth();
  const { activeAcademy, activeRole } = useAcademy();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  const validTabs = ['overview', 'teachers', 'students', 'members'];
  const paramTab = searchParams?.get('tab');
  const initialTab = paramTab && validTabs.includes(paramTab) ? paramTab : 'overview';

  const [selectedTab, setSelectedTab] = React.useState<string | null>(null);
  const [prevParamTab, setPrevParamTab] = React.useState(paramTab);

  if (paramTab !== prevParamTab) {
    setPrevParamTab(paramTab);
    setSelectedTab(null);
  }

  const activeTab =
    selectedTab && validTabs.includes(selectedTab)
      ? selectedTab
      : initialTab;

  const handleTabChange = (newTab: string) => {
    setSelectedTab(newTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newTab === 'overview') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', newTab);
      }
      window.history.replaceState(null, '', url.toString());
    }
  };

  const [selectedStudentToPlace, setSelectedStudentToPlace] =
    React.useState<AllocatableStudent | null>(null);

  const { data: invitationsList = [] } = useQuery({
    queryKey: invitationKeys.all(activeAcademy?.id),
    queryFn: async () => {
      if (!activeAcademy?.id) return [];
      const res = await invitationsApi.list(activeAcademy.id);
      return res ?? [];
    },
    enabled: !!activeAcademy?.id,
  });

  const { data: teachersList = [] } = useQuery<TeacherConfiguration[]>({
    queryKey: teacherKeys.all(activeAcademy?.id),
    queryFn: async () => {
      if (!activeAcademy?.id) return [];
      const res = await teachersApi.getTeacherConfigurations(activeAcademy.id);
      return res ?? [];
    },
    enabled: !!activeAcademy?.id,
  });

  const { data: studentsList = [] } = useQuery<StudentList[]>({
    queryKey: studentKeys.all(activeAcademy?.id),
    queryFn: async () => {
      if (!activeAcademy?.id) return [];
      const res = await studentsApi.getStudents(activeAcademy.id);
      return res ?? [];
    },
    enabled: !!activeAcademy?.id,
  });

  const { data: tracksList = [] } = useQuery<TrackBrief[]>({
    queryKey: curriculumKeys.tracks(activeAcademy?.id),
    queryFn: async () => {
      if (!activeAcademy?.id) return [];
      const res = await curriculumApi.getTracks(activeAcademy.id);
      return res ?? [];
    },
    enabled: !!activeAcademy?.id,
  });

  const { data: levelsList = [] } = useQuery<Level[]>({
    queryKey: curriculumKeys.levels(activeAcademy?.id),
    queryFn: async () => {
      if (!activeAcademy?.id) return [];
      const res = await curriculumApi.getLevels(activeAcademy.id);
      return res ?? [];
    },
    enabled: !!activeAcademy?.id,
  });

  const { data: teacherTracksList = [] } = useQuery<TeacherTrack[]>({
    queryKey: curriculumKeys.teacherTracks(activeAcademy?.id),
    queryFn: async () => {
      if (!activeAcademy?.id) return [];
      const res = await curriculumApi.getAcademyTeacherTracks(activeAcademy.id);
      return res ?? [];
    },
    enabled: !!activeAcademy?.id,
  });

  const { data: pendingPlacements = [] } = useQuery<PlacementResult[]>({
    queryKey: ['placements', activeAcademy?.id, 'pending'],
    queryFn: async () => {
      try {
        if (!activeAcademy?.id) return [];
        return await curriculumApi.getPendingPlacements(activeAcademy.id);
      } catch {
        return [];
      }
    },
    enabled: !!activeAcademy?.id,
  });

  const { data: todayBookings = [] } = useQuery<Booking[]>({
    queryKey: schedulingKeys.bookings(activeAcademy?.id),
    queryFn: async () => {
      if (!activeAcademy?.id) return [];
      const res = await schedulingApi.getAcademyBookings(activeAcademy.id);
      return res ?? [];
    },
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

  // Track map for student level resolution
  const trackMap = React.useMemo(() => {
    const map = new Map<number, string>();
    for (const track of tracksList) {
      map.set(track.id, track.name);
    }
    return map;
  }, [tracksList]);

  // Unified Teachers: Cross-matched between OrganizationMembership (role=teacher) and TeacherConfiguration
  const allTeachers = React.useMemo(() => {
    const teacherMap = new Map<string, {
      key: string;
      membershipId: number;
      userId: number;
      username: string;
      status: string;
      approved: boolean;
      hasConfiguration: boolean;
      maxWeeklyHours?: number;
      hourlyPayoutRate?: string | null;
      createdAt: string;
    }>();

    // 1. Teachers from OrganizationMembership
    const teacherMembers = membersList.filter((m) => m.role === 'teacher');
    for (const m of teacherMembers) {
      const config = teachersList.find(
        (c) =>
          c.membership === m.id ||
          c.user === m.user ||
          c.username.toLowerCase() === m.username.toLowerCase()
      );
      teacherMap.set(m.username.toLowerCase(), {
        key: `member-${m.id}`,
        membershipId: m.id,
        userId: m.user,
        username: m.username,
        status: m.status,
        approved: config ? config.approved : m.status === 'active',
        hasConfiguration: !!config,
        maxWeeklyHours: config?.max_weekly_hours,
        hourlyPayoutRate: config?.hourly_payout_rate,
        createdAt: config?.created_at || m.created_at,
      });
    }

    // 2. Teachers from TeacherConfiguration (in case membership wasn't returned in memberships query)
    for (const c of teachersList) {
      const key = c.username.toLowerCase();
      if (!teacherMap.has(key)) {
        teacherMap.set(key, {
          key: `config-${c.id}`,
          membershipId: c.membership,
          userId: c.user,
          username: c.username,
          status: c.approved ? 'active' : 'pending',
          approved: c.approved,
          hasConfiguration: true,
          maxWeeklyHours: c.max_weekly_hours,
          hourlyPayoutRate: c.hourly_payout_rate,
          createdAt: c.created_at,
        });
      }
    }

    return Array.from(teacherMap.values());
  }, [membersList, teachersList]);

  const totalTeacherWeeklyCapacity = React.useMemo(() => {
    return allTeachers.reduce((acc, t) => acc + (t.maxWeeklyHours || 0), 0);
  }, [allTeachers]);

  // Unified Students: Cross-matched between StudentEnrollment and OrganizationMembership (role=student)
  const allStudents = React.useMemo(() => {
    const studentMap = new Map<string, {
      id: string | number;
      enrollmentId?: number;
      membershipId?: number;
      userId?: number;
      username: string;
      email?: string;
      displayName: string;
      trackId?: number | null;
      levelId?: number | null;
      teacherId?: number | null;
      teacherName?: string | null;
      status: string;
      isMinor?: boolean;
      dateOfBirth?: string;
      createdAt: string;
      hasEnrollment: boolean;
      appliedTrackName?: string | null;
      appliedLevelName?: string | null;
      appliedAsBeginner?: boolean;
    }>();

    // 1. Students from StudentEnrollment
    for (const s of studentsList) {
      const key = s.username ? s.username.toLowerCase() : `uid-${s.user_id}`;
      const displayName =
        s.first_name || s.last_name
          ? `${s.first_name || ''} ${s.last_name || ''}`.trim()
          : s.username || `Student #${s.id}`;

      const member = membersList.find(
        (m) =>
          m.user === s.user_id ||
          (s.username && m.username.toLowerCase() === s.username.toLowerCase())
      );

      const placement = pendingPlacements.find(
        (p) => p.student?.id === s.user_id || p.student?.username === s.username
      );

      studentMap.set(key, {
        id: `enrollment-${s.id}`,
        enrollmentId: s.id,
        membershipId: member?.id,
        userId: s.user_id,
        username: s.username,
        email: s.email,
        displayName,
        trackId: s.track_id,
        levelId: s.level_id,
        teacherId: s.teacher_id,
        teacherName: s.teacher_name,
        status: s.enrollment_status || member?.status || 'active',
        isMinor: s.is_minor,
        dateOfBirth: s.date_of_birth,
        createdAt: s.created_at,
        hasEnrollment: true,
        appliedTrackName: placement ? placement.track : null,
        appliedLevelName: placement?.recommended_level?.name || null,
        appliedAsBeginner: placement ? placement.skipped_as_beginner : false,
      });
    }

    // 2. Students from OrganizationMembership who don't have a StudentEnrollment row yet
    const studentMembers = membersList.filter((m) => m.role === 'student');
    for (const m of studentMembers) {
      const key = m.username.toLowerCase();
      if (!studentMap.has(key)) {
        const placement = pendingPlacements.find(
          (p) => p.student?.id === m.user || p.student?.username === m.username
        );
        studentMap.set(key, {
          id: `member-${m.id}`,
          membershipId: m.id,
          userId: m.user,
          username: m.username,
          displayName: m.username,
          status: m.status,
          createdAt: m.created_at,
          hasEnrollment: false,
          appliedTrackName: placement ? placement.track : null,
          appliedLevelName: placement?.recommended_level?.name || null,
          appliedAsBeginner: placement ? placement.skipped_as_beginner : false,
        });
      }
    }

    return Array.from(studentMap.values());
  }, [studentsList, membersList, pendingPlacements]);

  // Unified Members List for the Members & Access directory tab
  const allMembersUnified = React.useMemo(() => {
    const list: Array<{
      id: number | string;
      username: string;
      role: string;
      role_display: string;
      status: 'active' | 'suspended';
      created_at: string;
      membershipId?: number;
      enrollmentId?: number;
    }> = [];

    // 1. Members from membershipsApi
    for (const m of membersList) {
      list.push({
        id: m.id,
        username: m.username,
        role: m.role,
        role_display: m.role_display || m.role,
        status: m.status === 'suspended' ? 'suspended' : 'active',
        created_at: m.created_at,
        membershipId: m.id,
      });
    }

    // 2. Add enrolled students that don't have an OrganizationMembership row yet
    for (const s of studentsList) {
      const exists = list.some(
        (m) => m.username.toLowerCase() === (s.username || '').toLowerCase()
      );
      if (!exists && s.username) {
        list.push({
          id: `enrollment-${s.id}`,
          username: s.username,
          role: 'student',
          role_display: 'Student',
          status: s.enrollment_status === 'suspended' ? 'suspended' : 'active',
          created_at: s.created_at,
          enrollmentId: s.id,
        });
      }
    }

    return list;
  }, [membersList, studentsList]);

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
  const [teacherSearch, setTeacherSearch] = React.useState('');
  const [studentSearch, setStudentSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [page, setPage] = React.useState(1);
  const pageSize = 25;

  const totalPendingInvitations = invitationsList.filter(
    (inv) => inv.status === 'pending',
  ).length;

  const filteredMembers = React.useMemo(() => {
    return allMembersUnified.filter((m) => {
      const matchesSearch =
        m.username.toLowerCase().includes(memberSearch.toLowerCase());
      const matchesRole = roleFilter === 'all' || m.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [allMembersUnified, memberSearch, roleFilter]);

  const filteredTeachers = React.useMemo(() => {
    return allTeachers.filter((t) =>
      t.username.toLowerCase().includes(teacherSearch.toLowerCase())
    );
  }, [allTeachers, teacherSearch]);

  const filteredStudents = React.useMemo(() => {
    return allStudents.filter((s) => {
      const query = studentSearch.toLowerCase();
      return (
        s.username.toLowerCase().includes(query) ||
        s.displayName.toLowerCase().includes(query) ||
        (s.email && s.email.toLowerCase().includes(query))
      );
    });
  }, [allStudents, studentSearch]);

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

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 sm:w-auto">
          <TabsTrigger value="overview" onClick={() => handleTabChange('overview')}>
            Overview &amp; Schedule
          </TabsTrigger>
          <TabsTrigger value="teachers" onClick={() => handleTabChange('teachers')}>
            Teachers {allTeachers.length > 0 && `(${allTeachers.length})`}
          </TabsTrigger>
          <TabsTrigger value="students" onClick={() => handleTabChange('students')}>
            Students {allStudents.length > 0 && `(${allStudents.length})`}
          </TabsTrigger>
          <TabsTrigger value="members" onClick={() => handleTabChange('members')}>
            Members &amp; Access {allMembersUnified.length > 0 && `(${allMembersUnified.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          {/* Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Card
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => handleTabChange('members')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Academy Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allMembersUnified.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active &amp; staff members &rarr;
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => handleTabChange('teachers')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Teachers</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allTeachers.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingTeachersCount > 0 ? (
                    <span className="text-amber-600 font-medium">
                      +{pendingTeachersCount} pending invite{pendingTeachersCount > 1 ? 's' : ''}
                    </span>
                  ) : (
                    'Active teaching staff \u2192'
                  )}
                </p>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => handleTabChange('students')}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allStudents.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingStudentsCount > 0 ? (
                    <span className="text-blue-600 font-medium">
                      +{pendingStudentsCount} pending invite{pendingStudentsCount > 1 ? 's' : ''}
                    </span>
                  ) : (
                    'Active enrollments & roster \u2192'
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

          {/* Teacher Working Hours & Teaching Capacity Management Section */}
          <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-background to-background">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Teacher Working Hours &amp; Capacity</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {allTeachers.filter((t) => t.hasConfiguration).length} Configured Teachers
                  </Badge>
                  {totalTeacherWeeklyCapacity > 0 && (
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {totalTeacherWeeklyCapacity} hrs/wk Max Capacity
                    </Badge>
                  )}
                </div>
              </div>
              <CardDescription className="text-xs">
                Teachers declare their weekly working hours. Academy leadership reviews incoming student availability requests, compares them against teacher schedules, and allocates confirmed sessions.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 flex flex-wrap items-center gap-2">
              <Button size="sm" asChild>
                <Link href="/app/scheduling?tab=availability">
                  <CalendarCheck className="mr-1.5 h-4 w-4" /> Inspect Teacher Availabilities
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/scheduling?tab=waitlist">
                  <UserCheck className="mr-1.5 h-4 w-4" /> Review Student Requests &amp; Allocate
                </Link>
              </Button>
            </CardContent>
          </Card>

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
                    <Link href="/app/invitations?from=dashboard">Manage Invitations <ArrowRight className="h-4 w-4" /></Link>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTabChange('teachers')}
                    className="w-full justify-between"
                  >
                    <span>Manage Teachers</span>
                    <ArrowRight className="h-4 w-4" />
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
                <CardFooter className="pt-0 flex flex-col gap-1.5">
                  <Button variant="ghost" size="sm" asChild className="w-full justify-between">
                    <Link href="/app/curriculum?tab=subjects&from=dashboard">Manage Tracks &amp; Levels <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="w-full justify-between text-xs font-normal">
                    <Link href="/app/curriculum?tab=allocations&from=dashboard">Student-Teacher Mapping <ArrowRight className="h-3.5 w-3.5" /></Link>
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
                    View academy lesson calendars, inspect teacher declared working hours, and allocate student requests.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-0 flex flex-col gap-1.5">
                  <Button variant="ghost" size="sm" asChild className="w-full justify-between">
                    <Link href="/app/scheduling">Open Full Schedule <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="w-full justify-between text-xs font-normal">
                    <Link href="/app/scheduling?tab=availability">Teacher Availabilities <ArrowRight className="h-3.5 w-3.5" /></Link>
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

        <TabsContent value="teachers" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">Academy Teachers Directory</h3>
                <Badge variant="secondary" className="text-xs">
                  {allTeachers.length} total
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Manage teaching instructors, weekly capacity, pay rates, and curriculum subject allocations.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" asChild>
                <Link href="/app/invitations?role=teacher&from=dashboard-teachers">
                  <UserPlus className="mr-1.5 h-4 w-4" /> Invite Teacher
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/curriculum?tab=subjects&from=dashboard-teachers">
                  <BookOpen className="mr-1.5 h-4 w-4" /> Subject Allocation
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search teachers by username..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          {filteredTeachers.length === 0 ? (
            <EmptyState
              title={teacherSearch ? 'No matching teachers found' : 'No teachers onboarded yet'}
              description={
                teacherSearch
                  ? 'Try adjusting your search query.'
                  : 'Invite instructors or assign academy members to teaching roles to populate your faculty.'
              }
              action={
                <Button size="sm" asChild>
                  <Link href="/app/invitations?role=teacher">
                    <UserPlus className="mr-1.5 h-4 w-4" /> Invite Teacher
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="rounded-md border bg-card overflow-x-auto shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b text-xs text-muted-foreground font-medium">
                  <tr>
                    <th className="p-3 text-left font-medium">Teacher</th>
                    <th className="p-3 text-left font-medium">Terms / Status</th>
                    <th className="p-3 text-left font-medium">Weekly Capacity</th>
                    <th className="p-3 text-left font-medium hidden sm:table-cell">Hourly Rate</th>
                    <th className="p-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.key} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
                            {teacher.username.slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-medium text-foreground block">
                              {teacher.username}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              Added {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : 'Recently'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        {teacher.hasConfiguration ? (
                          <Badge
                            variant={teacher.approved ? 'default' : 'secondary'}
                            className="text-[11px]"
                          >
                            {teacher.approved ? (
                              <span className="flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              'Pending Activation'
                            )}
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[11px] border-amber-300 text-amber-600 dark:text-amber-400"
                          >
                            Pending Terms Setup
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-xs">
                        {teacher.hasConfiguration && teacher.maxWeeklyHours != null ? (
                          <span className="font-medium">{teacher.maxWeeklyHours} hrs/wk</span>
                        ) : (
                          <span className="text-muted-foreground italic">Not configured</span>
                        )}
                      </td>
                      <td className="p-3 text-xs hidden sm:table-cell">
                        {teacher.hasConfiguration && teacher.hourlyPayoutRate ? (
                          <span className="font-medium font-mono">${teacher.hourlyPayoutRate}/hr</span>
                        ) : (
                          <span className="text-muted-foreground italic">None set</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="outline" size="sm" asChild className="h-7 text-xs px-2" title="Inspect Teacher Availability">
                            <Link href="/app/scheduling?tab=availability">
                              <CalendarCheck className="h-3.5 w-3.5 mr-1 text-primary" /> Availability
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild className="h-7 text-xs px-2.5">
                            <Link href={`/app/teachers/${teacher.membershipId}?from=dashboard-teachers`}>
                              {teacher.hasConfiguration ? 'View / Terms' : 'Set Terms'}
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2">
                            <Link href="/app/curriculum?tab=subjects&from=dashboard-teachers" title="Subject Allocation">
                              <BookOpen className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">Enrolled Students Roster</h3>
                <Badge variant="secondary" className="text-xs">
                  {allStudents.length} total
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Track active learners, track/level progression, and assigned teaching mentors for {activeAcademy?.name}.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" asChild>
                <Link href="/app/invitations?role=student&from=dashboard-students">
                  <UserPlus className="mr-1.5 h-4 w-4" /> Invite Student
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/app/curriculum?tab=allocations&from=dashboard-students">
                  <GraduationCap className="mr-1.5 h-4 w-4" /> Map Track &amp; Teacher
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search students by name or username..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <EmptyState
              title={studentSearch ? 'No matching students found' : 'No students enrolled yet'}
              description={
                studentSearch
                  ? 'Try adjusting your search query.'
                  : 'Invite students via email to get started.'
              }
              action={
                <div className="flex items-center gap-2">
                  <Button size="sm" asChild>
                    <Link href="/app/invitations?role=student&from=dashboard-students">
                      <UserPlus className="mr-1.5 h-4 w-4" /> Invite Student
                    </Link>
                  </Button>
                </div>
              }
            />
          ) : (
            <div className="rounded-md border bg-card overflow-x-auto shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b text-xs text-muted-foreground font-medium">
                  <tr>
                    <th className="p-3 text-left font-medium">Student</th>
                    <th className="p-3 text-left font-medium">Track &amp; Level</th>
                    <th className="p-3 text-left font-medium">Assigned Teacher</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.map((student) => {
                    const trackName = student.trackId ? trackMap.get(student.trackId) : null;
                    const trackDisplay = trackName
                      ? student.levelId
                        ? `${trackName} · Level ${student.levelId}`
                        : trackName
                      : null;

                    return (
                      <tr key={student.id} className="hover:bg-muted/40 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase">
                              {student.username.slice(0, 2)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium text-foreground">
                                  {student.displayName}
                                </span>
                                {student.isMinor && (
                                  <Badge variant="outline" className="text-[10px] py-0 px-1 font-mono">
                                    Minor
                                  </Badge>
                                )}
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                @{student.username}
                                {student.email ? ` · ${student.email}` : ''}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-xs">
                          {trackDisplay ? (
                            <span className="font-medium text-foreground">{trackDisplay}</span>
                          ) : student.appliedTrackName ? (
                            <div className="flex flex-col gap-0.5">
                              <Badge variant="outline" className="text-[11px] border-primary/40 text-primary bg-primary/5">
                                Applied: {student.appliedTrackName}
                              </Badge>
                              {student.appliedLevelName && (
                                <span className="text-[10px] text-muted-foreground">Rec: {student.appliedLevelName}</span>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-[11px] border-amber-300 text-amber-600 dark:text-amber-400">
                              Unplaced Track
                            </Badge>
                          )}
                        </td>
                        <td className="p-3 text-xs">
                          {student.teacherName ? (
                            <span className="font-medium text-foreground">{student.teacherName}</span>
                          ) : (
                            <Badge variant="outline" className="text-[11px] text-muted-foreground">
                              No Teacher Assigned
                            </Badge>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={student.status === 'active' ? 'default' : 'secondary'}
                            className="text-[11px] capitalize"
                          >
                            {student.status === 'active' ? (
                              <span className="flex items-center gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active
                              </span>
                            ) : (
                              student.status
                            )}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {student.enrollmentId ? (
                              <Button variant="outline" size="sm" asChild className="h-7 text-xs px-2.5">
                                <Link href={`/app/students/${student.enrollmentId}?from=dashboard-students`}>
                                  Manage
                                </Link>
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs px-2.5"
                                onClick={() => {
                                  setSelectedStudentToPlace({
                                    id: -(student.membershipId || student.userId || 0),
                                    user_id: student.userId!,
                                    username: student.username,
                                    first_name: '',
                                    last_name: '',
                                    email: student.email || '',
                                    hasEnrollment: false,
                                    track_id: null,
                                    level_id: null,
                                    teacher_id: null,
                                    appliedTrackName: student.appliedTrackName,
                                    appliedLevelName: student.appliedLevelName,
                                    appliedAsBeginner: student.appliedAsBeginner,
                                  });
                                }}
                              >
                                <BookOpen className="mr-1 h-3.5 w-3.5 text-primary" />
                                Enroll / Place
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2">
                              <Link href="/app/curriculum?tab=allocations" title="Map Track & Teacher">
                                <GraduationCap className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold">Academy Members Directory</h3>
                <Badge variant="secondary" className="text-xs">
                  {allMembersUnified.length} total
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
                    ? allMembersUnified.length
                    : r === 'student'
                    ? allStudents.length
                    : r === 'teacher'
                    ? allTeachers.length
                    : allMembersUnified.filter((m) => m.role === r).length;
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
                          ) : member.membershipId ? (
                            member.status === 'active' ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2.5"
                                disabled={updateMemberMutation.isPending}
                                onClick={() =>
                                  updateMemberMutation.mutate({
                                    memberId: member.membershipId!,
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
                                    memberId: member.membershipId!,
                                    status: 'active',
                                  })
                                }
                              >
                                <UserCheck className="mr-1 h-3.5 w-3.5" /> Reactivate
                              </Button>
                            )
                          ) : member.enrollmentId ? (
                            <Button variant="outline" size="sm" asChild className="text-xs h-7 px-2.5">
                              <Link href={`/app/students/${member.enrollmentId}`}>Manage</Link>
                            </Button>
                          ) : null}
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

      {selectedStudentToPlace && (
        <AllocateStudentModal
          student={selectedStudentToPlace}
          tracks={tracksList}
          levels={levelsList}
          teacherTracks={teacherTracksList}
          members={membersList}
          onClose={() => setSelectedStudentToPlace(null)}
        />
      )}
    </div>
  );
}
