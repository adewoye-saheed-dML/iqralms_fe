'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import {
  assessmentApi,
  StudentAssignment,
  resolveAssessmentMediaUrl,
  AssignmentSubmission,
  getDisplayName,
  SUBMISSION_TYPE_LABELS,
} from '../api/assessment';
import { assessmentKeys } from '@/lib/api/query-keys';
import { AudioRecorder } from './audio-recorder';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  HelpCircle,
  Mic,
  Paperclip,
} from 'lucide-react';

interface AssignmentSubmissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: StudentAssignment | null;
  submission?: AssignmentSubmission | null;
}

export function AssignmentSubmissionModal({
  open,
  onOpenChange,
  assignment,
  submission,
}: AssignmentSubmissionModalProps) {
  const { activeAcademy } = useAcademy();
  const academyId = activeAcademy?.id;
  const queryClient = useQueryClient();

  const [audioFile, setAudioFile] = React.useState<Blob | File | null>(null);
  const [writtenResponse, setWrittenResponse] = React.useState('');
  const [attachmentFile, setAttachmentFile] = React.useState<File | null>(null);
  const [notesFromStudent, setNotesFromStudent] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const existingSubmission = submission || assignment?.my_submission;
  const isAlreadySubmitted = existingSubmission?.status === 'submitted' || existingSubmission?.status === 'graded';
  const isGraded = existingSubmission?.status === 'graded';
  const needsRevision = existingSubmission?.status === 'needs_revision';

  // Initialize existing responses if present
  React.useEffect(() => {
    if (existingSubmission) {
      setWrittenResponse(existingSubmission.written_response || '');
      setNotesFromStudent(existingSubmission.notes_from_student || '');
    } else {
      setWrittenResponse('');
      setNotesFromStudent('');
      setAudioFile(null);
      setAttachmentFile(null);
    }
  }, [existingSubmission, open]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!academyId || !assignment) throw new Error('Assignment and academy required');

      // Validation depending on submission type
      if (
        (assignment.submission_type === 'recitation') &&
        !audioFile &&
        !existingSubmission?.audio_file_url
      ) {
        throw new Error('Please record or upload your recitation audio before submitting.');
      }

      if (
        (assignment.submission_type === 'written') &&
        !writtenResponse.trim()
      ) {
        throw new Error('Please write your response before submitting.');
      }

      if (
        (assignment.submission_type === 'file') &&
        !attachmentFile &&
        !existingSubmission?.attachment_file_url
      ) {
        throw new Error('Please attach your homework file before submitting.');
      }

      return assessmentApi.submitAssignment(academyId, assignment.id, {
        audio_file: audioFile,
        written_response: writtenResponse.trim() || undefined,
        attachment_file: attachmentFile || undefined,
        notes_from_student: notesFromStudent.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assessmentKeys.all(academyId) });
      onOpenChange(false);
    },
    onError: (err: unknown) => {
      const error = err as Error;
      setErrorMessage(error.message || 'Failed to submit assignment');
    },
  });

  if (!assignment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    submitMutation.mutate();
  };

  const isRecitation =
    assignment.submission_type === 'recitation' || assignment.submission_type === 'mixed';
  const isWritten =
    assignment.submission_type === 'written' || assignment.submission_type === 'mixed';
  const isFile =
    assignment.submission_type === 'file' || assignment.submission_type === 'mixed';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2 pr-6">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              {assignment.title}
            </DialogTitle>
            {isGraded ? (
              <Badge className="bg-emerald-600 text-white flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Graded: {existingSubmission.score} / {assignment.max_score}
              </Badge>
            ) : isAlreadySubmitted ? (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Submitted (Pending Grading)
              </Badge>
            ) : needsRevision ? (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                Revision Requested
              </Badge>
            ) : (
              <Badge variant="outline">Not Submitted</Badge>
            )}
          </div>
          <DialogDescription>
            Teacher: <span className="font-medium text-foreground">{assignment.created_by_name}</span>
            {assignment.due_date && (
              <>
                {' • '}
                Due: <span className="font-medium text-foreground">{new Date(assignment.due_date).toLocaleString()}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Teacher Graded Result & Feedback Banner */}
        {isGraded && existingSubmission && (
          <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-emerald-900 dark:text-emerald-200">
                <Award className="h-5 w-5 text-emerald-600" />
                Teacher Score & Feedback
              </div>
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                {existingSubmission.score} / {assignment.max_score} pts
              </span>
            </div>

            {existingSubmission.teacher_feedback && (
              <p className="text-sm text-emerald-800 dark:text-emerald-200 bg-white/70 dark:bg-black/20 p-3 rounded-md border border-emerald-100 dark:border-emerald-900">
                &ldquo;{existingSubmission.teacher_feedback}&rdquo;
              </p>
            )}

            {Array.isArray(existingSubmission.rubric_scores) && existingSubmission.rubric_scores.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                  Rubric Assessment Breakdown:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {existingSubmission.rubric_scores.map((r, i) => (
                    <div
                      key={i}
                      className="p-2 bg-white/80 dark:bg-black/30 rounded border flex items-center justify-between"
                    >
                      <span className="font-medium">{r.criterion}</span>
                      <span className="font-semibold text-primary">
                        {r.score}/{r.max_score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Assignment Instructions / Details */}
        <div className="space-y-3 bg-muted/40 p-4 rounded-lg border">
          {assignment.description && (
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase">Instructions</span>
              <p className="text-sm mt-1 whitespace-pre-wrap">{assignment.description}</p>
            </div>
          )}

          {(assignment.surah_number || assignment.ayah_start) && (
            <div className="flex flex-wrap items-center gap-3 text-xs bg-card p-2.5 rounded border">
              <span className="font-semibold text-primary">Recitation Reference:</span>
              {assignment.surah_number && (
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                  Surah #{assignment.surah_number}
                </span>
              )}
              {(assignment.ayah_start || assignment.ayah_end) && (
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">
                  Ayat {assignment.ayah_start || 1} - {assignment.ayah_end || 'End'}
                </span>
              )}
              {assignment.reference_notes && (
                <span className="text-muted-foreground italic">&ldquo;{assignment.reference_notes}&rdquo;</span>
              )}
            </div>
          )}

          {assignment.attachment_url && (
            <div className="pt-1">
              <a
                href={resolveAssessmentMediaUrl(assignment.attachment_url) || '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                Download Teacher&apos;s Attached Material / Worksheet
              </a>
            </div>
          )}
        </div>

        {/* Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Audio Recitation Area */}
          {isRecitation && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Mic className="h-4 w-4 text-emerald-600" />
                Recitation Audio Recording {assignment.submission_type === 'recitation' && '*'}
              </Label>
              <AudioRecorder
                onAudioReady={setAudioFile}
                existingAudioUrl={
                  existingSubmission?.audio_file_url
                    ? resolveAssessmentMediaUrl(existingSubmission.audio_file_url)
                    : undefined
                }
                disabled={isAlreadySubmitted && !needsRevision}
              />
            </div>
          )}

          {/* Written Response Area */}
          {isWritten && (
            <div className="space-y-2">
              <Label htmlFor="written-response" className="flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-blue-600" />
                Written Answer / Homework Text {assignment.submission_type === 'written' && '*'}
              </Label>
              <Textarea
                id="written-response"
                rows={4}
                placeholder="Type your answer, reflection, or summary here..."
                value={writtenResponse}
                onChange={(e) => setWrittenResponse(e.target.value)}
                disabled={isAlreadySubmitted && !needsRevision}
              />
            </div>
          )}

          {/* File Attachment Area */}
          {isFile && (
            <div className="space-y-2">
              <Label htmlFor="submission-file" className="flex items-center gap-1.5">
                <Paperclip className="h-4 w-4 text-amber-600" />
                Upload Homework Document / Photo / PDF {assignment.submission_type === 'file' && '*'}
              </Label>
              <Input
                id="submission-file"
                type="file"
                onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                disabled={isAlreadySubmitted && !needsRevision}
              />
              {existingSubmission?.attachment_file_url && (
                <a
                  href={resolveAssessmentMediaUrl(existingSubmission.attachment_file_url) || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  View previously submitted file
                </a>
              )}
            </div>
          )}

          {/* Student Notes */}
          <div className="space-y-2">
            <Label htmlFor="student-notes" className="text-xs flex items-center gap-1 text-muted-foreground">
              <HelpCircle className="h-3.5 w-3.5" />
              Notes / Questions for Teacher (Optional)
            </Label>
            <Input
              id="student-notes"
              placeholder="e.g. I was unsure about the stopping sign on Ayah 7..."
              value={notesFromStudent}
              onChange={(e) => setNotesFromStudent(e.target.value)}
              disabled={isAlreadySubmitted && !needsRevision}
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            {(!isAlreadySubmitted || needsRevision) && (
              <Button type="submit" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? 'Submitting...' : needsRevision ? 'Resubmit Homework' : 'Submit Homework'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
