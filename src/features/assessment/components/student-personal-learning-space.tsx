'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth } from '@/lib/auth/auth-provider';
import {
  assessmentApi,
  resolveAssessmentMediaUrl,
  FamilyAssessment,
  StudentAssignment,
  AssignmentSubmission,
  getDisplayName,
  SUBMISSION_TYPE_LABELS,
} from '../api/assessment';
import { assessmentKeys } from '@/lib/api/query-keys';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  GraduationCap,
  Mic,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { AssignmentSubmissionModal } from './assignment-submission-modal';

export function StudentPersonalLearningSpace() {
  const { activeAcademy } = useAcademy();
  const academyId = activeAcademy?.id;
  const { user } = useAuth();

  const [selectedAssignmentForSubmission, setSelectedAssignmentForSubmission] =
    React.useState<StudentAssignment | null>(null);

  // 1. Fetch Ward/Student Academic Progress Summary
  const { data: progressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: assessmentKeys.wardProgress(academyId, user?.id),
    queryFn: () => (academyId && user?.id ? assessmentApi.getWardProgress(academyId, user.id) : null),
    enabled: !!academyId && !!user?.id,
  });

  // 2. Fetch Session Recitation Assessments (live class assessments)
  const { data: sessionAssessments = [], isLoading: isLoadingSessions } = useQuery<FamilyAssessment[]>({
    queryKey: assessmentKeys.list(academyId, 'student-mine'),
    queryFn: () => (academyId ? assessmentApi.getStudentAssessments(academyId) : []),
    enabled: !!academyId,
  });

  // 3. Fetch Continuous Homework & Recitation Assignments
  const { data: assignments = [], isLoading: isLoadingAssignments } = useQuery({
    queryKey: assessmentKeys.assignments(academyId),
    queryFn: () => (academyId ? assessmentApi.getAssignments(academyId) : []),
    enabled: !!academyId,
  });

  const stats = {
    total_assigned: progressData?.total_assigned ?? assignments.length,
    submitted_count: progressData?.total_submitted ?? 0,
    graded_count: progressData?.total_graded ?? 0,
    average_score: progressData?.average_score_pct ?? null,
  };

  // Join all evaluations: session assessments + graded/submitted homework submissions
  const joinedAssessments = React.useMemo(() => {
    const list: Array<{
      id: string;
      source: 'session' | 'assignment';
      title: string;
      subjectTrack?: string | null;
      date: string;
      scoreDisplay: string;
      status: 'graded' | 'submitted' | 'resubmission_requested';
      teacherName: string;
      teacherFeedback?: string;
      audioUrl?: string | null;
      criteriaScores?: Array<{ criterion: string; score: number | string }>;
      assignmentRef?: StudentAssignment;
      submissionRef?: AssignmentSubmission;
    }> = [];

    // Add session assessments
    for (const sa of sessionAssessments) {
      const criteria = (sa.scores || []).map((sc: any) => ({
        criterion: sc.criterion_name || `Criterion #${sc.criterion || ''}`,
        score: sc.score,
      }));

      list.push({
        id: `session-${sa.id}`,
        source: 'session',
        title: sa.booking?.level?.name ? `${sa.booking.level.name} Class Evaluation` : 'Class Recitation Evaluation',
        subjectTrack: sa.track || 'Quran Recitation',
        date: sa.assessed_at || sa.booking?.start_time_utc || '',
        scoreDisplay: sa.overall_average ? `${sa.overall_average} / 10` : 'Evaluated',
        status: 'graded',
        teacherName: sa.assessed_by || 'Assigned Instructor',
        teacherFeedback: sa.teacher_summary,
        criteriaScores: criteria.length > 0 ? criteria : undefined,
      });
    }

    // Add homework submissions
    const recentSubs = progressData?.recent_submissions || [];
    for (const sub of recentSubs) {
      list.push({
        id: `submission-${sub.id}`,
        source: 'assignment',
        title: sub.assignment_title || 'Quran Homework',
        subjectTrack: sub.submission_type ? SUBMISSION_TYPE_LABELS[sub.submission_type] : 'Homework Assignment',
        date: sub.submitted_at,
        scoreDisplay: sub.score !== null && sub.score !== undefined ? `${sub.score} / ${sub.max_score}` : 'Pending Grade',
        status: sub.status as 'graded' | 'submitted' | 'resubmission_requested',
        teacherName: sub.graded_by ? getDisplayName(sub.graded_by) : 'Instructor',
        teacherFeedback: sub.teacher_feedback || undefined,
        audioUrl: sub.audio_recording,
      });
    }

    // Sort newest first
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessionAssessments, progressData]);

  const isLoading = isLoadingProgress || isLoadingSessions || isLoadingAssignments;

  return (
    <div className="space-y-6">
      {/* Student Personal Space Header */}
      <div className="rounded-xl border bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Personal Learning Space &amp; Assessment Records
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              All recitation evaluations, class session scores, and homework feedback recorded privately for{' '}
              <span className="font-semibold text-foreground">{user?.first_name || user?.username || 'you'}</span>.
            </p>
          </div>
          <Badge variant="outline" className="self-start sm:self-auto bg-background/80 border-primary/30 text-xs py-1 px-3">
            <Sparkles className="h-3.5 w-3.5 mr-1 text-primary" />
            Personal Learning Space
          </Badge>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Assigned Tasks</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              <span>{stats.total_assigned}</span>
              <BookOpen className="h-5 w-5 text-muted-foreground opacity-60" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Completed &amp; Submitted</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              <span>{stats.submitted_count}</span>
              <Clock className="h-5 w-5 text-blue-500 opacity-60" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Evaluated &amp; Graded</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between">
              <span>{stats.graded_count}</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-500 opacity-60" />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-card shadow-2xs">
          <CardHeader className="p-4 pb-2">
            <CardDescription className="text-xs font-medium">Average Performance</CardDescription>
            <CardTitle className="text-2xl font-bold flex items-center justify-between text-primary">
              <span>{stats.average_score !== null ? `${stats.average_score}%` : 'N/A'}</span>
              <Award className="h-5 w-5 opacity-60" />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs: Joined Timeline vs Homework Tasks vs Session Records */}
      <Tabs defaultValue="all-evaluations" className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger value="all-evaluations" className="flex items-center gap-1.5 text-xs">
            <Award className="h-4 w-4" />
            All Joined Assessments ({joinedAssessments.length})
          </TabsTrigger>
          <TabsTrigger value="homework-tasks" className="flex items-center gap-1.5 text-xs">
            <FileText className="h-4 w-4" />
            Homework &amp; Practice ({assignments.length})
          </TabsTrigger>
          <TabsTrigger value="session-records" className="flex items-center gap-1.5 text-xs">
            <FileCheck className="h-4 w-4" />
            Class Recitations ({sessionAssessments.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: All Joined Evaluations */}
        <TabsContent value="all-evaluations" className="space-y-3">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading your learning space assessments...</div>
          ) : joinedAssessments.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground space-y-2 border-dashed">
              <BookOpen className="h-10 w-10 mx-auto opacity-40" />
              <p className="font-medium">No assessment records yet in your personal learning space.</p>
              <p className="text-xs">
                As your assigned instructors evaluate your recitations and homework, results will be recorded here automatically.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {joinedAssessments.map((item) => (
                <Card key={item.id} className="p-4 space-y-3 hover:border-primary/40 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-base">{item.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {item.source === 'session' ? 'Live Session Evaluation' : 'Continuous Task'}
                        </Badge>
                        {item.subjectTrack && (
                          <Badge variant="secondary" className="text-[11px]">
                            {item.subjectTrack}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>Evaluator: {item.teacherName}</span>
                        {item.date && <span>Date: {new Date(item.date).toLocaleDateString()}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.status === 'graded' ? (
                        <Badge className="bg-emerald-600 text-white font-medium">
                          Score: {item.scoreDisplay}
                        </Badge>
                      ) : item.status === 'submitted' ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Submitted • Pending Grading
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Revision Requested</Badge>
                      )}
                    </div>
                  </div>

                  {/* Recitation audio player if present */}
                  {item.audioUrl && (
                    <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-md space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                        <Volume2 className="h-4 w-4" />
                        <span>Submitted Recitation Recording</span>
                      </div>
                      <audio
                        controls
                        className="w-full h-8"
                        src={resolveAssessmentMediaUrl(item.audioUrl) || ''}
                      />
                    </div>
                  )}

                  {/* Criteria scores / rubrics breakdown */}
                  {item.criteriaScores && item.criteriaScores.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-muted/30 p-2.5 rounded-md text-xs">
                      {item.criteriaScores.map((c, idx) => (
                        <div key={idx} className="flex justify-between border-b pb-1 last:border-0">
                          <span className="text-muted-foreground">{c.criterion}:</span>
                          <span className="font-semibold text-foreground ml-1">{c.score}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Teacher Feedback Note */}
                  {item.teacherFeedback && (
                    <div className="text-xs bg-muted/40 p-2.5 rounded border text-foreground">
                      <span className="font-semibold text-primary">Instructor Feedback: </span>
                      &ldquo;{item.teacherFeedback}&rdquo;
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Homework & Practice Assignments */}
        <TabsContent value="homework-tasks" className="space-y-3">
          {assignments.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground space-y-2 border-dashed">
              <BookOpen className="h-10 w-10 mx-auto opacity-40" />
              <p className="font-medium">No homework assignments currently assigned.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {assignments.map((assignment) => {
                const mySub = assignment.my_submission;
                const isGraded = mySub?.status === 'graded';
                const isSubmitted = mySub?.status === 'submitted';
                const needsRevision = mySub?.status === 'resubmission_requested';

                return (
                  <Card key={assignment.id} className="p-4 space-y-3 hover:border-primary/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-base">{assignment.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {SUBMISSION_TYPE_LABELS[assignment.submission_type] || assignment.submission_type}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span>Instructor: {assignment.created_by ? getDisplayName(assignment.created_by) : 'Teacher'}</span>
                          {assignment.due_date && (
                            <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                          )}
                          <span>Max: {assignment.max_score} pts</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isGraded ? (
                          <Badge className="bg-emerald-600 text-white">
                            Graded: {mySub?.score} / {assignment.max_score}
                          </Badge>
                        ) : isSubmitted ? (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            Submitted
                          </Badge>
                        ) : needsRevision ? (
                          <Badge variant="destructive">Revision Needed</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}

                        <Button
                          size="sm"
                          variant={isGraded || isSubmitted ? 'outline' : 'default'}
                          onClick={() => setSelectedAssignmentForSubmission(assignment)}
                        >
                          {isGraded || isSubmitted ? 'View Submission' : 'Submit Homework'}
                        </Button>
                      </div>
                    </div>

                    {(assignment.surah_number || assignment.ayah_start) && (
                      <div className="text-xs bg-muted/30 p-2 rounded flex items-center gap-2 text-foreground/80">
                        <span className="font-semibold text-primary">Recitation Reference:</span>
                        {assignment.surah_number && <span>Surah #{assignment.surah_number}</span>}
                        {(assignment.ayah_start || assignment.ayah_end) && (
                          <span>
                            Ayat {assignment.ayah_start || 1} - {assignment.ayah_end || 'End'}
                          </span>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Class Recitation Evaluations */}
        <TabsContent value="session-records" className="space-y-3">
          {sessionAssessments.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground space-y-2 border-dashed">
              <FileCheck className="h-10 w-10 mx-auto opacity-40" />
              <p className="font-medium">No class session evaluations recorded yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessionAssessments.map((sa) => (
                <Card key={sa.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-base">
                        {sa.booking?.level?.name || 'Recitation Session Assessment'}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Evaluated by {sa.assessed_by || 'Assigned Instructor'}
                      </p>
                    </div>
                    {sa.overall_average && (
                      <Badge className="bg-emerald-600 text-white font-semibold">
                        Score: {sa.overall_average} / 10
                      </Badge>
                    )}
                  </div>

                  {sa.booking?.start_time_utc && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(sa.booking.start_time_utc).toLocaleString()}</span>
                    </div>
                  )}

                  {sa.teacher_summary && (
                    <p className="text-xs italic bg-muted/20 p-2.5 rounded border">
                      &ldquo;{sa.teacher_summary}&rdquo;
                    </p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Homework Submission Modal */}
      {selectedAssignmentForSubmission && (
        <AssignmentSubmissionModal
          open={!!selectedAssignmentForSubmission}
          onOpenChange={(open) => {
            if (!open) setSelectedAssignmentForSubmission(null);
          }}
          assignment={selectedAssignmentForSubmission}
          submission={selectedAssignmentForSubmission.my_submission || null}
        />
      )}
    </div>
  );
}
