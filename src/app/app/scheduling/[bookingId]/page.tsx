import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { ClassSession } from '@/features/scheduling/components/class-session';

export const metadata = {
  title: 'Class Session | Quran Academy',
};

interface ClassSessionPageProps {
  params: Promise<{
    bookingId: string;
  }>;
  searchParams?: Promise<{
    from?: string;
  }>;
}

export default async function ClassSessionPage({ params, searchParams }: ClassSessionPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const bookingId = parseInt(resolvedParams.bookingId, 10);
  const from = resolvedSearchParams?.from;

  const backHref = from === 'dashboard' ? '/app/dashboard' : '/app/scheduling';
  const backLabel = from === 'dashboard' ? 'Back to Dashboard' : 'Back to Scheduling';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Session"
        description="Live classroom, notes, and attendance."
        backHref={backHref}
        backLabel={backLabel}
      />

      <div className="mt-6">
        <ClassSession bookingId={bookingId} />
      </div>
    </div>
  );
}
