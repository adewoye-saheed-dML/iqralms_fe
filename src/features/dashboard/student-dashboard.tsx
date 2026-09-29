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
  Video,
  CalendarCheck,
  User,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  Plus,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { schedulingKeys, progressKeys, assessmentKeys } from '@/lib/api/query-keys';
import { schedulingApi, type Booking, type WaitlistEntry } from '@/features/scheduling/api/scheduling';
import { progressApi, type ProgressSnapshot } from '@/features/progress/api/progress';
import { assessmentApi, type FamilyAssessment } from '@/features/assessment/api/assessment';

export function StudentDashboard() {
  const { user } = useAuth();
  const { activeAcademy } = useAcademy();

  // Load student's bookings
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: schedulingKeys.bookings(activeAcademy?.id),
    queryFn: () => schedulingApi.getMyBookings(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Load student's pending waitlist requests
  const { data: myWaitlist = [] } = useQuery<WaitlistEntry[]>({
    queryKey: schedulingKeys.waitlistMine(activeAcademy?.id),
    queryFn: () => schedulingApi.getMyWaitlist(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Load student's progress snapshots
  const { data: progressSnapshots = [] } = useQuery<ProgressSnapshot[]>({
    queryKey: progressKeys.snapshots(activeAcademy?.id),
    queryFn: () => progressApi.getAllSnapshots(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Load student's own assessments (student endpoint, not teacher endpoint)
  const { data: assessments = [] } = useQuery<FamilyAssessment[]>({
    queryKey: assessmentKeys.list(activeAcademy?.id, 'student-mine'),
    queryFn: () => assessmentApi.getStudentAssessments(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  const [activeBookingTab, setActiveBookingTab] = React.useState<'upcoming' | 'pending' | 'past'>('upcoming');

  const now = new Date();

  const sortedBookings = React.useMemo(() => {
    return [...bookings].sort(
      (a, b) => new Date(a.start_time_utc).getTime() - new Date(b.start_time_utc).getTime()
    );
  }, [bookings]);

  const upcomingBookings = React.useMemo(() => {
    return sortedBookings.filter(
      (b) => b.status !== 'cancelled' && new Date(b.start_time_utc).getTime() >= now.getTime() - 3600000
    );
  }, [sortedBookings, now]);

  const pastBookings = React.useMemo(() => {
    return sortedBookings
      .filter((b) => b.status === 'completed' || new Date(b.start_time_utc).getTime() < now.getTime() - 3600000)
      .reverse();
  }, [sortedBookings, now]);

  const openWaitlistEntries = React.useMemo(() => {
    return myWaitlist.filter((w) => w.status === 'open');
  }, [myWaitlist]);

  // Next scheduled class: favor the first upcoming booking, or fallback to first booking
  const nextClass = upcomingBookings[0] || (bookings.length > 0 ? bookings[0] : null);

  const myTeachers = React.useMemo(() => {
    const map = new Map<number, { id: number; name: string; username: string }>();
    bookings.forEach((b) => {
      if (b.teacher) {
        const id = b.teacher.id;
        const name = b.teacher.first_name
          ? `${b.teacher.first_name} ${b.teacher.last_name || ''}`.trim()
          : b.teacher.username;
        map.set(id, { id, name, username: b.teacher.username });
      }
    });
    return Array.from(map.values());
  }, [bookings]);

  // Minor student restriction: block dashboard when parent hasn't confirmed
  if (user?.is_minor && !user?.is_fully_active) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Student Learning Portal"
          description={`Assalamu Alaikum, ${user?.first_name || user?.username}! Your account is pending parent/guardian verification.`}
        />

        <Card className="border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-300">
              <AlertCircle className="h-7 w-7" />
            </div>
            <CardTitle className="text-xl text-amber-900 dark:text-amber-200">
              Parent / Guardian Verification Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              As a minor student, your account requires a linked parent or guardian before you can access your learning portal. An invitation has been sent to your parent&apos;s email address.
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Your parent needs to sign in and enter your Student Code to complete the linking process. Once your parent confirms, you will have full access to your dashboard, schedule, books, and all learning materials.
            </p>
            {user?.signup_code && (
              <div className="rounded-lg border border-amber-300 bg-white dark:bg-amber-950/60 p-4 mx-auto max-w-sm">
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Share this code with your parent/guardian:</p>
                <p className="font-mono text-2xl font-bold text-amber-900 dark:text-amber-200 tracking-widest">
                  {user.signup_code}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-center pt-0">
            <Button variant="outline" asChild size="sm">
              <Link href="/app/profile">View My Profile</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

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
        <CardFooter className="pt-0 flex flex-wrap gap-2">
          {nextClass ? (
            <>
              <Button asChild size="sm">
                <Link href={`/app/scheduling/${nextClass.id}`}>
                  <Video className="mr-1.5 h-4 w-4" /> Join Live Class
                </Link>
              </Button>
              <Button variant="outline" asChild size="sm">
                <Link href="/app/scheduling">All Bookings</Link>
              </Button>
            </>
          ) : (
            <Button asChild size="sm">
              <Link href="/app/scheduling/book">
                <Plus className="mr-1.5 h-4 w-4" /> Book a Lesson
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Dedicated My Bookings & Schedule Section */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">My Bookings &amp; Class Schedule</CardTitle>
              </div>
              <CardDescription className="text-xs mt-1">
                Your confirmed recitation sessions, class links, and pending allocation requests.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" asChild>
                <Link href="/app/scheduling/book">
                  <Plus className="mr-1.5 h-4 w-4" /> Book a Session
                </Link>
              </Button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 pt-3 border-t mt-3">
            <Button
              variant={activeBookingTab === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => setActiveBookingTab('upcoming')}
            >
              Upcoming Lessons ({upcomingBookings.length})
            </Button>
            <Button
              variant={activeBookingTab === 'pending' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => setActiveBookingTab('pending')}
            >
              Pending Requests ({openWaitlistEntries.length})
            </Button>
            <Button
              variant={activeBookingTab === 'past' ? 'default' : 'outline'}
              size="sm"
              className="text-xs h-7 px-2.5"
              onClick={() => setActiveBookingTab('past')}
            >
              Past Lessons ({pastBookings.length})
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {activeBookingTab === 'upcoming' && (
            upcomingBookings.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground space-y-2">
                <CalendarCheck className="h-8 w-8 mx-auto text-muted-foreground/60" />
                <p className="font-medium text-foreground">No upcoming recitation sessions scheduled.</p>
                <p className="text-[11px]">Book a 1-on-1 session with an academy Ustadh to continue your memorization.</p>
                <Button size="sm" asChild className="mt-2">
                  <Link href="/app/scheduling/book">Book a Class Session</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingBookings.map((b) => {
                  const teacherName = b.teacher?.first_name
                    ? `${b.teacher.first_name} ${b.teacher.last_name || ''}`.trim()
                    : b.teacher?.username || 'Ustadh';
                  return (
                    <div
                      key={b.id}
                      className="rounded-lg border p-3 bg-card hover:bg-muted/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">Ustadh {teacherName}</span>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] px-1.5 py-0">
                            <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Confirmed
                          </Badge>
                          {b.cohort && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              Cohort Class
                            </Badge>
                          )}
                        </div>
                        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-primary" />
                            {b.start_time_local || new Date(b.start_time_utc).toLocaleString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {b.level?.name && (
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {b.level.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button asChild size="sm" className="h-8 text-xs">
                          <Link href={`/app/scheduling/${b.id}`}>
                            <Video className="w-3.5 h-3.5 mr-1.5" /> Enter Classroom
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {activeBookingTab === 'pending' && (
            openWaitlistEntries.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                No pending lesson requests waiting for allocation.
              </div>
            ) : (
              <div className="space-y-2.5">
                {openWaitlistEntries.map((w) => {
                  const reqTeacher = w.requested_teacher
                    ? `Ustadh ${w.requested_teacher.first_name || w.requested_teacher.username}`
                    : 'Any Available Instructor';
                  return (
                    <div
                      key={w.id}
                      className="rounded-lg border border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">Requested: {reqTeacher}</span>
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] px-1.5 py-0">
                            <Hourglass className="w-2.5 h-2.5 mr-1" /> Pending Allocation
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Requested Slot: {w.requested_start_utc ? new Date(w.requested_start_utc).toLocaleString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : 'Flexible'} ({w.requested_duration_minutes || 30} mins)
                        </p>
                      </div>
                      <div className="text-[11px] text-amber-800 dark:text-amber-300">
                        Academy leadership is reviewing teacher capacity.
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {activeBookingTab === 'past' && (
            pastBookings.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                No past recitation lessons recorded yet.
              </div>
            ) : (
              <div className="space-y-2">
                {pastBookings.slice(0, 5).map((b) => {
                  const teacherName = b.teacher?.first_name
                    ? `${b.teacher.first_name} ${b.teacher.last_name || ''}`.trim()
                    : b.teacher?.username || 'Ustadh';
                  return (
                    <div
                      key={b.id}
                      className="rounded-lg border p-2.5 bg-muted/20 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-medium text-foreground">Ustadh {teacherName}</span>
                        <div className="text-muted-foreground text-[11px]">
                          {b.start_time_local || new Date(b.start_time_utc).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">Completed</Badge>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* Teacher Availability & Class Booking Section */}
      <Card className="border-primary/20 bg-muted/20">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Teacher Schedules &amp; Class Booking</CardTitle>
            </div>
            <Badge variant="outline" className="text-xs bg-background">
              {myTeachers.length > 0 ? `${myTeachers.length} ${myTeachers.length === 1 ? 'Instructor' : 'Instructors'}` : 'Verified Availability'}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Ustadhs declare recurring weekly working hours. Request a class during open teaching windows for automatic confirmation, or submit your preferred time for management review and teacher allocation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {myTeachers.length > 0 ? (
            <div className="rounded-lg border bg-background p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Your Ustadhs &amp; Instructors:</span>
                <span className="text-[11px] text-muted-foreground">Click to view weekly schedule</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                {myTeachers.map((t) => (
                  <Link
                    key={t.id}
                    href={`/app/scheduling?tab=availability&teacher_id=${t.id}`}
                    className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-muted/60 hover:border-primary/40 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px] shrink-0">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-xs truncate group-hover:text-primary transition-colors">
                        Ustadh {t.name}
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-background p-3 text-xs text-muted-foreground">
              New to the academy? Book your first session with any available Ustadh. Academy teachers will guide you through your track level.
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button size="sm" asChild>
              <Link href="/app/scheduling/book">
                <CalendarCheck className="mr-1.5 h-4 w-4" /> Book a Class / Request Slot
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/scheduling?tab=availability">
                <Calendar className="mr-1.5 h-4 w-4" /> View All Teacher Schedules
              </Link>
            </Button>
          </div>
        </CardContent>
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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <BookOpen className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Books & Materials</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Browse authentic syllabus books, texts, worksheets, and resources.
          </CardContent>
          <CardFooter className="pt-0">
            <Button variant="outline" size="sm" asChild className="w-full text-xs">
              <Link href="/app/curriculum?tab=materials">Open Books</Link>
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
