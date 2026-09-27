import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { LevelForm } from '@/features/curriculum/components/level-form';

export const metadata = {
  title: 'Add Level | Quran Academy',
};

interface AddLevelPageProps {
  params: Promise<{
    trackId: string;
  }>;
}

export default async function AddLevelPage({ params }: AddLevelPageProps) {
  const resolvedParams = await params;
  const trackId = parseInt(resolvedParams.trackId, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Level"
        description="Append a new progressive level to this track."
        backHref={`/app/curriculum/tracks/${trackId}`}
        backLabel="Back to Track"
      />

      <div className="mx-auto mt-8 max-w-2xl">
        <LevelForm trackId={trackId} />
      </div>
    </div>
  );
}
