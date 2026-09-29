'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import {
  assessmentApi,
  AssignmentSubmission,
  resolveAssessmentMediaUrl,
  RubricCriterionScore,
} from '../api/assessment';
import { assessmentKeys } from '@/lib/api/query-keys';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  CheckCircle2,
  Clock,
  Download,
  FileText,
  HelpCircle,
  Mic,
  Paperclip,
  Play,
  User,
  Volume2,
} from 'lucide-react';

interface GradeSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: AssignmentSubmission | null;
}

const DEFAULT_RUBRIC_CRITERIA = [
  { criterion: 'Tajweed Rules & Accuracy', score: 25, max_score: 25 },
  { criterion: 'Makharij & Pronunciation', score: 25, max_score: 25 },
  { criterion: 'Fluency & Rhythm (Tarteel)', score: 25, max_score: 25 },
  { criterion: 'Memorization & Retention', score: 25, max_score: 25 },
];

export function GradeSubmissionModal({
  open,
  onOpenChange,
  submission,
}: GradeSubmissionModalProps) {
  const { activeAcademy } = useAcademy();
  const academyId = activeAcademy?.id;
  const queryClient = useQueryClient();

  const [score, setScore] = React.useState<string>('90');
  const [status, setStatus] = React.useState<'graded' | 'needs_revision'>('graded');
  const [feedback, setFeedback] = React.useState('');
  const [rubricScores, setRubricScores] = React.useState<RubricCriterionScore[]>(DEFAULT_RUBRIC_CRITERIA);
  const [useRubric, setUseRubric] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (submission) {
      setScore(submission.score !== null ? String(submission.score) : '85');
      setStatus(submission.status === 'needs_revision' ? 'needs_revision' : 'graded');
      setFeedback(submission.teacher_feedback || '');

      if (Array.isArray(submission.rubric_scores) && submission.rubric_scores.length > 0) {
        setRubricScores(submission.rubric_scores as RubricCriterionScore[]);
        setUseRubric(true);
      } else {
        setRubricScores(DEFAULT_RUBRIC_CRITERIA);
        setUseRubric(false);
      }
    }
  }, [submission, open]);

  // Handle auto score recalculation when rubric scores change
  const handleRubricChange = (index: number, newScore: number) => {
    const updated = [...rubricScores];
    updated[index] = { ...updated[index], score: newScore };
    setRubricScores(updated);

    const total = updated.reduce((acc, curr) => acc + curr.score, 0);
    setScore(String(total));
  };

  const gradeMutation = useMutation({
    mutationFn: async () => {
      if (!academyId || !submission) throw new Error('Submission not found');
      const numScore = parseFloat(score);
      if (isNaN(numScore) || numScore < 0) {
        throw new Error('Please enter a valid numeric score');
      }

      return assessmentApi.gradeSubmission(academyId, submission.id, {
        score: numScore,
        status,
        teacher_feedback: feedback.trim() || undefined,
        rubric_scores: useRubric ? rubricScores : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all(academyId) });
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const error = err as Error;
      setErrorMessage(error.message || 'Failed to submit grade');
    },
  });

  if (!submission) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    gradeMutation.mutate();
  };

  const maxScore = submission.assignment_details?.max_score || 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Grade Student Submission
            </DialogTitle>
            <Badge
              variant={
                submission.status === 'graded'
                  ? 'default'
                  : submission.status === 'needs_revision'
                  ? 'destructive'
                  : 'outline'
              }
            >
              {submission.status.toUpperCase()}
            </Badge>
          </div>
          <DialogDescription>
            Student: <span className="font-semibold text-foreground">{submission.student_name}</span>
            {' • '}
            Assignment: <span className="font-medium text-foreground">{submission.assignment_title}</span>
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Student Submission Contents */}
        <div className="space-y-3 bg-muted/40 p-4 rounded-lg border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Submitted on {new Date(submission.submitted_at).toLocaleString()}</span>
            <span>Max Score: {maxScore} pts</span>
          </div>

          {/* Recitation Audio Player */}
          {submission.audio_file_url && (
            <div className="p-3 bg-card rounded-md border space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                <Volume2 className="h-4 w-4" />
                <span>Student Recitation Audio</span>
              </div>
              <audio
                controls
                className="w-full h-10"
                src={resolveAssessmentMediaUrl(submission.audio_file_url) || ''}
              />
            </div>
          )}

          {/* Written Answer */}
          {submission.written_response && (
            <div className="p-3 bg-card rounded-md border space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase">
                <FileText className="h-3.5 w-3.5" />
                <span>Written Response</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{submission.written_response}</p>
            </div>
          )}

          {/* Attached File */}
          {submission.attachment_file_url && (
            <div className="pt-1">
              <a
                href={resolveAssessmentMediaUrl(submission.attachment_file_url) || '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                Download Student Homework Attachment
              </a>
            </div>
          )}

          {/* Student Note */}
          {submission.notes_from_student && (
            <div className="p-2.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded text-xs text-amber-900 dark:text-amber-200">
              <span className="font-semibold">Student Note: </span>
              {submission.notes_from_student}
            </div>
          )}
        </div>

        {/* Grading Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade-score">Awarded Score (Max {maxScore}) *</Label>
              <Input
                id="grade-score"
                type="number"
                min="0"
                max={maxScore}
                step="0.5"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Outcome Status *</Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as 'graded' | 'needs_revision')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="graded">
                    <div className="flex items-center gap-2 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Graded & Approved</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="needs_revision">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>Needs Revision (Request Redo)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rubric Criteria Evaluation Toggle */}
          <div className="border rounded-lg p-3 space-y-3 bg-muted/20">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold cursor-pointer">
                Rubric Criteria Evaluation (Tajweed, Makharij, Fluency)
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => setUseRubric(!useRubric)}
              >
                {useRubric ? 'Hide Rubric Breakdown' : '+ Use Rubric Breakdown'}
              </Button>
            </div>

            {useRubric && (
              <div className="space-y-3 pt-2">
                {rubricScores.map((criterion, idx) => (
                  <div key={idx} className="space-y-1.5 p-2 bg-card rounded border">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{criterion.criterion}</span>
                      <span className="font-semibold text-primary">
                        {criterion.score} / {criterion.max_score}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={criterion.max_score}
                      value={criterion.score}
                      onChange={(e) => handleRubricChange(idx, parseInt(e.target.value, 10))}
                      className="w-full accent-primary h-1.5 bg-muted rounded-lg cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher-feedback">Teacher Feedback & Remarks</Label>
            <Textarea
              id="teacher-feedback"
              rows={3}
              placeholder="Give positive encouragement and constructive feedback for the student..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={gradeMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={gradeMutation.isPending}>
              {gradeMutation.isPending ? 'Saving Grade...' : 'Save Grade & Feedback'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
