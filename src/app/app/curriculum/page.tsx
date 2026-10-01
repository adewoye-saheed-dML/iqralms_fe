import * as React from 'react';
import { CurriculumDirectory } from '@/features/curriculum/components/curriculum-directory';

export const metadata = {
  title: 'Curriculum | Quran Academy',
};

import { LoadingState } from '@/components/ui/loading';

interface CurriculumPageProps {
  searchParams?: Promise<{
    tab?: string;
    from?: string;
  }>;
}

export default async function CurriculumPage({ searchParams }: CurriculumPageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const from = resolvedParams?.from;

  const backHref =
    from === 'dashboard-students'
      ? '/app/dashboard?tab=students'
      : from === 'dashboard-teachers'
      ? '/app/dashboard?tab=teachers'
      : from === 'dashboard'
      ? '/app/dashboard'
      : undefined;

  const backLabel =
    from === 'dashboard-students'
      ? 'Back to Students'
      : from === 'dashboard-teachers'
      ? 'Back to Teachers'
      : 'Back to Dashboard';

  return (
    <div className="space-y-6">
      <React.Suspense fallback={<LoadingState />}>
        <CurriculumDirectory />
      </React.Suspense>
    </div>
  );
}
