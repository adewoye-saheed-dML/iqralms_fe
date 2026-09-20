import { PageHeader } from '@/components/ui/page-header';
import { InvitationsDashboard } from '@/features/invitations/components/invitations-dashboard';

export const metadata = {
  title: 'Invitations | Quran Academy',
};

export default function InvitationsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Invitations"
        description="Invite teachers, parents, and students to your academy."
      />
      <InvitationsDashboard />
    </div>
  );
}
