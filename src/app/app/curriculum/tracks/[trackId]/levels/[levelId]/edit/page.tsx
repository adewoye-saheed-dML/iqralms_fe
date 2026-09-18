import { curriculumKeys } from '@/lib/api/query-keys';
'use client';

import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { LevelForm } from '@/features/curriculum/components/level-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { curriculumApi } from '@/features/curriculum/api/curriculum';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';

interface EditLevelPageProps {
  params: {
    trackId: string;
    levelId: string;
  };
}

export default function EditLevelPage({ params }: EditLevelPageProps) {
  const trackId = parseInt(params.trackId, 10);
  const levelId = parseInt(params.levelId, 10);
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
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/app/curriculum/tracks/${trackId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to track</span>
          </Link>
        </Button>
        <PageHeader title="Edit Level" description="Update level details." />
      </div>

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
