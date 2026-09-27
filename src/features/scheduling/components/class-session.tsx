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
import {
  Video,
  ExternalLink,
  CheckSquare,
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  BookOpen,
  PenTool,
  Maximize2,
  Layout,
  Columns,
} from 'lucide-react';
import { ApiError } from '@/lib/api/errors';
import { ClassroomMaterials } from './classroom-materials';
import { ClassroomWhiteboard } from './classroom-whiteboard';

interface ClassSessionProps {
  bookingId: number;
}

type WorkspaceView = 'video' | 'split-materials' | 'split-whiteboard' | 'materials' | 'whiteboard';

export function ClassSession({ bookingId }: ClassSessionProps) {
  const { activeAcademy, activeRole } = useAcademy();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [embedVideo, setEmbedVideo] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<WorkspaceView>('split-materials');
  const [assessmentSuccess, setAssessmentSuccess] = React.useState(false);
  const [assessmentError, setAssessmentError] = React.useState<string | null>(null);

  // Live Timer for Hours Tracking
  const [sessionSeconds, setSessionSeconds] = React.useState(0);
  const [isTimerRunning, setIsTimerRunning] = React.useState(false);
  const [completedDuration, setCompletedDuration] = React.useState<number | null>(null);
  const [completionSuccess, setCompletionSuccess] = React.useState(false);
  const [completionError, setCompletionError] = React.useState<string | null>(null);
  const [customDurationInput, setCustomDurationInput] = React.useState('30');

  // Form state for teacher assessment/notes
  const [score, setScore] = React.useState('8.50');
  const [summary, setSummary] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const isTeacherOrAdmin = can('manage_assessments', {
    activeRole,
    userRole: user?.role,
  });

  // Start timer automatically when embed video is active
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (embedVideo && isTimerRunning) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [embedVideo, isTimerRunning]);

  React.useEffect(() => {
    if (sessionSeconds > 0) {
      setCustomDurationInput(String(Math.max(1, Math.round(sessionSeconds / 60))));
    }
  }, [sessionSeconds]);

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

  // Complete session mutation (transitions status to completed, logs duration for payout)
  const completeMutation = useMutation({
    mutationFn: (durationMins: number) => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return schedulingApi.completeBooking(activeAcademy.id, bookingId, {
        duration_minutes: durationMins,
      });
    },
    onSuccess: (updatedBooking) => {
      setCompletionSuccess(true);
      setCompletionError(null);
      setIsTimerRunning(false);
      setCompletedDuration(updatedBooking.duration_minutes || Number(customDurationInput));
      queryClient.invalidateQueries({
        queryKey: ['scheduling', 'bookings', activeAcademy?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ['payouts', 'list', activeAcademy?.id],
      });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setCompletionError(err.message || 'Failed to complete session.');
      } else {
        setCompletionError('An unexpected error occurred while completing the session.');
      }
    },
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

  const handleToggleVideo = () => {
    if (!embedVideo) {
      setEmbedVideo(true);
      setIsTimerRunning(true);
    } else {
      setEmbedVideo(false);
    }
  };

  const handleCompleteSession = () => {
    setCompletionError(null);
    const mins = Number(customDurationInput) || Math.max(1, Math.round(sessionSeconds / 60)) || 30;
    completeMutation.mutate(mins);
  };

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

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Classroom Controls */}
      <Card className="border shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">
                  {meeting?.display_name || `Class Session #${bookingId}`}
                </CardTitle>
                <Badge variant="outline" className="uppercase text-xs font-semibold">
                  {meeting?.provider || 'Jitsi'}
                </Badge>
                {completionSuccess ? (
                  <Badge className="bg-emerald-600 text-white text-xs">
                    Completed • {completedDuration} min
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">
                    In Progress
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-1">
                Authorized provider-neutral class session with in-app tracking
              </CardDescription>
            </div>

            {/* Video Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Teaching duration counter */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/60 text-xs font-mono font-medium">
                <Clock className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span>Teaching Time: {formatTimer(sessionSeconds)}</span>
              </div>

              <Button
                variant={embedVideo ? 'secondary' : 'default'}
                onClick={handleToggleVideo}
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

        {/* View Switcher Bar (Visible when Video is active or tools are used) */}
        <div className="px-6 py-2.5 border-t bg-muted/20 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground mr-1 font-medium">Class Layout:</span>
            <Button
              variant={viewMode === 'video' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('video')}
              className="h-7 text-xs"
            >
              <Video className="h-3 w-3 mr-1" /> Video Only
            </Button>
            <Button
              variant={viewMode === 'split-materials' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('split-materials')}
              className="h-7 text-xs"
            >
              <Columns className="h-3 w-3 mr-1" /> Video + Materials
            </Button>
            <Button
              variant={viewMode === 'split-whiteboard' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('split-whiteboard')}
              className="h-7 text-xs"
            >
              <Columns className="h-3 w-3 mr-1" /> Video + Whiteboard
            </Button>
            <Button
              variant={viewMode === 'materials' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('materials')}
              className="h-7 text-xs"
            >
              <BookOpen className="h-3 w-3 mr-1" /> Full Materials
            </Button>
            <Button
              variant={viewMode === 'whiteboard' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('whiteboard')}
              className="h-7 text-xs"
            >
              <PenTool className="h-3 w-3 mr-1" /> Full Whiteboard
            </Button>
          </div>

          {/* Teacher Hours Tracking & Session Conclude Action */}
          {isTeacherOrAdmin && !completionSuccess && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-background/80 px-2 py-0.5 rounded border text-[11px]">
                <span className="text-muted-foreground">Logged:</span>
                <input
                  type="number"
                  min="1"
                  max="480"
                  aria-label="Teaching duration in minutes"
                  value={customDurationInput}
                  onChange={(e) => setCustomDurationInput(e.target.value)}
                  className="w-12 h-6 px-1 text-center font-mono font-medium rounded border bg-background text-xs"
                />
                <span className="text-muted-foreground">min</span>
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={handleCompleteSession}
                disabled={completeMutation.isPending}
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                {completeMutation.isPending ? 'Completing...' : 'Conclude & Log Hours for Payout'}
              </Button>
            </div>
          )}
        </div>

        {/* Completion Alert */}
        {completionSuccess && (
          <div className="p-4 border-t bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Session Recorded Successfully!</strong> {completedDuration} minutes of teaching time have been verified and submitted for teacher payout calculation.
              </span>
            </div>
            <Badge variant="outline" className="border-emerald-500 text-emerald-700 dark:text-emerald-300">
              Payout Eligible
            </Badge>
          </div>
        )}

        {completionError && (
          <div className="p-3 border-t bg-destructive/10 text-destructive text-xs">
            {completionError}
          </div>
        )}
      </Card>

      {/* Classroom Main Interactive Area */}
      {!embedVideo && viewMode !== 'materials' && viewMode !== 'whiteboard' ? (
        <Card>
          <CardContent className="py-12">
            <div className="rounded-lg border border-dashed p-8 text-center bg-muted/20 max-w-xl mx-auto">
              <Video className="mx-auto h-12 w-12 text-primary mb-3" />
              <h4 className="text-base font-semibold text-foreground">Interactive Classroom Ready</h4>
              <p className="text-xs text-muted-foreground mt-1 mb-5">
                Join video directly inside the academy to automatically track teaching hours for payouts, access learning materials for screen-sharing, and use the whiteboard.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={handleToggleVideo} size="default">
                  <Video className="mr-2 h-4 w-4" /> Start In-App Video
                </Button>
                {meeting?.join_url && (
                  <Button variant="outline" size="default" asChild>
                    <a href={meeting.join_url} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> Launch in External Window
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {/* Layout 1: Split Video + Materials */}
          {viewMode === 'split-materials' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
              {/* Video frame (7 cols) */}
              <div className="lg:col-span-7 flex flex-col">
                <Card className="flex-1 overflow-hidden border shadow-sm flex flex-col bg-black">
                  <div className="w-full flex-1 min-h-[420px] aspect-video">
                    {meeting?.join_url && (
                      <iframe
                        src={meeting.join_url}
                        className="w-full h-full border-0"
                        allow="camera; microphone; fullscreen; display-capture; autoplay"
                        title="Class Video Session"
                      />
                    )}
                  </div>
                </Card>
              </div>

              {/* Learning Materials Side (5 cols) */}
              <div className="lg:col-span-5 flex flex-col">
                <ClassroomMaterials
                  levelName={meeting?.display_name}
                  trackName={activeAcademy.name}
                />
              </div>
            </div>
          )}

          {/* Layout 2: Split Video + Whiteboard */}
          {viewMode === 'split-whiteboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
              {/* Video frame (6 cols) */}
              <div className="lg:col-span-6 flex flex-col">
                <Card className="flex-1 overflow-hidden border shadow-sm flex flex-col bg-black">
                  <div className="w-full flex-1 min-h-[420px] aspect-video">
                    {meeting?.join_url && (
                      <iframe
                        src={meeting.join_url}
                        className="w-full h-full border-0"
                        allow="camera; microphone; fullscreen; display-capture; autoplay"
                        title="Class Video Session"
                      />
                    )}
                  </div>
                </Card>
              </div>

              {/* Whiteboard Side (6 cols) */}
              <div className="lg:col-span-6 flex flex-col">
                <ClassroomWhiteboard />
              </div>
            </div>
          )}

          {/* Layout 3: Video Only */}
          {viewMode === 'video' && (
            <Card className="overflow-hidden border shadow-sm bg-black">
              <div className="w-full aspect-video min-h-[520px]">
                {meeting?.join_url && (
                  <iframe
                    src={meeting.join_url}
                    className="w-full h-full border-0"
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    title="Class Video Session"
                  />
                )}
              </div>
            </Card>
          )}

          {/* Layout 4: Full Materials */}
          {viewMode === 'materials' && (
            <div className="min-h-[600px]">
              <ClassroomMaterials
                levelName={meeting?.display_name}
                trackName={activeAcademy.name}
              />
            </div>
          )}

          {/* Layout 5: Full Whiteboard */}
          {viewMode === 'whiteboard' && (
            <div className="min-h-[600px]">
              <ClassroomWhiteboard />
            </div>
          )}
        </div>
      )}

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
            <p>2. Keep your Mushaf or the in-app Quran Reader open and ready for your recitation turn.</p>
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
