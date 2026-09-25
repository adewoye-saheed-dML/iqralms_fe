'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth } from '@/lib/auth/auth-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipsApi, Membership } from '@/features/memberships/api/memberships';
import { curriculumApi } from '@/features/curriculum/api/curriculum';
import { studentsApi } from '@/features/students/api/students';
import { InvitationsDashboard } from '@/features/invitations/components/invitations-dashboard';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';
import {
  Building2,
  Users,
  GraduationCap,
  Calendar,
  Wallet,
  Settings,
  Shield,
  Clock,
  BookOpen,
  UserCheck,
  UserX,
  FileText,
} from 'lucide-react';
import { can, isOwnerOrAdmin as isOwnerOrAdminCheck } from '@/lib/permissions/capabilities';

export default function AcademyPage() {
  const { activeAcademy, activeRole, isLoading: isAcademyLoading } = useAcademy();
  const { user, isLoading: isAuthLoading } = useAuth();
  const queryClient = useQueryClient();

  const isOwnerOrAdmin =
    isOwnerOrAdminCheck({ activeRole, userRole: user?.role }) ||
    can('manage_academy', { activeRole, userRole: user?.role });

  const {
    data: members = [],
    isLoading: isMembersLoading,
    error: membersError,
  } = useQuery<Membership[]>({
    queryKey: ['memberships', activeAcademy?.id],
    queryFn: () => {
      if (!activeAcademy?.id) return [];
      return membershipsApi.list(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id && isOwnerOrAdmin,
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['curriculum', activeAcademy?.id, 'tracks'],
    queryFn: () => {
      if (!activeAcademy?.id) return [];
      return curriculumApi.getTracks(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id && isOwnerOrAdmin,
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students', activeAcademy?.id],
    queryFn: () => {
      if (!activeAcademy?.id) return [];
      return studentsApi.getStudents(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id && isOwnerOrAdmin,
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

  if (isAcademyLoading || isAuthLoading) {
    return <LoadingState />;
  }

  if (!activeAcademy) {
    return (
      <EmptyState
        title="No Active Academy"
        description="Select an academy or create one to manage foundation settings."
        icon={<Building2 className="h-10 w-10 text-muted-foreground" />}
      />
    );
  }

  if (!isOwnerOrAdmin) {
    return (
      <ErrorState
        title="Access Denied"
        message="Only academy owners and administrators have permission to manage academy foundation settings."
      />
    );
  }

  const activeTeachersCount = members.filter(
    (m) => m.role === 'teacher' && m.status === 'active'
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={activeAcademy.name}
        description={`Tenant Foundation & Administration for ${activeAcademy.name}`}
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold">
            {activeRole || 'Member'}
          </Badge>
          <Badge
            variant={activeAcademy.is_active ? 'default' : 'secondary'}
            className="text-xs"
          >
            {activeAcademy.is_active ? 'Operating' : 'Inactive'}
          </Badge>
        </div>
      </PageHeader>

      {/* Academy Foundation Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Academy Details & Settings
          </CardTitle>
          <CardDescription>
            Core tenant identification and localized operational parameters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs">Academy Identifier (Slug)</span>
              <span className="font-mono font-medium">{activeAcademy.slug}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Official Timezone</span>
              <span className="font-medium flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                {activeAcademy.timezone}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Foundation Date</span>
              <span className="font-medium">
                {activeAcademy.created_at
                  ? new Date(activeAcademy.created_at).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs">Tenant ID</span>
              <span className="font-mono font-medium">#{activeAcademy.id}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview & Operations</TabsTrigger>
          <TabsTrigger value="members">
            Members Directory ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invitations">Staff & Teacher Invitations</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview & Operations */}
        <TabsContent value="overview" className="space-y-6 pt-4">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                    <h3 className="text-2xl font-bold">{members.length}</h3>
                  </div>
                  <Users className="h-8 w-8 text-primary opacity-70" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Teachers</p>
                    <h3 className="text-2xl font-bold">{activeTeachersCount}</h3>
                  </div>
                  <GraduationCap className="h-8 w-8 text-emerald-600 opacity-70" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Enrolled Students</p>
                    <h3 className="text-2xl font-bold">{students.length}</h3>
                  </div>
                  <UserCheck className="h-8 w-8 text-blue-600 opacity-70" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Curriculum Tracks</p>
                    <h3 className="text-2xl font-bold">{tracks.length}</h3>
                  </div>
                  <BookOpen className="h-8 w-8 text-amber-600 opacity-70" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Operations Links */}
          <div>
            <h3 className="text-base font-semibold mb-3">Management Quick Actions</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Link href="/app/curriculum" className="block">
                <Card className="hover:border-primary transition cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Curriculum & Tracks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Configure syllabus tracks, proficiency levels, and assign teacher tracks.
                  </CardContent>
                </Card>
              </Link>

              <Link href="/app/students" className="block">
                <Card className="hover:border-primary transition cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-primary" />
                      Student Roster
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Manage enrolled students, enrollment statuses, and track family links.
                  </CardContent>
                </Card>
              </Link>

              <Link href="/app/teachers" className="block">
                <Card className="hover:border-primary transition cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      Teacher Roster & Rates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    View active teachers, per-academy hourly rates, and capacity limits.
                  </CardContent>
                </Card>
              </Link>

              <Link href="/app/scheduling" className="block">
                <Card className="hover:border-primary transition cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Academy Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Monitor live sessions, view upcoming classes, and review waitlist entries.
                  </CardContent>
                </Card>
              </Link>

              <Link href="/app/pricing" className="block">
                <Card className="hover:border-primary transition cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Pricing Agreements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Establish custom student pricing agreements and track active discounts.
                  </CardContent>
                </Card>
              </Link>

              <Link href="/app/payouts" className="block">
                <Card className="hover:border-primary transition cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-primary" />
                      Payouts & Finance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Generate teacher statements, calculate amounts, and finalize payouts.
                  </CardContent>
                </Card>
              </Link>

              <Link href="/app/audit" className="block">
                <Card className="hover:border-primary transition cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      Audit Logs
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Inspect tenant audit trail, role updates, and security events.
                  </CardContent>
                </Card>
              </Link>

              <Link href="/app/settings" className="block">
                <Card className="hover:border-primary transition cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Settings className="h-4 w-4 text-primary" />
                      User Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Manage your account profile, credentials, and notification preferences.
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Members Directory */}
        <TabsContent value="members" className="pt-4 space-y-4">
          {isMembersLoading ? (
            <LoadingState />
          ) : membersError ? (
            <ErrorState
              title="Failed to load members"
              message={membersError.message || 'An error occurred'}
            />
          ) : members.length === 0 ? (
            <EmptyState
              title="No members"
              description="There are no members registered in this academy yet."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {members.map((member) => (
                <Card key={member.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base font-semibold">
                        {member.username}
                      </CardTitle>
                      <Badge
                        variant={
                          member.role === 'owner'
                            ? 'default'
                            : member.role === 'admin'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {member.role_display}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        variant={member.status === 'active' ? 'default' : 'destructive'}
                        className="text-[11px]"
                      >
                        {member.status_display}
                      </Badge>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Joined:</span>
                      <span>
                        {member.created_at
                          ? new Date(member.created_at).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>

                    {member.role !== 'owner' && (
                      <div className="pt-2 border-t flex justify-end">
                        {member.status === 'active' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-destructive hover:bg-destructive/10"
                            disabled={updateMemberMutation.isPending}
                            onClick={() =>
                              updateMemberMutation.mutate({
                                memberId: member.id,
                                status: 'suspended',
                              })
                            }
                          >
                            <UserX className="mr-1 h-3.5 w-3.5" /> Suspend Member
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
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
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Staff & Teacher Invitations */}
        <TabsContent value="invitations" className="pt-4">
          <InvitationsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
