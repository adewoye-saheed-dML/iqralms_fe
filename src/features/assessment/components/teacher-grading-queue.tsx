'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import {
  assessmentApi,
  AssignmentSubmission,
  SubmissionStatus,
  resolveAssessmentMediaUrl,
  getDisplayName,
} from '../api/assessment';
import { assessmentKeys } from '@/lib/api/query-keys';
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
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Mic,
  Search,
  User,
  Volume2,
} from 'lucide-react';
import { GradeSubmissionModal } from './grade-submission-modal';

interface TeacherGradingQueueProps {
  initialAssignmentId?: number;
}

export function TeacherGradingQueue({ initialAssignmentId }: TeacherGradingQueueProps) {
  const { activeAcademy } = useAcademy();
  const academyId = activeAcademy?.id;

  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [selectedSubmissionForGrading, setSelectedSubmissionForGrading] =
    React.useState<AssignmentSubmission | null>(null);

  // Fetch Submissions
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: assessmentKeys.submissions(academyId, {
      assignment_id: initialAssignmentId,
      status: statusFilter !== 'all' ? (statusFilter as SubmissionStatus) : undefined,
    }),
    queryFn: () =>
      academyId
        ? assessmentApi.getSubmissions(academyId, {
            assignment_id: initialAssignmentId,
            status: statusFilter !== 'all' ? (statusFilter as SubmissionStatus) : undefined,
          })
        : [],
    enabled: !!academyId,
  });

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Submissions</SelectItem>
              <SelectItem value="submitted">Pending Grading</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
              <SelectItem value="resubmission_requested">Needs Revision</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submissions List */}
      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">Loading submissions...</div>
      ) : submissions.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground space-y-2">
          <Clock className="h-10 w-10 mx-auto opacity-40" />
          <p className="font-medium">No submissions in queue.</p>
          <p className="text-xs">
            Student recitation audio and written homework submissions will appear here for grading.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {submissions.map((sub) => {
            const isGraded = sub.status === 'graded';
            const isSubmitted = sub.status === 'submitted';
            const needsRevision = sub.status === 'resubmission_requested';
            const studentDisplayName = getDisplayName(sub.student);
            const gradedByName = sub.graded_by ? getDisplayName(sub.graded_by) : null;
            const audioUrl = sub.audio_recording;

            return (
              <Card key={sub.id} className="p-4 space-y-3 hover:border-primary/50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-base">{studentDisplayName}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm font-medium text-muted-foreground">
                        {sub.assignment_title}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>Submitted: {new Date(sub.submitted_at).toLocaleString()}</span>
                      {gradedByName && <span>Graded by: {gradedByName}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isGraded ? (
                      <Badge className="bg-emerald-600 text-white">
                        Score: {sub.score} / {sub.max_score || 100}
                      </Badge>
                    ) : isSubmitted ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Pending Evaluation
                      </Badge>
                    ) : needsRevision ? (
                      <Badge variant="destructive">Revision Requested</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}

                    <Button
                      size="sm"
                      onClick={() => setSelectedSubmissionForGrading(sub)}
                      className="flex items-center gap-1.5"
                    >
                      <Award className="h-4 w-4" />
                      {isGraded ? 'Edit Grade' : 'Grade Submission'}
                    </Button>
                  </div>
                </div>

                {/* Recitation audio player snippet */}
                {audioUrl && (
                  <div className="flex items-center gap-3 bg-muted/40 p-2.5 rounded">
                    <Volume2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <audio
                      controls
                      className="w-full h-8"
                      src={resolveAssessmentMediaUrl(audioUrl) || ''}
                    />
                  </div>
                )}

                {/* Written text snippet */}
                {sub.written_response && (
                  <p className="text-xs bg-muted/20 p-2 rounded text-muted-foreground line-clamp-2">
                    <span className="font-semibold text-foreground">Answer: </span>
                    {sub.written_response}
                  </p>
                )}

                {/* Teacher Feedback if graded */}
                {isGraded && sub.teacher_feedback && (
                  <div className="text-xs bg-emerald-50/60 dark:bg-emerald-950/20 p-2 rounded text-emerald-900 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-900">
                    <span className="font-semibold">Feedback: </span>
                    {sub.teacher_feedback}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Grade Modal */}
      <GradeSubmissionModal
        open={!!selectedSubmissionForGrading}
        onOpenChange={(open) => {
          if (!open) setSelectedSubmissionForGrading(null);
        }}
        submission={selectedSubmissionForGrading}
      />
    </div>
  );
}
