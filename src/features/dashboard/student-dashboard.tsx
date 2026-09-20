'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Calendar,
  CheckSquare,
  TrendingUp,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { schedulingKeys, progressKeys, assessmentKeys } from '@/lib/api/query-keys';
import { schedulingApi, type Booking } from '@/features/scheduling/api/scheduling';
import { progressApi, type ProgressSnapshot } from '@/features/progress/api/progress';
import { assessmentApi, type TeacherAssessment } from '@/features/assessment/api/assessment';

export function StudentDashboard() {
  const { user } = useAuth();
  const { activeAcademy } = useAcademy();

  // Load student's upcoming bookings
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: schedulingKeys.bookings(activeAcademy?.id),
    queryFn: () => schedulingApi.getMyBookings(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Load student's progress snapshots
  const { data: progressSnapshots = [] } = useQuery<ProgressSnapshot[]>({
    queryKey: progressKeys.snapshots(activeAcademy?.id),
    queryFn: () => progressApi.getAllSnapshots(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Load student's assessments
  const { data: assessments = [] } = useQuery<TeacherAssessment[]>({
    queryKey: assessmentKeys.list(activeAcademy?.id, 'placement'),
    queryFn: () => assessmentApi.getMyAssessments(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  const nextClass = bookings[0];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Student Learning Portal"
        description={`Assalamu Alaikum, ${user?.first_name || user?.username}! Continue your Quranic journey at ${activeAcademy?.name || 'the academy'}.`}
      />

      {/* Next Class Hero */}
      <Card className="border-primary/50 bg-gradient-to-r from-primary/5 via-background to-background">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary text-xs font-semibold uppercase tracking-wider">
            <Clock className="h-4 w-4" /> Next Scheduled Lesson
          </div>
          <CardTitle className="text-xl mt-1">
            {nextClass ? (
              <span>{nextClass.cohort ? 'Group Cohort Class' : '1-on-1 Recitation Session'}</span>
            ) : (
              'No Class Scheduled Today'
            )}
          </CardTitle>
          <CardDescription className="text-xs">
            {nextClass
              ? `Scheduled for ${nextClass.start_time_local || new Date(nextClass.start_time_utc).toLocaleString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}`
              : 'Book your next lesson or check with your teacher to continue your track.'}
          </CardDescription>
        </CardHeader>
        <CardFooter className="pt-0">
          <Button asChild size="sm">
            <Link href="/app/scheduling">
              {nextClass ? 'View Lesson Details' : 'Book a Lesson'}
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Learning & Progress Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* My Learning Path */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">My Learning Path</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Your enrolled track, active level milestones, and memorization targets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">Active Curriculum</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">Enrolled</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Continue logging your memorization progress and recite your daily assignment to your teacher.
              </p>
            </div>
          </CardContent>
          <CardFooter className="pt-0 border-t">
            <Button variant="ghost" size="sm" asChild className="w-full justify-between mt-3">
              <Link href="/app/progress">Go to My Learning <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Assessments */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Assessments & Results</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Placement evaluations and recitation reviews recorded by your teachers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assessments.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                No assessments recorded yet. Once your teacher tests your recitation, results will appear here.
              </div>
            ) : (
              <div className="space-y-2">
                {assessments.slice(0, 3).map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-foreground">
                        {assessment.booking?.level?.name || 'Recitation Assessment'}
                      </span>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        Session: {new Date(assessment.booking?.start_time_utc).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0 border-t">
            <Button variant="ghost" size="sm" asChild className="w-full justify-between mt-3">
              <Link href="/app/assessments">View All Assessments <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">My Schedule</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            View calendar of upcoming lessons and join instructions.
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" asChild className="w-full text-xs">
              <Link href="/app/scheduling">Open Schedule</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">My Progress</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Check your memorized Surahs, revision logs, and milestones ({progressSnapshots.length} logged).
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" asChild className="w-full text-xs">
              <Link href="/app/progress">View Progress</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Book Session</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Schedule a 1-on-1 recitation class with an academy instructor.
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" asChild className="w-full text-xs">
              <Link href="/app/scheduling/book">Book Class</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
