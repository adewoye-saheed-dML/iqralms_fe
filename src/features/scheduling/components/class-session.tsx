'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { schedulingApi } from '../api/scheduling';
import { assessmentApi, type SessionAssessmentCreate } from '@/features/assessment/api/assessment';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth } from '@/lib/auth/auth-provider';
import { can } from '@/lib/permissions/capabilities';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Video, ExternalLink, CheckSquare, AlertTriangle } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';

interface ClassSessionProps {
  bookingId: number;
}

export function ClassSession({ bookingId }: ClassSessionProps) {
  const { activeAcademy, activeRole } = useAcademy();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [embedVideo, setEmbedVideo] = React.useState(false);
  const [assessmentSuccess, setAssessmentSuccess] = React.useState(false);
  const [assessmentError, setAssessmentError] = React.useState<string | null>(null);

  // Form state for teacher assessment/notes
  const [score, setScore] = React.useState('8.50');
  const [summary, setSummary] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const isTeacherOrAdmin = can('manage_assessments', {
    activeRole,
    userRole: user?.role,
  });

  const {
    data: meeting,
    isLoading: isMeetingLoading,
    error: meetingError,
    refetch: refetchMeeting,
  } = useQuery({
    queryKey: ['scheduling', 'meeting', activeAcademy?.id, bookingId],
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return schedulingApi.getMeeting(activeAcademy.id, bookingId);
    },
    enabled: !!activeAcademy?.id && !!bookingId,
    retry: false,
  });

  const assessmentMutation = useMutation({
    mutationFn: (data: SessionAssessmentCreate) => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return assessmentApi.submitAssessment(activeAcademy.id, bookingId, data);
    },
    onSuccess: () => {
      setAssessmentSuccess(true);
      setAssessmentError(null);
      queryClient.invalidateQueries({
        queryKey: ['assessment', 'list', activeAcademy?.id],
      });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setAssessmentError(err.message || 'Failed to submit assessment.');
      } else {
        setAssessmentError('An unexpected error occurred submitting assessment.');
      }
    },
  });

  if (!activeAcademy) {
    return <ErrorState title="No Academy Selected" message="Please select an active academy to view this session." />;
  }

  if (isMeetingLoading) {
    return (
      <div className="flex justify-center p-12">
        <LoadingState />
      </div>
    );
  }

  if (meetingError) {
    if (meetingError instanceof ApiError && meetingError.status === 400) {
      return (
        <Card className="border-destructive/30">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <CardTitle>Session Cancelled</CardTitle>
            </div>
            <CardDescription>
              This booking has been cancelled and its meeting room is no longer accessible.
            </CardDescription>
          </CardHeader>
        </Card>
      );
    }
    if (meetingError instanceof ApiError && meetingError.status === 403) {
      return (
        <ErrorState
          title="Access Denied"
          message="You are not authorized to join or view this session."
        />
      );
    }
    return (
      <ErrorState
        title="Failed to Load Meeting"
        message={meetingError.message || 'Could not retrieve session meeting details.'}
        onRetry={() => refetchMeeting()}
      />
    );
  }

  const handleAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAssessmentError(null);
    assessmentMutation.mutate({
      scores: [
        {
          criterion: 1,
          score: Number(score) || 8.5,
          comment: notes || undefined,
        },
      ],
      teacher_summary: summary || undefined,
      flagged_for_review: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Meeting Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">
                  {meeting?.display_name || `Class Session #${bookingId}`}
                </CardTitle>
                <Badge variant="outline" className="uppercase text-xs font-semibold">
                  {meeting?.provider || 'Jitsi'}
                </Badge>
              </div>
              <CardDescription className="mt-1">
                Authorized provider-neutral class session
              </CardDescription>
            </div>

            <div className="flex gap-2">
              <Button
                variant={embedVideo ? 'secondary' : 'default'}
                onClick={() => setEmbedVideo(!embedVideo)}
              >
                <Video className="mr-2 h-4 w-4" />
                {embedVideo ? 'Hide In-App Video' : 'Join Video Here'}
              </Button>
              {meeting?.join_url && (
                <Button variant="outline" asChild>
                  <a href={meeting.join_url} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in New Window
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {!embedVideo && (
          <CardContent className="pt-0">
            <div className="rounded-lg border border-dashed p-6 text-center bg-muted/20">
              <Video className="mx-auto h-10 w-10 text-primary mb-3" />
              <h4 className="text-sm font-semibold text-foreground">Interactive Classroom Ready</h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4">
                Connect directly inside the academy using the embedded video frame, or launch in an external window for a full-screen experience.
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => setEmbedVideo(true)} size="sm">
                  <Video className="mr-2 h-4 w-4" /> Start In-App Video
                </Button>
                {meeting?.join_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={meeting.join_url} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> Launch in External Window
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        )}

        {embedVideo && meeting?.join_url && (
          <CardContent className="pt-0">
            <div className="aspect-video w-full rounded-md overflow-hidden border bg-black">
              <iframe
                src={meeting.join_url}
                className="w-full h-full border-0"
                allow="camera; microphone; fullscreen; display-capture; autoplay"
                title="Class Video Session"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Student / Parent Guidelines */}
      {!isTeacherOrAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Student Recitation Instructions</CardTitle>
            <CardDescription className="text-xs">
              Welcome to your live class. Please follow these guidelines for the best session experience.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground space-y-2">
            <p>1. Ensure your camera and microphone are connected and allowed in your browser.</p>
            <p>2. Keep your Mushaf or Quran study materials open and ready for your recitation turn.</p>
            <p>3. Following the class, your instructor will record your recitation assessment and progress notes, which will appear on your dashboard.</p>
          </CardContent>
        </Card>
      )}

      {/* Teaching Workflow: Notes, Assessment & Progress */}
      {isTeacherOrAdmin && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Class Assessment & Notes</CardTitle>
            </div>
            <CardDescription>
              Record student evaluation and teaching summary for this session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assessmentSuccess && (
              <Alert className="mb-4 bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200">
                <AlertTitle>Assessment Submitted</AlertTitle>
                <AlertDescription>
                  Session assessment has been recorded and submitted to the review pipeline.
                </AlertDescription>
              </Alert>
            )}

            {assessmentError && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Submission Failed</AlertTitle>
                <AlertDescription>{assessmentError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleAssessmentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Overall Score (e.g. 8.50)
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-md border p-2 text-sm bg-background"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    required
                    placeholder="8.50"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Teacher Summary (Shared with Family)
                </label>
                <textarea
                  className="w-full rounded-md border p-2 text-sm bg-background"
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  required
                  placeholder="Summary of today's lesson, student recitation, and milestones achieved..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Internal Notes (Internal Teacher / Lead QC Notes)
                </label>
                <textarea
                  className="w-full rounded-md border p-2 text-sm bg-background"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Internal observations, Tajweed focus areas, next lesson goals..."
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={assessmentMutation.isPending}>
                  {assessmentMutation.isPending ? 'Submitting...' : 'Submit Session Assessment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
