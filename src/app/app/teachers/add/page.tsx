import { Metadata } from 'next';
import { PageHeader } from '@/components/ui/page-header';
import { StaffInviteForm } from '@/features/staff/components/staff-invite-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Add Staff - Quran Academy',
  description: 'Add a new member to the academy.',
};

export default function AddStaffPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/app/teachers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader
          title="Add Staff Member"
          description="Enter an existing user's ID to invite them to this academy."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Details</CardTitle>
          <CardDescription>
            You must know the user&apos;s ID to add them. (Invitations are not yet supported in this
            phase).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StaffInviteForm />
        </CardContent>
      </Card>
    </div>
  );
}
