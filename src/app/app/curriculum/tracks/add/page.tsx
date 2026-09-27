import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { TrackForm } from '@/features/curriculum/components/track-form';

export const metadata = {
  title: 'Create Track | Quran Academy',
};

export default function AddTrackPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Track"
        description="Add a new learning track to the academy curriculum."
        backHref="/app/curriculum?tab=subjects"
        backLabel="Back to Curriculum"
      />

      <div className="mx-auto mt-8 max-w-2xl">
        <TrackForm />
      </div>
    </div>
  );
}
