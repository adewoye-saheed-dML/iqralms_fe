'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { invitationKeys, studentKeys, curriculumKeys } from '@/lib/api/query-keys';
import { invitationsApi } from '@/features/invitations/api/invitations';
import { studentsApi } from '@/features/students/api/students';
import { curriculumApi } from '@/features/curriculum/api/curriculum';

export function OwnerAdminDashboard() {
  const { user } = useAuth();
  const { activeAcademy, activeRole } = useAcademy();

  const { data: invitationsList = [] } = useQuery({
    queryKey: invitationKeys.all(activeAcademy?.id),
    queryFn: () => invitationsApi.list(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  const { data: studentsList = [] }, = [] } = useQuery({
    queryKey: studentKeys.all(activeAcademy?.id),
    queryFn: () => studentsApi.getStudents(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  const { data: tracksList = [] } = useQuery({
    queryKey: curriculumKeys.tracks(activeAcademy?.id),
    queryFn: () => curriculumApi.getTracks(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Academy Administration"
          description={`Welcome back, ${user?.first_name || user?.username}. Managing ${activeAcademy?.name || 'Academy'}.`}
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/onboarding">
              <Settings className="h-4 w-4 mr-1.5" /> Setup Progress
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/app/teachers/add">
              <UserPlus className="h-4 w-4 mr-1.5" /> Invite Teacher
            </Link>
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Academy Context</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">{activeAcademy?.name}</div>
            <p className="text-xs text-muted-foreground mt-1 capitalize">Role: {activeRole || 'Owner'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invitationsList.filter((invitation) => invitation.role === 'teacher' && invitation.status === 'accepted').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active academy members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsList.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active enrollments</p>
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

      {/* Management Operations Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Core Management Operations</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                <CardTitle className="text-base">Curriculum & Levels</CardTitle>
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
                <CardTitle className="text-base">Scheduling & Bookings</CardTitle>
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
                <CardTitle className="text-base">Assessments & Reviews</CardTitle>
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
                <CardTitle className="text-base">Academy Finance & Payouts</CardTitle>
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
                <CardTitle className="text-base">Audit & Governance</CardTitle>
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
    </div>
  );
}
