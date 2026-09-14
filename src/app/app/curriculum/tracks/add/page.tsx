import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { TrackForm } from '@/features/curriculum/components/track-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Create Track | Quran Academy',
};

export default function AddTrackPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/app/curriculum">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to curriculum</span>
          </Link>
        </Button>
        <PageHeader
          title="Create Track"
          description="Add a new learning track to the academy curriculum."
        />
      </div>

      <div className="mx-auto mt-8 max-w-2xl">
        <TrackForm />
      </div>
    </div>
  );
}
