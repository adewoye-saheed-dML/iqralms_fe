'use client';

import { curriculumKeys } from '@/lib/api/query-keys';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { curriculumApi, Level, PlacementResult } from '../api/curriculum';
import { ApiError } from '@/lib/api/errors';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertCircle, ClipboardCheck, Play } from 'lucide-react';

export function PlacementReviewQueue() {
  const { activeAcademy } = useAcademy();
  const [reviewing, setReviewing] = React.useState<PlacementResult | null>(null);

  const { data: pending = [], isLoading } = useQuery({
    queryKey: curriculumKeys.placements(activeAcademy?.id, 'pending'),
    queryFn: () => curriculumApi.getPendingPlacements(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  if (!activeAcademy) return null;
  if (isLoading) return <LoadingState />;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardCheck className="h-4 w-4" /> Placement review queue
        </CardTitle>
        <Badge variant={pending.length > 0 ? 'default' : 'secondary'}>{pending.length} pending</Badge>
      </CardHeader>
      <CardContent>
        {pending.length === 0 ? (
          <EmptyState
            icon={<ClipboardCheck className="text-muted-foreground h-10 w-10" />}
            title="Nothing to review"
            description="All submitted placements have been reviewed."
          />
        ) : (
          <div className="space-y-3">
            {pending.map((placement) => (
              <div
                key={placement.id}
                className="flex items-center justify-between gap-3 rounded-md border p-3"
              >
                <div>
                  <p className="font-medium">
                    {placement.student.first_name} {placement.student.last_name} — {placement.track}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {placement.skipped_as_beginner
                      ? 'Declared as a complete beginner'
                      : placement.has_audio_sample
                        ? placement.audio_filename ?? 'Recitation sample attached'
                        : 'No sample attached'}
                  </p>
                </div>
                <Button size="sm" onClick={() => setReviewing(placement)}>
                  Review
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {reviewing && (
        <PlacementReviewDialog placement={reviewing} onClose={() => setReviewing(null)} />
      )}
    </Card>
  );
}

interface PlacementReviewDialogProps {
  placement: PlacementResult;
  onClose: () => void;
}

function PlacementReviewDialog({ placement, onClose }: PlacementReviewDialogProps) {
  const queryClient = useQueryClient();
  const { activeAcademy } = useAcademy();
  const [levelId, setLevelId] = React.useState<string>(String(placement.recommended_level.id));
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = React.useState(false);

  // Placements carry the track's *name*, not its id — resolve it against the
  // academy's tracks so we can fetch that track's levels for the dropdown.
  const { data: tracks = [] } = useQuery({
    queryKey: curriculumKeys.tracks(activeAcademy?.id),
    queryFn: () => curriculumApi.getTracks(activeAcademy!.id),
    enabled: !!activeAcademy,
  });
  const track = tracks.find((t) => t.name === placement.track);

  const { data: levels = [] } = useQuery<Level[]>({
    queryKey: curriculumKeys.levels(activeAcademy?.id, track?.id),
    queryFn: () => curriculumApi.getLevels(activeAcademy!.id, track!.id),
    enabled: !!activeAcademy && !!track,
  });

  const playSample = async () => {
    if (!activeAcademy) return;
    setLoadingAudio(true);
    try {
      const access = await curriculumApi.getPlacementAudioUrl(activeAcademy.id, placement.id);
      setAudioUrl(access.url);
    } finally {
      setLoadingAudio(false);
    }
  };

  const mutation = useMutation({
    mutationFn: () => {
      if (!activeAcademy) throw new Error('No academy context');
      return curriculumApi.reviewPlacement(activeAcademy.id, placement.id, {
        recommended_level: Number(levelId),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: curriculumKeys.placements(activeAcademy?.id, 'pending'),
      });
      onClose();
    },
  });

  let errorMessage = '';
  if (mutation.isError) {
    if (mutation.error instanceof ApiError && mutation.error.status === 403) {
      errorMessage = 'You do not have permission to review placements.';
    } else {
      errorMessage = mutation.error.message || 'Failed to save the review.';
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Review {placement.student.first_name} {placement.student.last_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {placement.skipped_as_beginner ? (
            <p className="text-muted-foreground text-sm">
              This student declared themselves a complete beginner and submitted no sample.
            </p>
          ) : placement.has_audio_sample ? (
            <div className="space-y-2">
              {audioUrl ? (
                <audio controls src={audioUrl} className="w-full" />
              ) : (
                <Button variant="outline" size="sm" onClick={playSample} disabled={loadingAudio}>
                  <Play className="mr-1.5 h-4 w-4" />
                  {loadingAudio ? 'Loading...' : 'Load sample to listen'}
                </Button>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No sample was attached.</p>
          )}

          <div className="space-y-2">
            <Label htmlFor="review-level">Recommended level</Label>
            <Select value={levelId} onValueChange={setLevelId} disabled={mutation.isPending}>
              <SelectTrigger id="review-level">
                <SelectValue placeholder="Choose a level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level.id} value={String(level.id)}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={!levelId || mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Confirm level'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
