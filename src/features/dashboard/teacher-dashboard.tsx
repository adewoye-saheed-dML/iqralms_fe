'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  CheckSquare,
  TrendingUp,
  Clock,
  Users,
  Banknote,
  ArrowRight,
  CalendarCheck,
  CheckCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { schedulingKeys, assessmentKeys, payoutsKeys } from '@/lib/api/query-keys';
import { schedulingApi, type Booking } from '@/features/scheduling/api/scheduling';
import { assessmentApi, type LeadAssessment } from '@/features/assessment/api/assessment';
import { payoutsApi } from '@/features/payouts/api/payouts';

export function TeacherDashboard() {
  const { user } = useAuth();
  const { activeAcademy } = useAcademy();

  // Load teacher's upcoming classes
  const { data: upcomingBookings = [] } = useQuery<Booking[]>({
    queryKey: schedulingKeys.bookings(activeAcademy?.id),
    queryFn: () => schedulingApi.getTeachingBookings(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Load pending assessment review queue
  const { data: reviewQueue = [] } = useQuery<LeadAssessment[]>({
    queryKey: assessmentKeys.reviewQueue(activeAcademy?.id),
    queryFn: () => assessmentApi.getQueue(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Load teacher statement summary
  const { data: myStatement } = useQuery({
    queryKey: payoutsKeys.myStatement(activeAcademy?.id),
    queryFn: () => payoutsApi.getMyStatement(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Teacher Dashboard"
          description={`Welcome back, Ustadh ${user?.first_name || user?.username}. Academy: ${activeAcademy?.name || 'Academy'}.`}
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/scheduling?tab=availability">
              <CalendarCheck className="h-4 w-4 mr-1.5" /> My Availability
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/app/scheduling">
              <Calendar className="h-4 w-4 mr-1.5" /> Today&apos;s Schedule
            </Link>
          </Button>
        </div>
      </div>

      {/* Primary Teacher Questions Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Question 1: What class do I teach today / next? */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Upcoming Lessons & Classes</CardTitle>
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
                {upcomingBookings.length} scheduled
              </span>
            </div>
            <CardDescription className="text-xs">
              Next lessons requiring your attendance and recitation instruction.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingBookings.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                No lessons currently scheduled for today. Check your calendar or update your availability.
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingBookings.slice(0, 3).map((booking) => {
                  const studentName =
                    booking.student?.first_name
                      ? `${booking.student.first_name} ${booking.student.last_name || ''}`.trim()
                      : booking.student?.username || 'Student';
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between rounded-lg border p-3 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-foreground">{studentName}</span>
                        <p className="text-muted-foreground text-[11px] mt-0.5">
                          {booking.start_time_local ||
                            new Date(booking.start_time_utc).toLocaleString(undefined, {
                              weekday: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                        </p>
                      </div>
                      <span className="capitalize px-2 py-0.5 bg-muted rounded text-[10px] font-medium">
                        {booking.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0 border-t">
            <Button variant="ghost" size="sm" asChild className="w-full justify-between mt-3">
              <Link href="/app/scheduling">Open Full Schedule <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Question 2: What assessment or progress action is due next? */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Assessments & Review Queue</CardTitle>
              </div>
              <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-medium">
                {reviewQueue.length} pending
              </span>
            </div>
            <CardDescription className="text-xs">
              Student submissions awaiting Tajweed evaluation and level grading.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviewQueue.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                <CheckCircle className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                All assessment reviews are up to date!
              </div>
            ) : (
              <div className="space-y-2">
                {reviewQueue.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-foreground">
                        Level: {item.booking?.level?.name || 'Recitation Level'}
                      </span>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        Time: {new Date(item.booking?.start_time_utc).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs h-7" asChild>
                      <Link href="/app/assessments">Review</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0 border-t">
            <Button variant="ghost" size="sm" asChild className="w-full justify-between mt-3">
              <Link href="/app/assessments">Go to Review Queue <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Secondary Teaching Operations & Earnings */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Assigned Students</CardTitle>
            </div>
            <CardDescription className="text-xs">
              View students enrolled in your tracks and check recitation records.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/app/students">View Students</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Progress Logs</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Record Surah memorization, revision, and Ayah milestones.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/app/progress">Record Progress</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">My Earnings</CardTitle>
            </div>
            <CardDescription className="text-xs">
              {myStatement?.total_amount
                ? `Total Earnings: ${myStatement.currency} ${myStatement.total_amount}`
                : 'Inspect your verified hours taught and payout statements.'}
            </CardDescription>
          </CardHeader>
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/app/payouts">View Statements</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
