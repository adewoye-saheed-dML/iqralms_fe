'use client';

import { curriculumKeys } from '@/lib/api/query-keys';

import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { TrackForm } from '@/features/curriculum/components/track-form';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { curriculumApi } from '@/features/curriculum/api/curriculum';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';

interface EditTrackPageProps {
  params: Promise<{
    trackId: string;
  }>;
}

export default function EditTrackPage({ params }: EditTrackPageProps) {
  const resolvedParams = React.use(params);
  const trackId = parseInt(resolvedParams.trackId, 10);
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Track"
        description="Update track details."
        backHref={`/app/curriculum/tracks/${trackId}`}
        backLabel="Back to Track"
      />

      <div className="mx-auto mt-8 max-w-2xl">
        {isLoading ? (
          <LoadingState />
        ) : isError || !track ? (
          <ErrorState title="Error" message="Could not load track data." />
        ) : (
          <TrackForm initialData={track} />
        )}
      </div>
    </div>
  );
}
