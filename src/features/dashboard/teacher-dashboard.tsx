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
  Video,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { schedulingKeys, assessmentKeys, payoutsKeys } from '@/lib/api/query-keys';
import { schedulingApi, type Booking, type AvailabilityBlock } from '@/features/scheduling/api/scheduling';
import { assessmentApi, type LeadAssessment, type TeacherAssessment } from '@/features/assessment/api/assessment';
import { payoutsApi, type MyTeacherPayout } from '@/features/payouts/api/payouts';
import { can } from '@/lib/permissions/capabilities';

export function TeacherDashboard() {
  const { user } = useAuth();
  const { activeAcademy, activeRole } = useAcademy();

  const isLead = can('review_assessments', { activeRole, userRole: user?.role });

  // Load teacher's upcoming classes
  const { data: upcomingBookings = [] } = useQuery<Booking[]>({
    queryKey: schedulingKeys.bookings(activeAcademy?.id),
    queryFn: () => schedulingApi.getTeachingBookings(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Load pending assessment review queue (ONLY for lead teachers / admins who have review permissions)
  const { data: reviewQueue = [] } = useQuery<LeadAssessment[]>({
    queryKey: assessmentKeys.reviewQueue(activeAcademy?.id),
    queryFn: () => assessmentApi.getQueue(activeAcademy!.id),
    enabled: !!activeAcademy?.id && isLead,
  });

  // Load regular teacher's own submitted assessments
  const { data: mySubmissions = [] } = useQuery<TeacherAssessment[]>({
    queryKey: assessmentKeys.list(activeAcademy?.id, 'teacher-mine'),
    queryFn: () => assessmentApi.getTeacherAssessments(activeAcademy!.id),
    enabled: !!activeAcademy?.id && !isLead,
  });

  // Load teacher's own payouts
  const { data: myPayouts = [] } = useQuery<MyTeacherPayout[]>({
    queryKey: payoutsKeys.all(activeAcademy?.id),
    queryFn: () => payoutsApi.getMyPayouts(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Load teacher's declared availability
  const { data: myAvailability = [] } = useQuery<AvailabilityBlock[]>({
    queryKey: schedulingKeys.availability(activeAcademy?.id, user?.id),
    queryFn: () => {
      if (!activeAcademy?.id || !user?.id) return [];
      return schedulingApi.getAvailability(activeAcademy.id, user.id);
    },
    enabled: !!activeAcademy?.id && !!user?.id,
  });

  const totalWeeklyMinutes = React.useMemo(() => {
    return myAvailability.reduce((acc, curr) => {
      if (curr.start_time_utc && curr.end_time_utc) {
        const [sh, sm] = curr.start_time_utc.split(':').map(Number);
        const [eh, em] = curr.end_time_utc.split(':').map(Number);
        const diff = eh * 60 + em - (sh * 60 + sm);
        return acc + (diff > 0 ? diff : 0);
      }
      return acc;
    }, 0);
  }, [myAvailability]);

  const activeDaysCount = React.useMemo(() => {
    const days = new Set(myAvailability.map((b) => b.weekday));
    return days.size;
  }, [myAvailability]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Teacher Dashboard"
          description={`Welcome back, Ustadh ${user?.first_name || user?.username}. Academy: ${activeAcademy?.name || 'Academy'}.`}
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="border-primary/30 hover:bg-primary/5">
            <Link href="/app/scheduling?tab=availability">
              <CalendarCheck className="h-4 w-4 mr-1.5 text-primary" />
              <span>My Availability</span>
              {myAvailability.length > 0 && (
                <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-[10px] bg-primary/10 text-primary">
                  {(totalWeeklyMinutes / 60).toFixed(0)}h/wk
                </Badge>
              )}
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/app/scheduling">
              <Calendar className="h-4 w-4 mr-1.5" /> Today&apos;s Schedule
            </Link>
          </Button>
        </div>
      </div>

      {/* Teacher Declared Working Hours & Availability Section */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 via-background to-background">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Weekly Working Availability &amp; Teaching Hours</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {myAvailability.length > 0 ? (
                <>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" /> Active Teaching Schedule
                  </Badge>
                  <Badge variant="secondary" className="text-xs font-semibold">
                    {(totalWeeklyMinutes / 60).toFixed(1)} hrs/week ({activeDaysCount} active days)
                  </Badge>
                </>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 text-xs">
                  No Working Hours Declared
                </Badge>
              )}
            </div>
          </div>
          <CardDescription className="text-xs">
            Your declared working hours dictate when students can request 1-on-1 recitation classes and when academy leadership can allocate confirmed lessons to your schedule.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 pb-3">
          {myAvailability.length === 0 ? (
            <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 p-4 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Declare Your Weekly Teaching Windows</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  You have not registered your weekly availability windows in this academy yet. Set your hours so students and academy management can route sessions to you.
                </p>
              </div>
              <Button size="sm" asChild className="shrink-0">
                <Link href="/app/scheduling?tab=availability">
                  <CalendarCheck className="mr-1.5 h-4 w-4" /> Declare My Hours
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border bg-card text-xs">
              <div className="space-y-1">
                <div className="font-medium text-foreground flex items-center gap-2">
                  <span>Weekly Capacity: {(totalWeeklyMinutes / 60).toFixed(1)} hours across {activeDaysCount} days</span>
                  <span className="text-muted-foreground text-[11px]">({myAvailability.length} slot windows)</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Recitation booking requests matching your declared schedule confirm automatically or enter priority allocation.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild className="shrink-0">
                <Link href="/app/scheduling?tab=availability">
                  <CalendarCheck className="mr-1.5 h-4 w-4" /> View Full Availability
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
                      <div className="flex items-center gap-2">
                        <span className="capitalize px-2 py-0.5 bg-muted rounded text-[10px] font-medium">
                          {booking.status}
                        </span>
                        {booking.status !== 'cancelled' && (
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2" asChild>
                            <Link href={`/app/scheduling/${booking.id}`}>
                              <Video className="mr-1 h-3 w-3" /> Join Class
                            </Link>
                          </Button>
                        )}
                      </div>
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
        {isLead ? (
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
        ) : (
          <Card className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-base">Assessments & Submissions</CardTitle>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
                  {mySubmissions.length} recorded
                </span>
              </div>
              <CardDescription className="text-xs">
                Recitation scores and lesson notes submitted for your assigned students.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mySubmissions.length === 0 ? (
                <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                  No session assessments submitted yet. Assessments are submitted after completing lessons.
                </div>
              ) : (
                <div className="space-y-2">
                  {mySubmissions.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-3 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-foreground">
                          Level: {item.booking?.level?.name || 'Recitation Session'}
                        </span>
                        <p className="text-muted-foreground text-[11px] mt-0.5">
                          Date: {new Date(item.booking?.start_time_utc).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-muted rounded font-medium">
                        Score: {item.overall_average || 'Submitted'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 border-t">
              <Button variant="ghost" size="sm" asChild className="w-full justify-between mt-3">
                <Link href="/app/assessments">View Submissions <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </CardFooter>
          </Card>
        )}
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
              {myPayouts.length > 0
                ? `${myPayouts.length} payout record${myPayouts.length === 1 ? '' : 's'} recorded.`
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
