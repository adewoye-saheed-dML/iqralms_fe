'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Calendar,
  CheckSquare,
  ArrowRight,
  Video,
  Link2,
  AlertCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { schedulingKeys, assessmentKeys, studentKeys } from '@/lib/api/query-keys';
import { schedulingApi, type Booking } from '@/features/scheduling/api/scheduling';
import { assessmentApi, type FamilyAssessment } from '@/features/assessment/api/assessment';
import { studentsApi } from '@/features/students/api/students';
import { familyApi, type LinkedStudent } from '@/features/family/api/family';
import { ApiError } from '@/lib/api/errors';

export function ParentDashboard() {
  const { user, refreshAuth } = useAuth();
  const { activeAcademy } = useAcademy();
  const queryClient = useQueryClient();

  // Student code linking state
  const [studentCode, setStudentCode] = React.useState('');
  const [isLinkingChild, setIsLinkingChild] = React.useState(false);
  const [linkSuccess, setLinkSuccess] = React.useState(false);
  const [linkError, setLinkError] = React.useState<string | null>(null);
  const [showLinkInput, setShowLinkInput] = React.useState(false);

  // Load family schedule bookings
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: schedulingKeys.bookings(activeAcademy?.id),
    queryFn: () => schedulingApi.getMyBookings(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Load parent's linked children (global accounts relation)
  const { data: linkedChildren = [], refetch: refetchLinkedChildren } = useQuery<LinkedStudent[]>({
    queryKey: ['family', 'my-children'],
    queryFn: () => familyApi.getMyChildren(),
  });

  // Load parent's enrolled children in this academy
  const { data: children = [], refetch: refetchChildren } = useQuery({
    queryKey: studentKeys.mine(activeAcademy?.id),
    queryFn: () => studentsApi.getMyStudents(activeAcademy!.id),
    enabled: !!activeAcademy?.id,
  });

  // Load assessment results for linked children
  const firstChildId = children[0]?.id || linkedChildren[0]?.id;
  const { data: assessments = [] } = useQuery<FamilyAssessment[]>({
    queryKey: assessmentKeys.list(activeAcademy?.id, firstChildId ? `child-${firstChildId}` : 'parent-children'),
    queryFn: () => (firstChildId ? assessmentApi.getChildAssessments(activeAcademy!.id, firstChildId) : Promise.resolve([])),
    enabled: !!activeAcademy?.id && !!firstChildId,
  });

  const hasChildren = linkedChildren.length > 0 || children.length > 0;

  const handleLinkChild = async (event: React.FormEvent) => {
    event.preventDefault();
    setLinkError(null);

    if (!studentCode.trim()) {
      setLinkError('Please enter the student code provided by your child.');
      return;
    }

    setIsLinkingChild(true);

    try {
      await familyApi.createParentLink({ student_code: studentCode.trim() });
      setLinkSuccess(true);
      setStudentCode('');
      setShowLinkInput(false);
      await refreshAuth();
      await refetchChildren();
      await refetchLinkedChildren();
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: studentKeys.mine(activeAcademy?.id) });
      queryClient.invalidateQueries({ queryKey: ['family', 'my-children'] });
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        const msg = err.message || '';
        const errData = err.data as Record<string, unknown> | undefined;
        const errDataStr = errData ? JSON.stringify(errData).toLowerCase() : '';
        const isAlreadyLinked =
          msg.toLowerCase().includes('already exists') ||
          msg.toLowerCase().includes('already linked') ||
          errDataStr.includes('already exists') ||
          errDataStr.includes('already linked');

        if (isAlreadyLinked) {
          setLinkSuccess(true);
          setStudentCode('');
          setShowLinkInput(false);
          await refreshAuth();
          await refetchChildren();
          await refetchLinkedChildren();
          queryClient.invalidateQueries({ queryKey: studentKeys.mine(activeAcademy?.id) });
          queryClient.invalidateQueries({ queryKey: ['family', 'my-children'] });
          return;
        }

        if (err.status === 404 || msg.toLowerCase().includes('not found')) {
          setLinkError('No student found with that code. Please check the code and try again.');
        } else {
          setLinkError(msg || 'Failed to link student. Please try again.');
        }
      } else if (err instanceof Error) {
        const msg = err.message;
        if (msg.toLowerCase().includes('already exists') || msg.toLowerCase().includes('already linked')) {
          setLinkSuccess(true);
          setStudentCode('');
          setShowLinkInput(false);
          await refreshAuth();
          await refetchChildren();
          await refetchLinkedChildren();
          queryClient.invalidateQueries({ queryKey: studentKeys.mine(activeAcademy?.id) });
          queryClient.invalidateQueries({ queryKey: ['family', 'my-children'] });
          return;
        }
        setLinkError(err.message);
      } else {
        setLinkError('An unexpected error occurred while linking the student.');
      }
    } finally {
      setIsLinkingChild(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Parent Portal"
        description={`Welcome, ${user?.first_name || user?.username}. Monitoring your family's Quran learning at ${activeAcademy?.name || 'the academy'}.`}
      />

      {/* Linked Children Card */}
      {linkedChildren.length > 0 && (
        <Card className="border shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">My Children</CardTitle>
                </div>
                <CardDescription className="text-xs mt-1">
                  Children linked to your account and their verification status.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setShowLinkInput(!showLinkInput)}
              >
                <Link2 className="mr-1.5 h-3.5 w-3.5" />
                {showLinkInput ? 'Hide Link Form' : 'Link Another Child'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {linkedChildren.map((kid) => {
                const kidName = kid.first_name
                  ? `${kid.first_name} ${kid.last_name || ''}`.trim()
                  : kid.username;
                return (
                  <div
                    key={kid.id}
                    className="rounded-lg border p-3.5 bg-card hover:bg-muted/10 transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{kidName}</span>
                        {kid.is_fully_active ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300">
                            Active &amp; Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300">
                            Pending Verification
                          </span>
                        )}
                      </div>
                      <div className="text-muted-foreground text-[11px] flex flex-col gap-0.5">
                        <span>Username: @{kid.username}</span>
                        {kid.email && <span>Email: {kid.email}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Link Child Form (prominent when no children linked, or when toggled) */}
      {(!hasChildren || showLinkInput) && !linkSuccess && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Link Your Child&apos;s Account</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Enter the <strong>Student Code</strong> your child received during registration to link their account and enable full access to their learning portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {linkError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">{linkError}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleLinkChild} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="studentCode" className="sr-only">Student Code</Label>
                <Input
                  id="studentCode"
                  type="text"
                  required
                  placeholder="Enter Student Code (e.g. ABC123XY)"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value.toUpperCase())}
                  disabled={isLinkingChild}
                  className="font-mono tracking-wider"
                />
              </div>
              <Button
                type="submit"
                disabled={isLinkingChild || !studentCode.trim()}
              >
                {isLinkingChild ? 'Linking...' : 'Link Child'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Link Success Alert */}
      {linkSuccess && (
        <Alert className="border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription className="text-sm font-medium">
            Child account linked successfully! Their learning portal is now verified and active.
          </AlertDescription>
        </Alert>
      )}

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
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-foreground">
                          {booking.level?.name || 'Recitation Session'}
                        </span>
                        {booking.student && (
                          <span className="text-[11px] font-normal text-muted-foreground">
                            • Child: {booking.student.first_name || booking.student.username}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {booking.teacher && `Teacher: ${booking.teacher.first_name || booking.teacher.username} • `}
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
                    <div className="flex items-center gap-2">
                      <span className="capitalize px-2 py-0.5 bg-muted rounded text-[10px]">
                        {booking.status}
                      </span>
                      {booking.status === 'scheduled' && (
                        <Button size="sm" variant="outline" className="text-xs h-7 px-2" asChild>
                          <Link href={`/app/scheduling/${booking.id}`}>
                            <Video className="mr-1 h-3 w-3" /> Join Class
                          </Link>
                        </Button>
                      )}
                    </div>
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

        {/* Recent Evaluations & Feedback */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Recent Evaluations &amp; Feedback</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Recitation evaluations, rubric scores, and instructor remarks for your children.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {assessments.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
                No recent evaluations recorded yet. Evaluations appear as instructors review recitations and sessions.
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
                        {assessment.rubric_name || 'Session Evaluation'}
                      </span>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        Track: {assessment.track} • Score: {assessment.overall_average} / 5.0
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(assessment.assessed_at).toLocaleDateString()}
                    </span>
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
            View your registered children and track their active academy enrollments.
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
