import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { ClassSession } from '@/features/scheduling/components/class-session';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Class Session | Quran Academy',
};

interface ClassSessionPageProps {
  params: Promise<{
    bookingId: string;
  }>;
}

export default async function ClassSessionPage({ params }: ClassSessionPageProps) {
  const resolvedParams = await params;
  const bookingId = parseInt(resolvedParams.bookingId, 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/app/scheduling">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to scheduling</span>
          </Link>
        </Button>
        <PageHeader title="Class Session" description="Live classroom, notes, and attendance." />
      </div>

      <div className="mt-6">
        <ClassSession bookingId={bookingId} />
      </div>
    </div>
  );
}
