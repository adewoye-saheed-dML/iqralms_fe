'use client';

import { curriculumKeys } from '@/lib/api/query-keys';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { curriculumApi, PlacementSubmit } from '../api/curriculum';
import { ApiError } from '@/lib/api/errors';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Mic, Upload } from 'lucide-react';

const ACCEPTED_TYPES = '.flac,.m4a,.mp3,.mp4,.oga,.ogg,.opus,.wav,.webm';
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB, per the SSoT API contract

export function PlacementSubmitForm() {
  const queryClient = useQueryClient();
  const { activeAcademy } = useAcademy();

  const [trackId, setTrackId] = React.useState<string>('');
  const [audioFile, setAudioFile] = React.useState<File | null>(null);
  const [skippedAsBeginner, setSkippedAsBeginner] = React.useState(false);
  const [fileError, setFileError] = React.useState('');

  const { data: tracks = [] } = useQuery({
    queryKey: curriculumKeys.tracks(activeAcademy?.id),
    queryFn: () => curriculumApi.getTracks(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!activeAcademy) throw new Error('No academy context');
      const formData = new FormData();
      formData.append('track', trackId);
      formData.append('skipped_as_beginner', String(skippedAsBeginner));
      if (audioFile) {
        formData.append('audio_sample', audioFile);
      }
      return curriculumApi.submitPlacement(
        activeAcademy.id,
        formData as unknown as PlacementSubmit
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: curriculumKeys.placements(activeAcademy?.id, 'mine'),
      });
      setAudioFile(null);
      setSkippedAsBeginner(false);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_BYTES) {
      setFileError('That file is over the 15 MB limit.');
      setAudioFile(null);
      return;
    }
    setAudioFile(file);
    if (file) setSkippedAsBeginner(false);
  };

  let errorMessage = '';
  if (mutation.isError) {
    if (mutation.error instanceof ApiError) {
      if (mutation.error.status === 400) {
        errorMessage =
          'Submit either a recitation sample or "I\'m a complete beginner" — not both, and not neither.';
      } else if (mutation.error.status === 403) {
        errorMessage = 'Only students can submit a placement assessment.';
      } else {
        errorMessage = mutation.error.message || 'Something went wrong submitting your placement.';
      }
    } else {
      errorMessage = mutation.error.message;
    }
  }

  const canSubmit = !!trackId && (!!audioFile || skippedAsBeginner) && !(audioFile && skippedAsBeginner);

  if (mutation.isSuccess) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <CheckCircle2 className="text-success h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Placement submitted</p>
            <p className="text-muted-foreground text-sm">
              A teacher will review it and set your starting level.
            </p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => mutation.reset()}>
            Submit another
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Mic className="h-4 w-4" /> Submit a placement
        </CardTitle>
        <CardDescription>
          Record yourself reciting for the track you want to join, or tell us you&apos;re starting
          from scratch.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        {fileError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{fileError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="placement-track">Track</Label>
          <Select value={trackId} onValueChange={setTrackId} disabled={mutation.isPending}>
            <SelectTrigger id="placement-track">
              <SelectValue placeholder="Choose a track" />
            </SelectTrigger>
            <SelectContent>
              {tracks.map((track) => (
                <SelectItem key={track.id} value={String(track.id)}>
                  {track.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="placement-audio">Recitation sample</Label>
          <Input
            id="placement-audio"
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={handleFileChange}
            disabled={mutation.isPending || skippedAsBeginner}
          />
          <p className="text-muted-foreground text-sm">
            Up to 15 MB — mp3, m4a, wav, ogg, opus, flac, webm or mp4 audio.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={skippedAsBeginner}
            onChange={(e) => {
              setSkippedAsBeginner(e.target.checked);
              if (e.target.checked) setAudioFile(null);
            }}
            disabled={mutation.isPending}
            className="h-4 w-4"
          />
          I&apos;m a complete beginner — skip the recitation sample
        </label>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={() => mutation.mutate()}
          disabled={!canSubmit || mutation.isPending || !activeAcademy}
        >
          <Upload className="mr-1.5 h-4 w-4" />
          {mutation.isPending ? 'Submitting...' : 'Submit placement'}
        </Button>
      </CardFooter>
    </Card>
  );
}
