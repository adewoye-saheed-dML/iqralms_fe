import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { TrackDetail } from '@/features/curriculum/components/track-detail';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Manage Track | Quran Academy',
};

interface TrackDetailPageProps {
  params: {
    trackId: string;
  };
}

export default function TrackDetailPage({ params }: TrackDetailPageProps) {
  const trackId = parseInt(params.trackId, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/app/curriculum">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to curriculum</span>
          </Link>
        </Button>
        <PageHeader title="Manage Track" description="View track details and manage levels." />
      </div>

      <div className="mt-8">
        <TrackDetail trackId={trackId} />
      </div>
    </div>
  );
}
