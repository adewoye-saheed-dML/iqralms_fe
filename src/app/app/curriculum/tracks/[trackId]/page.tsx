import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { TrackDetail } from '@/features/curriculum/components/track-detail';

export const metadata = {
  title: 'Manage Track | Quran Academy',
};

interface TrackDetailPageProps {
  params: Promise<{
    trackId: string;
  }>;
}

export default async function TrackDetailPage({ params }: TrackDetailPageProps) {
  const resolvedParams = await params;
  const trackId = parseInt(resolvedParams.trackId, 10);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Track"
        description="View track details and manage levels."
        backHref="/app/curriculum?tab=subjects"
        backLabel="Back to Curriculum"
      />

      <div className="mt-8">
        <TrackDetail trackId={trackId} />
      </div>
    </div>
  );
}
