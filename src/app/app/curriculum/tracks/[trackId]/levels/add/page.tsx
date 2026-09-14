import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { LevelForm } from '@/features/curriculum/components/level-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Add Level | Quran Academy',
};

interface AddLevelPageProps {
  params: {
    trackId: string;
  };
}

export default function AddLevelPage({ params }: AddLevelPageProps) {
  const trackId = parseInt(params.trackId, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href={`/app/curriculum/tracks/${trackId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to track</span>
          </Link>
        </Button>
        <PageHeader title="Add Level" description="Append a new progressive level to this track." />
      </div>

      <div className="mx-auto mt-8 max-w-2xl">
        <LevelForm trackId={trackId} />
      </div>
    </div>
  );
}
