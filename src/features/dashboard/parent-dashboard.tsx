'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Calendar,
  CheckSquare,
  TrendingUp,
  ArrowRight,
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

export function ParentDashboard() {
  const { user } = useAuth();
  const { activeAcademy } = useAcademy();

  // Load family schedule bookings
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: schedulingKeys.bookings(activeAcademy?.id),
    queryFn: () => schedulingApi.getMyBookings(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Load progress snapshots
  const { data: progressSnapshots = [] } = useQuery<ProgressSnapshot[]>({
    queryKey: progressKeys.snapshots(activeAcademy?.id),
    queryFn: () => progressApi.getAllSnapshots(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Load assessment results
  const { data: assessments = [] } = useQuery<TeacherAssessment[]>({
    queryKey: assessmentKeys.list(activeAcademy?.id, 'placement'),
    queryFn: () => assessmentApi.getMyAssessments(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Parent Portal"
        description={`Welcome, ${user?.first_name || user?.username}. Monitoring your family's Quran learning at ${activeAcademy?.name || 'the academy'}.`}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Family Lessons */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Upcoming Lessons Schedule</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Next scheduled classes and recitation circles for your children.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookings.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                No upcoming classes scheduled. Visit the booking page to reserve a session.
              </div>
            ) : (
              <div className="space-y-2">
                {bookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-foreground">
                        {booking.level?.name || 'Recitation Session'}
                      </span>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {booking.start_time_local ||
                          new Date(booking.start_time_utc).toLocaleString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                      </p>
                    </div>
                    <span className="capitalize px-2 py-0.5 bg-muted rounded text-[10px]">
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0 border-t">
            <Button variant="ghost" size="sm" asChild className="w-full justify-between mt-3">
              <Link href="/app/scheduling">View Full Schedule <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Learning Progress & Milestones */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Recent Learning Progress</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Ayah memorization logs, revision marks, and instructor feedback.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {progressSnapshots.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                No recent progress snapshots recorded yet. Progress logs appear as instructors evaluate recitations.
              </div>
            ) : (
              <div className="space-y-2">
                {progressSnapshots.slice(0, 3).map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-foreground">
                        {snapshot.student.first_name
                          ? `${snapshot.student.first_name} ${snapshot.student.last_name || ''}`.trim()
                          : snapshot.student.username}
                      </span>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {snapshot.track?.name || 'Quranic Studies'}
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(snapshot.generated_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0 border-t">
            <Button variant="ghost" size="sm" asChild className="w-full justify-between mt-3">
              <Link href="/app/progress">View Detailed Progress <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick Nav Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Children Profiles</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Manage your registered children and track their active academy enrollments.
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" asChild className="w-full text-xs">
              <Link href="/app/students">View Children</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Assessments</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Review test scores, recitation grades, and teacher commentary ({assessments.length} recorded).
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" asChild className="w-full text-xs">
              <Link href="/app/assessments">View Assessments</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Book a Lesson</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Reserve individual 1-on-1 recitation slots with available qualified instructors.
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" asChild className="w-full text-xs">
              <Link href="/app/scheduling/book">Book Session</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
