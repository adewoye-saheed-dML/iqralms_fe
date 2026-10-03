'use client';

import * as React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { studentKeys, curriculumKeys, assessmentKeys } from '@/lib/api/query-keys';
import { studentsApi, type StudentDetail as StudentDetailModel } from '../api/students';
import { curriculumApi, type TrackBrief, type Level } from '@/features/curriculum/api/curriculum';
import { assessmentApi } from '@/features/assessment/api/assessment';
import { ApiError } from '@/lib/api/errors';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Calendar,
  Mail,
  User,
  Clock,
  Award,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { Label } from '@/components/ui/label';
import { can } from '@/lib/permissions/capabilities';

import { useTeacherAccessControl } from '@/features/assessment/lib/access-control';

interface StudentDetailProps {
  enrollmentId: number;
}

export function StudentDetail({ enrollmentId }: StudentDetailProps) {
  const queryClient = useQueryClient();
  const { activeAcademy, activeRole } = useAcademy();
  const accessControl = useTeacherAccessControl();
  const [status, setStatus] = React.useState<'active' | 'inactive' | ''>('');
  const [successMessage, setSuccessMessage] = React.useState('');

  const isOwnerAdmin = activeRole === 'owner' || activeRole === 'admin';
  const canManage = isOwnerAdmin;

  // 1. Fetch Student Enrollment Details
  const {
    data: student,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: studentKeys.detail(activeAcademy?.id, enrollmentId),
    queryFn: async () => {
      if (!activeAcademy?.id) throw new Error('No academy context');
      if (isOwnerAdmin) {
        return studentsApi.getStudent(activeAcademy.id, enrollmentId);
      }
      // For teachers, parents, staff:
      // The individual /students/{id}/ endpoint is restricted to owner/admin.
      // First attempt to resolve the student record from role-accessible /students/mine/.
      try {
        const myStudents = await studentsApi.getMyStudents(activeAcademy.id);
        const match = myStudents.find(
          (s) => Number(s.id) === Number(enrollmentId) || Number(s.user_id) === Number(enrollmentId)
        );
        if (match) {
          return match as unknown as StudentDetailModel;
        }
      } catch {
        // Fall back to getStudent
      }
      return studentsApi.getStudent(activeAcademy.id, enrollmentId);
    },
    enabled: !!activeAcademy && !!activeRole,
  });

  const canAccessStudentAssessments =
    accessControl.isOwnerAdmin ||
    accessControl.canTeacherAccessStudent({
      user_id: student?.user_id,
      id: student?.id,
      track_id: student?.track_id,
    });

  // 2. Fetch Academy Curriculum Tracks (to resolve track name / subject)
  const { data: tracks = [] } = useQuery<TrackBrief[]>({
    queryKey: curriculumKeys.tracks(activeAcademy?.id),
    queryFn: async () => {
      try {
        if (!activeAcademy?.id) return [];
        return (await curriculumApi.getTracks(activeAcademy.id)) ?? [];
      } catch {
        return [];
      }
    },
    enabled: !!activeAcademy?.id,
  });

  // 3. Fetch Academy Curriculum Levels (to resolve level name)
  const { data: levels = [] } = useQuery<Level[]>({
    queryKey: curriculumKeys.levels(activeAcademy?.id),
    queryFn: async () => {
      try {
        if (!activeAcademy?.id) return [];
        return (await curriculumApi.getLevels(activeAcademy.id)) ?? [];
      } catch {
        return [];
      }
    },
    enabled: !!activeAcademy?.id,
  });

  // 4. Fetch Student List (to resolve assigned teacher name)
  const { data: academyStudents = [] } = useQuery({
    queryKey: isOwnerAdmin ? studentKeys.all(activeAcademy?.id) : studentKeys.mine(activeAcademy?.id),
    queryFn: async () => {
      try {
        if (!activeAcademy?.id) return [];
        return isOwnerAdmin
          ? (await studentsApi.getAcademyStudents(activeAcademy.id)) ?? []
          : (await studentsApi.getMyStudents(activeAcademy.id)) ?? [];
      } catch {
        return [];
      }
    },
    enabled: !!activeAcademy?.id,
  });

  // 5. Fetch Student Academic / Ward Progress (homework & performance stats)
  const { data: progress } = useQuery({
    queryKey: assessmentKeys.wardProgress(activeAcademy?.id, student?.user_id),
    queryFn: async () => {
      try {
        if (!activeAcademy?.id || !student?.user_id) return null;
        return (await assessmentApi.getWardProgress(activeAcademy.id, student.user_id)) ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!activeAcademy?.id && !!student?.user_id && canAccessStudentAssessments,
  });

  const currentStatus = status || student?.enrollment_status || '';

  const updateMutation = useMutation({
    mutationFn: async (newStatus: 'active' | 'inactive') => {
      if (!activeAcademy) throw new Error('No academy context');
      return studentsApi.updateStudentStatus(activeAcademy.id, enrollmentId, { status: newStatus });
    },
    onSuccess: () => {
      setSuccessMessage('Enrollment status updated successfully.');
      queryClient.invalidateQueries({
        queryKey: studentKeys.detail(activeAcademy?.id, enrollmentId),
      });
      queryClient.invalidateQueries({ queryKey: studentKeys.all(activeAcademy?.id) });
      setTimeout(() => setSuccessMessage(''), 3000);
    },
  });

  const handleStatusChange = (val: string) => {
    if (val === 'active' || val === 'inactive') {
      setStatus(val);
    }
  };

  const handleSave = () => {
    if (status && status !== student?.enrollment_status) {
      setSuccessMessage('');
      updateMutation.mutate(status as 'active' | 'inactive');
    }
  };

  const registeredTrack = React.useMemo(() => {
    if (!student?.track_id) return null;
    return tracks.find((t) => t.id === student.track_id) || null;
  }, [tracks, student?.track_id]);

  const registeredLevel = React.useMemo(() => {
    if (!student?.level_id) return null;
    return levels.find((l) => l.id === student.level_id) || null;
  }, [levels, student?.level_id]);

  const enrolledStudent = React.useMemo(() => {
    return academyStudents.find((s) => s.id === enrollmentId || s.user_id === student?.user_id);
  }, [academyStudents, enrollmentId, student?.user_id]);

  const assignedTeacherName = enrolledStudent?.teacher_name || null;

  if (!activeAcademy) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <LoadingState />
      </div>
    );
  }

  if (isError) {
    const is404 =
      (error instanceof ApiError && error.status === 404) ||
      (error as any)?.status === 404 ||
      (error as any)?.statusCode === 404;
    if (is404) {
      return (
        <ErrorState
          title="Student Not Found"
          message="The requested student enrollment was not found in this academy."
        />
      );
    }
    const is403 =
      (error instanceof ApiError && error.status === 403) ||
      (error as any)?.status === 403 ||
      (error as any)?.statusCode === 403 ||
      (error instanceof Error && error.message.toLowerCase().includes('manage memberships'));
    if (is403) {
      return (
        <ErrorState
          title="Student Access Restricted"
          message="You do not have permission to view this student profile, or the student is not assigned to your classes."
        />
      );
    }
    return (
      <ErrorState
        title="Error loading student"
        message={error instanceof Error ? error.message : 'An unexpected error occurred'}
      />
    );
  }

  if (!student) return null;

  const hasChanges = status && status !== student.enrollment_status;

  let errorMessage = '';
  if (updateMutation.isError) {
    if (updateMutation.error instanceof ApiError) {
      if (updateMutation.error.status === 403) {
        errorMessage = 'You do not have permission to manage this student.';
      } else {
        errorMessage = updateMutation.error.message || 'An unexpected error occurred.';
      }
    } else {
      errorMessage = updateMutation.error.message;
    }
  }

  const fullName = [student.first_name, student.last_name].filter(Boolean).join(' ').trim();
  const displayName = fullName || student.username || 'Student';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Student Profile Overview Card */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary text-xl font-bold border border-primary/20">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl font-bold">{displayName}</CardTitle>
                  <Badge variant={student.enrollment_status === 'active' ? 'default' : 'secondary'} className="capitalize">
                    {student.enrollment_status === 'active' ? (
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      student.enrollment_status
                    )}
                  </Badge>
                  {isOwnerAdmin && student.is_minor && (
                    <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                      Minor (Under 18)
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">@{student.username}</span>
                  {isOwnerAdmin && student.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {student.email}
                    </span>
                  )}
                  <span>User ID: #{student.user_id}</span>
                  <span>Enrollment ID: #{student.id}</span>
                </div>
              </div>
            </div>

            {canManage && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/app/curriculum?tab=allocations">
                    <GraduationCap className="h-4 w-4 mr-1.5" />
                    Subject Allocation
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid: Subject Registration & Contact Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Subject & Curriculum Registration Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Registered Subject &amp; Track</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Current curriculum subject, ordered level, and assigned mentor.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 bg-muted/20 space-y-3">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Subject / Curriculum Track
                </span>
                {registeredTrack ? (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-base font-bold text-foreground">{registeredTrack.name}</span>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      slug: {registeredTrack.slug}
                    </Badge>
                  </div>
                ) : (
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      No subject registered yet
                    </span>
                    {canManage && (
                      <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                        <Link href="/app/curriculum?tab=allocations">Assign Track</Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t pt-3">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Current Level Milestone
                </span>
                {registeredLevel ? (
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {registeredLevel.name}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5 italic">
                    {student.level_id ? `Level ID #${student.level_id}` : 'Level Pending Initial Placement'}
                  </p>
                )}
              </div>

              <div className="border-t pt-3">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Assigned Teacher / Instructor
                </span>
                {assignedTeacherName ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{assignedTeacherName}</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5 italic">
                    No dedicated teacher allocated yet
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          {canManage && (
            <CardFooter className="pt-0 border-t">
              <Button variant="ghost" size="sm" asChild className="w-full justify-between mt-3 text-xs">
                <Link href="/app/curriculum?tab=allocations">
                  <span>Manage Track Allocations</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </CardFooter>
          )}
        </Card>

        {/* Personal & Demographics Information Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Personal &amp; Contact Details</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Learner identity, demographic category, and registration dates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-4 bg-muted/20">
              <div>
                <span className="text-muted-foreground block text-[11px]">Full Name</span>
                <span className="font-semibold text-sm text-foreground">{fullName || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Username</span>
                <span className="font-semibold text-sm text-foreground">@{student.username}</span>
              </div>

              {isOwnerAdmin && student.email && (
                <div className="border-t pt-2 col-span-2">
                  <span className="text-muted-foreground block text-[11px]">Email Address</span>
                  <span className="font-medium text-foreground">{student.email}</span>
                </div>
              )}

              {isOwnerAdmin && student.date_of_birth && (
                <div className="border-t pt-2">
                  <span className="text-muted-foreground block text-[11px]">Date of Birth</span>
                  <span className="font-medium text-foreground">{student.date_of_birth}</span>
                </div>
              )}

              <div className="border-t pt-2">
                <span className="text-muted-foreground block text-[11px]">Enrolled On</span>
                <span className="font-medium text-foreground">
                  {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="border-t pt-2">
                <span className="text-muted-foreground block text-[11px]">Last Updated</span>
                <span className="font-medium text-foreground">
                  {student.updated_at ? new Date(student.updated_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-0 border-t">
            <Button variant="ghost" size="sm" asChild className="w-full justify-between mt-3 text-xs">
              <Link href="/app/students">
                <span>{isOwnerAdmin ? 'View All Enrolled Students' : 'View Assigned Students'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Academic Performance & Homework Stats Card */}
      {canAccessStudentAssessments ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Academic Performance &amp; Submissions</CardTitle>
              </div>
              <Button variant="outline" size="sm" asChild className="text-xs h-7">
                <Link href="/app/assessments">
                  Assessment Oversight
                </Link>
              </Button>
            </div>
            <CardDescription className="text-xs">
              Summary of homework, recitation audio recordings, and rubric scoring for this student.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-lg border p-3 bg-card text-center">
                <span className="text-[11px] text-muted-foreground block font-medium">Assigned Tasks</span>
                <span className="text-2xl font-bold text-foreground mt-0.5 block">
                  {progress?.total_assigned ?? 0}
                </span>
              </div>
              <div className="rounded-lg border p-3 bg-card text-center">
                <span className="text-[11px] text-muted-foreground block font-medium">Submissions</span>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">
                  {progress?.total_submitted ?? 0}
                </span>
              </div>
              <div className="rounded-lg border p-3 bg-card text-center">
                <span className="text-[11px] text-muted-foreground block font-medium">Graded</span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  {progress?.total_graded ?? 0}
                </span>
              </div>
              <div className="rounded-lg border p-3 bg-card text-center">
                <span className="text-[11px] text-muted-foreground block font-medium">Average Score</span>
                <span className="text-2xl font-bold text-primary mt-0.5 block">
                  {progress?.average_score_pct ? `${progress.average_score_pct}%` : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-amber-200/60 bg-amber-50/20 dark:bg-amber-950/10">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <Shield className="h-5 w-5" />
              <CardTitle className="text-base">Assessments &amp; Performance Protected</CardTitle>
            </div>
            <CardDescription className="text-xs text-amber-700/80 dark:text-amber-400">
              Student Personal Learning Space Boundary
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Assessment evaluations, recitation audio recordings, and homework grades are recorded directly to the student&apos;s personal learning space and are only disclosed to their attached instructor offering this subject. You are not attached to this student for this curriculum subject.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Enrollment Status Management Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Enrollment Status Administration</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Manage whether this student is actively taking classes or temporarily inactive in this academy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="statusSelect">Enrollment Status</Label>
            <div className="flex items-center gap-4">
              <Select
                value={currentStatus}
                onValueChange={handleStatusChange}
                disabled={updateMutation.isPending || !canManage}
              >
                <SelectTrigger id="statusSelect" className="w-[200px]">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {canManage && (
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges || updateMutation.isPending}
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              )}
            </div>
            {!canManage && (
              <p className="text-muted-foreground text-xs">
                Only owners and administrators can change student enrollment status.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
