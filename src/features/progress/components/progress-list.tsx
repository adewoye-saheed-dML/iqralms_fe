'use client';

import { progressKeys, curriculumKeys } from '@/lib/api/query-keys';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { progressApi, StudentProgress, ProgressSnapshot } from '../api/progress';
import { curriculumApi } from '@/features/curriculum/api/curriculum';
import { useAcademy } from '@/lib/academy/academy-provider';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProgressListProps {
  type: 'mine' | 'snapshots';
}

export function ProgressList({ type }: ProgressListProps) {
  const { activeAcademy } = useAcademy();
  const [selectedTrackId, setSelectedTrackId] = React.useState<string>('');

  const { data: tracks = [] } = useQuery({
    queryKey: curriculumKeys.tracks(activeAcademy?.id),
    queryFn: () => curriculumApi.getTracks(activeAcademy!.id),
    enabled: !!activeAcademy?.id && type === 'mine',
  });

  const activeTrackId = selectedTrackId ? parseInt(selectedTrackId, 10) : tracks[0]?.id;

  const {
    data: myProgress,
    isLoading: isLoadingMine,
    error: errorMine,
    refetch: refetchMine,
  } = useQuery<StudentProgress | null>({
    queryKey: progressKeys.detail(activeAcademy?.id, activeTrackId),
    queryFn: () => {
      if (!activeAcademy?.id || !activeTrackId) return null;
      return progressApi.getMyProgress(activeAcademy.id, activeTrackId);
    },
    enabled: !!activeAcademy?.id && type === 'mine' && !!activeTrackId,
  });

  const {
    data: snapshots = [],
    isLoading: isLoadingSnapshots,
    error: errorSnapshots,
    refetch: refetchSnapshots,
  } = useQuery<ProgressSnapshot[]>({
    queryKey: progressKeys.snapshots(activeAcademy?.id),
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return progressApi.getAllSnapshots(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id && type === 'snapshots',
  });

  const isLoading = type === 'mine' ? isLoadingMine : isLoadingSnapshots;
  const error = type === 'mine' ? errorMine : errorSnapshots;
  const refetch = type === 'mine' ? refetchMine : refetchSnapshots;

  if (isLoading) return <LoadingState />;

  if (error) {
    if (error instanceof ApiError && error.status === 403) {
      return <ErrorState title="Access Denied" message="You don't have permission to view progress." />;
    }
    return <ErrorState title="Failed to load progress" message={error.message} onRetry={() => refetch()} />;
  }

  if (type === 'mine') {
    if (!activeTrackId || !myProgress) {
      return (
        <EmptyState
          title="No progress records"
          description="There are no progress records available for this track."
          icon={<TrendingUp className="h-10 w-10 text-muted-foreground" />}
        />
      );
    }

    return (
      <div className="space-y-4">
        {tracks.length > 1 && (
          <div className="max-w-xs">
            <Select value={String(activeTrackId)} onValueChange={setSelectedTrackId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Track" />
              </SelectTrigger>
              <SelectContent>
                {tracks.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Card className="max-w-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              Track: {myProgress.track?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recommended Level:</span>
              <span className="font-medium">{myProgress.recommended_level?.name || 'None'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sessions Completed:</span>
              <span className="font-medium">{myProgress.completed_sessions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sessions Assessed:</span>
              <span className="font-medium">{myProgress.assessed_sessions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Overall Average:</span>
              <span className="font-medium">{myProgress.overall_average || 'N/A'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!snapshots || snapshots.length === 0) {
    return (
      <EmptyState
        title="No snapshots found"
        description="There are no progress snapshots to display."
        icon={<TrendingUp className="h-10 w-10 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {snapshots.map((snapshot) => (
        <Card key={snapshot.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Snapshot #{snapshot.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Period End:</span>
              <span className="font-medium">{new Date(snapshot.period_end).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium">{snapshot.visible_to_family ? 'Visible to Family' : 'Internal'}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
