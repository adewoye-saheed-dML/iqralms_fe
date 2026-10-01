'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth } from '@/lib/auth/auth-provider';
import {
  assessmentApi,
  resolveAssessmentMediaUrl,
  StudentAssignment,
  AssignmentSubmission,
  getDisplayName,
} from '../api/assessment';
import { assessmentKeys, familyKeys } from '@/lib/api/query-keys';
import { familyApi } from '@/features/family/api/family';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Mic,
  Percent,
  Play,
  User,
  Users,
  Volume2,
} from 'lucide-react';
import { AssignmentSubmissionModal } from './assignment-submission-modal';

export function ParentWardAssessmentView() {
  const { activeAcademy } = useAcademy();
  const academyId = activeAcademy?.id;
  const { user } = useAuth();

  const isParent = user?.role === 'parent';
  const isStudent = user?.role === 'student';

  const [selectedStudentId, setSelectedStudentId] = React.useState<number | undefined>(undefined);
  const [activeModalItem, setActiveModalItem] = React.useState<{
    assignment: StudentAssignment;
    submission: AssignmentSubmission | null;
  } | null>(null);

  // Fetch children if parent
  const { data: children = [], isLoading: isLoadingChildren } = useQuery({
    queryKey: academyId ? familyKeys.academy(academyId) : familyKeys.mine(),
    queryFn: () => (academyId ? familyApi.getAcademyChildren(academyId) : familyApi.getMyChildren()),
    enabled: isParent,
  });

  // Set default selected child
  React.useEffect(() => {
    if (isParent && children.length > 0 && !selectedStudentId) {
      setSelectedStudentId(children[0].id);
    }
  }, [children, isParent, selectedStudentId]);

  const targetStudentId = isStudent ? user?.id : selectedStudentId;

  // Fetch ward progress
  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: assessmentKeys.wardProgress(academyId, targetStudentId),
    queryFn: () =>
      academyId ? assessmentApi.getWardProgress(academyId, targetStudentId) : null,
    enabled: !!academyId && (isStudent || !!targetStudentId),
  });

  const stats = {
    total_assigned: progressData?.total_assigned ?? 0,
    submitted_count: progressData?.total_submitted ?? 0,
    graded_count: progressData?.total_graded ?? 0,
    average_score: progressData?.average_score_pct ?? null,
  };

  const items: Array<{ assignment: StudentAssignment; submission: AssignmentSubmission | null }> =
    (progressData?.recent_submissions || []).map((sub) => ({
      assignment: {
        id: sub.assignment,
        title: sub.assignment_title,
        submission_type: sub.submission_type,
        max_score: sub.max_score,
        surah_number: sub.surah_number,
        ayah_start: sub.ayah_start,
        ayah_end: sub.ayah_end,
        description: '',
        due_date: null,
        created_at: sub.submitted_at,
        updated_at: sub.submitted_at,
        track: null,
        track_name: null,
        level: null,
        level_name: null,
        assigned_student: null,
        assigned_student_name: null,
        rubric: null,
        resource_file: null,
        created_by: sub.graded_by || null,
        submissions_count: 1,
        pending_submissions_count: 0,
      } as StudentAssignment,
      submission: sub,
    }));

  return (
    <div className="space-y-6">
      {/* Header & Child Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {isParent ? "Ward's Quran Homework & Progress" : 'My Homework & Progress'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Track recitation recordings, completed worksheets, and teacher evaluations.
          </p>
        </div>

        {isParent && children.length > 1 && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedStudentId ? String(selectedStudentId) : ''}
              onValueChange={(val) => setSelectedStudentId(parseInt(val, 10))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => {
                  const childName = `${child.first_name || ''} ${child.last_name || ''}`.trim() || child.email || `Child #${child.id}`;
                  return (
                    <SelectItem key={child.id} value={String(child.id)}>
                      {childName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Total Assigned</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              <span>{stats.total_assigned}</span>
              <BookOpen className="h-5 w-5 text-muted-foreground opacity-60" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Completed / Submitted</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              <span>{stats.submitted_count}</span>
              <Clock className="h-5 w-5 text-blue-500 opacity-60" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Evaluated & Graded</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              <span>{stats.graded_count}</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-500 opacity-60" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Average Score</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between text-primary">
              <span>{stats.average_score !== null ? `${stats.average_score}%` : 'N/A'}</span>
              <Award className="h-5 w-5 opacity-60" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Progress & Submissions List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Assignments & Recitations
        </h3>

        {isLoadingProgress ? (
          <div className="p-8 text-center text-muted-foreground">Loading progress and assignments...</div>
        ) : items.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground space-y-2">
            <BookOpen className="h-10 w-10 mx-auto opacity-40" />
            <p className="font-medium">No assignments found for this student yet.</p>
            <p className="text-xs">Assignments given by teachers will appear here automatically.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {items.map(({ assignment, submission }) => {
              const isGraded = submission?.status === 'graded';
              const isSubmitted = submission?.status === 'submitted';
              const needsRevision = submission?.status === 'resubmission_requested';

              return (
                <Card key={assignment.id} className="overflow-hidden border transition-all hover:shadow-sm">
                  <div className="p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-base">{assignment.title}</h4>
                          <Badge variant="outline" className="text-xs capitalize">
                            {assignment.submission_type}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Assigned by {assignment.created_by ? getDisplayName(assignment.created_by) : 'Teacher'}
                          {assignment.due_date && (
                            <> • Due: {new Date(assignment.due_date).toLocaleDateString()}</>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isGraded ? (
                          <Badge className="bg-emerald-600 text-white font-medium">
                            Graded: {submission.score} / {assignment.max_score}
                          </Badge>
                        ) : isSubmitted ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Submitted • Pending Grading
                          </Badge>
                        ) : needsRevision ? (
                          <Badge variant="destructive">Revision Needed</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Not Submitted
                          </Badge>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveModalItem({ assignment, submission })}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>

                    {/* Quran Recitation / Ayah Reference Info */}
                    {(assignment.surah_number || assignment.ayah_start) && (
                      <div className="text-xs bg-muted/40 p-2.5 rounded-md flex items-center gap-3">
                        <span className="font-semibold text-primary">Recitation:</span>
                        {assignment.surah_number && <span>Surah #{assignment.surah_number}</span>}
                        {(assignment.ayah_start || assignment.ayah_end) && (
                          <span>
                            Ayat {assignment.ayah_start || 1} - {assignment.ayah_end || 'End'}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Recitation Audio Player (if child submitted audio) */}
                    {submission?.audio_recording && (
                      <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-md space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                            <Volume2 className="h-4 w-4" />
                            Child&apos;s Recitation Recording
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(submission.submitted_at).toLocaleString()}
                          </span>
                        </div>
                        <audio
                          controls
                          className="w-full h-9"
                          src={resolveAssessmentMediaUrl(submission.audio_recording) || ''}
                        />
                      </div>
                    )}

                    {/* Teacher Feedback Banner (if graded) */}
                    {isGraded && submission && (
                      <div className="p-3 bg-muted/40 rounded-md border space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-primary flex items-center gap-1">
                            <Award className="h-3.5 w-3.5" />
                            Teacher Feedback:
                          </span>
                          <span>
                            Score: {submission.score} / {assignment.max_score} pts
                          </span>
                        </div>
                        {submission.teacher_feedback && (
                          <p className="text-xs text-foreground bg-background p-2.5 rounded border">
                            &ldquo;{submission.teacher_feedback}&rdquo;
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Dialog for Student / Parent Details */}
      {activeModalItem && (
        <AssignmentSubmissionModal
          open={!!activeModalItem}
          onOpenChange={(open) => {
            if (!open) setActiveModalItem(null);
          }}
          assignment={activeModalItem.assignment}
          submission={activeModalItem.submission}
        />
      )}
    </div>
  );
}
