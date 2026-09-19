'use client';

import { curriculumKeys } from '@/lib/api/query-keys';
import { can } from '@/lib/permissions/capabilities';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { curriculumApi } from '../api/curriculum';
import { ApiError } from '@/lib/api/errors';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Pencil } from 'lucide-react';
import { LevelList } from './level-list';

interface TrackDetailProps {
  trackId: number;
}

export function TrackDetail({ trackId }: TrackDetailProps) {
  const { activeAcademy, activeRole } = useAcademy();

  const {
    data: track,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: curriculumKeys.trackDetail(activeAcademy?.id, trackId),
    queryFn: () => curriculumApi.getTrack(activeAcademy!.id, trackId),
    enabled: !!activeAcademy,
  });

  if (!activeAcademy) return null;

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <ErrorState
          title="Track Not Found"
          message="This track does not exist in the active academy."
        />
      );
    }
    if (error instanceof ApiError && error.status === 403) {
      return (
        <ErrorState
          title="Access Denied"
          message="You do not have permission to view this track."
        />
      );
    }
    return (
      <ErrorState
        title="Failed to load track details"
        message={error instanceof Error ? error.message : 'An unknown error occurred.'}
        onRetry={refetch}
      />
    );
  }

  if (!track) return null;

  const canManageCurriculum = can('manage_curriculum', { activeRole });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{track.name}</CardTitle>
              <CardDescription className="mt-2 font-mono text-sm">{track.slug}</CardDescription>
            </div>
            {canManageCurriculum && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/app/curriculum/tracks/${track.id}/edit`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Track
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Levels</h3>
        {canManageCurriculum && (
          <Button asChild size="sm">
            <Link href={`/app/curriculum/tracks/${track.id}/levels/add`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Level
            </Link>
          </Button>
        )}
      </div>

      <LevelList track={track} canManage={canManageCurriculum} />
    </div>
  );
}
