import { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { InvitationForm } from '@/features/invitations/components/invitation-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Invite Teacher | Quran Academy',
  description: 'Invite a teacher to join the academy.',
};

export default function AddTeacherPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/app/teachers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title="Invite Teacher"
          description="Send an email invitation to join this academy as a teacher."
        />
      </div>

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
