'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { schedulingKeys } from '@/lib/api/query-keys';
import { schedulingApi, type SessionRecording } from '../api/scheduling';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Video,
  ShieldAlert,
  Clock,
  Trash2,
  Play,
  Search,
  Calendar,
  User,
  GraduationCap,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { ApiError } from '@/lib/api/errors';

export function SessionRecordingsView() {
  const { activeAcademy } = useAcademy();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedRecording, setSelectedRecording] = React.useState<SessionRecording | null>(null);
  const [recordingToDelete, setRecordingToDelete] = React.useState<SessionRecording | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const queryKey = schedulingKeys.recordings(activeAcademy?.id);

  const { data: recordings, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return schedulingApi.getAcademyRecordings(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (recordingId: number) => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return schedulingApi.deleteSessionRecording(activeAcademy.id, recordingId);
    },
    onSuccess: () => {
      setActionError(null);
      setRecordingToDelete(null);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        setActionError(err.message || 'Failed to delete recording.');
      } else {
        setActionError('Failed to delete recording due to an unexpected error.');
      }
    },
  });

  const filteredRecordings = React.useMemo(() => {
    if (!recordings) return [];
    if (!searchTerm.trim()) return recordings;
    const term = searchTerm.toLowerCase();
    return recordings.filter((r) => {
      const studentName = `${r.student.first_name} ${r.student.last_name} ${r.student.username}`.toLowerCase();
      const teacherName = `${r.teacher.first_name} ${r.teacher.last_name} ${r.teacher.username}`.toLowerCase();
      const title = (r.title || '').toLowerCase();
      const track = (r.track_title || '').toLowerCase();
      const level = (r.level_name || '').toLowerCase();
      return (
        studentName.includes(term) ||
        teacherName.includes(term) ||
        title.includes(term) ||
        track.includes(term) ||
        level.includes(term)
      );
    });
  }, [recordings, searchTerm]);

  const activeCount = recordings?.filter((r) => !r.is_expired).length || 0;
  const expiringSoonCount =
    recordings?.filter((r) => !r.is_expired && r.days_until_expiry <= 7).length || 0;

  if (isLoading) return <LoadingState />;
  if (error) {
    if (error instanceof ApiError && error.status === 403) {
      return (
        <ErrorState
          title="Access Restricted"
          message="Session recordings and audit logs are strictly reserved for academy owners and administrators."
        />
      );
    }
    return (
      <ErrorState
        title="Failed to load session recordings"
        message={error.message || 'An unknown error occurred'}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Retention Policy Banner */}
      <Alert className="border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/20 dark:text-amber-200">
        <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <AlertTitle className="font-semibold tracking-tight">
          Academy 60-Day Auto-Retention & Dispute Policy
        </AlertTitle>
        <AlertDescription className="mt-1 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
          All completed live class sessions are automatically recorded and saved strictly for owner/admin
          review in case of dispute or compliance verification. To ensure privacy and prevent database bloat,
          recordings are automatically permanently purged after <strong>60 days</strong>.
        </AlertDescription>
      </Alert>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Recordings Saved</CardDescription>
            <CardTitle className="text-2xl font-bold">{recordings?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Historical session archives</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Active Retained Sessions</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">{activeCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Within standard 60-day window</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Expiring Soon (≤ 7 days)</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {expiringSoonCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Scheduled for auto-purge</p>
          </CardContent>
        </Card>
      </div>

      {actionError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Action Error</AlertTitle>
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student, teacher, track or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 text-sm"
          />
        </div>
        <div className="text-xs text-muted-foreground">
          Showing {filteredRecordings.length} of {recordings?.length || 0} recordings
        </div>
      </div>

      {/* Recordings Grid / List */}
      {filteredRecordings.length === 0 ? (
        <EmptyState
          title={searchTerm ? 'No matching recordings' : 'No recordings available'}
          description={
            searchTerm
              ? 'Try adjusting your search terms.'
              : 'Completed live video sessions will automatically appear here with a 60-day retention countdown.'
          }
          icon={<Video className="h-10 w-10 text-muted-foreground" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecordings.map((recording) => {
            const recordedDate = new Date(recording.recorded_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const recordedTime = new Date(recording.recorded_at).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });

            const studentDisplayName =
              recording.student.first_name || recording.student.last_name
                ? `${recording.student.first_name} ${recording.student.last_name}`.trim()
                : recording.student.username;

            const teacherDisplayName =
              recording.teacher.first_name || recording.teacher.last_name
                ? `${recording.teacher.first_name} ${recording.teacher.last_name}`.trim()
                : recording.teacher.username;

            return (
              <Card
                key={recording.id}
                className="flex flex-col justify-between overflow-hidden border shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <CardHeader className="pb-3 border-b bg-muted/20">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-semibold leading-snug line-clamp-1">
                          {recording.title || `${recording.track_title || 'Quran Session'}`}
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5 text-primary" />
                          <span>
                            {recording.track_title} &bull; {recording.level_name}
                          </span>
                        </CardDescription>
                      </div>

                      {/* Expiry Badge */}
                      {recording.is_expired ? (
                        <Badge variant="destructive" className="shrink-0 text-[10px]">
                          Expired
                        </Badge>
                      ) : recording.days_until_expiry <= 7 ? (
                        <Badge
                          variant="outline"
                          className="shrink-0 text-[10px] border-amber-500 text-amber-600 dark:text-amber-400 font-medium"
                        >
                          {recording.days_until_expiry}d left
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="shrink-0 text-[10px] text-muted-foreground">
                          {recording.days_until_expiry}d left
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-foreground/70 uppercase">Student</span>
                        <div className="flex items-center gap-1 text-foreground font-medium truncate">
                          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate">{studentDisplayName}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] font-medium text-foreground/70 uppercase">Teacher</span>
                        <div className="flex items-center gap-1 text-foreground font-medium truncate">
                          <User className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{teacherDisplayName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{recordedDate} {recordedTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{recording.duration_minutes} mins</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="p-3 bg-muted/10 border-t flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setSelectedRecording(recording)}
                  >
                    <Play className="h-3.5 w-3.5 mr-1.5 fill-current" />
                    Review Session
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                    title="Purge recording now"
                    onClick={() => setRecordingToDelete(recording)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Video Modal */}
      <Dialog open={!!selectedRecording} onOpenChange={(open) => !open && setSelectedRecording(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Video className="h-5 w-5 text-primary" />
              {selectedRecording?.title || 'Session Review'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Recorded on{' '}
              {selectedRecording &&
                `${new Date(selectedRecording.recorded_at).toLocaleDateString()} ${new Date(selectedRecording.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}{' '}
              ({selectedRecording?.duration_minutes} minutes)
            </DialogDescription>
          </DialogHeader>

          {selectedRecording && (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg bg-slate-950 p-6 text-white flex flex-col items-center justify-center min-h-[220px] text-center space-y-3">
                <Video className="h-12 w-12 text-primary/80 animate-pulse" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Session Video Stream & Meeting Reference</p>
                  <p className="text-xs text-slate-400 font-mono">
                    Room: {selectedRecording.video_room_name || 'In-App Conference'}
                  </p>
                </div>
                {selectedRecording.recording_url && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-2"
                    onClick={() => window.open(selectedRecording.recording_url, '_blank')}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    Open Recording URL / Meeting Room
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-muted/40 p-3 rounded-md">
                <div>
                  <span className="text-muted-foreground">Student:</span>{' '}
                  <strong className="text-foreground">
                    {selectedRecording.student.first_name} {selectedRecording.student.last_name} (
                    {selectedRecording.student.username})
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Teacher:</span>{' '}
                  <strong className="text-foreground">
                    {selectedRecording.teacher.first_name} {selectedRecording.teacher.last_name} (
                    {selectedRecording.teacher.username})
                  </strong>
                </div>
                <div>
                  <span className="text-muted-foreground">Curriculum:</span>{' '}
                  <span className="text-foreground">
                    {selectedRecording.track_title} &bull; {selectedRecording.level_name}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Auto-Purge In:</span>{' '}
                  <span className="text-amber-600 dark:text-amber-400 font-medium">
                    {selectedRecording.days_until_expiry} days
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRecording(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Manual Purge Modal */}
      <Dialog open={!!recordingToDelete} onOpenChange={(open) => !open && setRecordingToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Purge Recording Permanently?
            </DialogTitle>
            <DialogDescription className="text-xs pt-2">
              Are you sure you want to permanently delete this session recording? This cannot be undone
              and the media reference will be immediately removed from the archive.
            </DialogDescription>
          </DialogHeader>

          {recordingToDelete && (
            <div className="text-xs bg-muted/50 p-3 rounded border space-y-1">
              <p>
                <strong>Session:</strong> {recordingToDelete.title}
              </p>
              <p>
                <strong>Student:</strong> {recordingToDelete.student.username} &bull;{' '}
                <strong>Teacher:</strong> {recordingToDelete.teacher.username}
              </p>
              <p>
                <strong>Recorded:</strong>{' '}
                {new Date(recordingToDelete.recorded_at).toLocaleDateString()}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRecordingToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => recordingToDelete && deleteMutation.mutate(recordingToDelete.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Purging...' : 'Purge Recording'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
