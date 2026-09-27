import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { InvitationsDashboard } from '@/features/invitations/components/invitations-dashboard';
import { LoadingState } from '@/components/ui/loading';

export const metadata = {
  title: 'Invitations | Quran Academy',
};

interface InvitationsPageProps {
  searchParams?: Promise<{
    role?: string;
    from?: string;
  }>;
}

export default async function InvitationsPage({ searchParams }: InvitationsPageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const from = resolvedParams?.from;
  const role = resolvedParams?.role;

  let backHref = '/app/dashboard';
  let backLabel = 'Back to Dashboard';

  if (from === 'dashboard-teachers') {
    backHref = '/app/dashboard?tab=teachers';
    backLabel = 'Back to Teachers';
  } else if (from === 'dashboard-students') {
    backHref = '/app/dashboard?tab=students';
    backLabel = 'Back to Students';
  } else if (from === 'teachers') {
    backHref = '/app/teachers';
    backLabel = 'Back to Teachers';
  } else if (from === 'students') {
    backHref = '/app/students';
    backLabel = 'Back to Students';
  } else if (role === 'teacher') {
    backHref = '/app/dashboard?tab=teachers';
    backLabel = 'Back to Teachers';
  } else if (role === 'student') {
    backHref = '/app/dashboard?tab=students';
    backLabel = 'Back to Students';
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Invitations"
        description="Invite teachers, parents, and students to your academy."
        backHref={backHref}
        backLabel={backLabel}
      />
      <React.Suspense fallback={<LoadingState />}>
        <InvitationsDashboard />
      </React.Suspense>
    </div>
  );
}
