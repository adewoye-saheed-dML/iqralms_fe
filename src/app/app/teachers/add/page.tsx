import { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { InvitationForm } from '@/features/invitations/components/invitation-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Invite Teacher | Quran Academy',
  description: 'Invite a teacher to join the academy.',
};

export default function AddTeacherPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Invite Teacher"
        description="Send an email invitation to join this academy as a teacher."
        backHref="/app/dashboard?tab=teachers"
        backLabel="Back to Teachers"
      />

      <Card>
        <CardHeader>
          <CardTitle>Teacher Details</CardTitle>
          <CardDescription>
            The teacher will receive an email with a secure invitation link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvitationForm role="teacher" />
        </CardContent>
      </Card>
    </div>
  );
}
