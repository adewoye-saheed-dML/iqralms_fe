'use client';

import { curriculumKeys } from '@/lib/api/query-keys';

import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { LevelForm } from '@/features/curriculum/components/level-form';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { curriculumApi } from '@/features/curriculum/api/curriculum';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';

interface EditLevelPageProps {
  params: Promise<{
    trackId: string;
    levelId: string;
  }>;
}

export default function EditLevelPage({ params }: EditLevelPageProps) {
  const resolvedParams = React.use(params);
  const trackId = parseInt(resolvedParams.trackId, 10);
  const levelId = parseInt(resolvedParams.levelId, 10);
  const { activeAcademy } = useAcademy();

  const {
    data: track,
    isLoading,
    isError,
  } = useQuery({
    queryKey: curriculumKeys.trackDetail(activeAcademy?.id, trackId),
    queryFn: () => curriculumApi.getTrack(activeAcademy!.id, trackId),
    enabled: !!activeAcademy,
  });

  const level = track?.levels?.find((l) => l.id === levelId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Level"
        description="Update level details."
        backHref={`/app/curriculum/tracks/${trackId}`}
        backLabel="Back to Track"
      />

      <div className="mx-auto mt-8 max-w-2xl">
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState title="Error" message="Could not load track data." />
        ) : !level ? (
          <ErrorState title="Error" message="Level not found." />
        ) : (
          <LevelForm trackId={trackId} initialData={level} />
        )}
      </div>
    </div>
  );
}
