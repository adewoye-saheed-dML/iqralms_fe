'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { AddStudentForm } from '@/features/students/components/add-student-form';
import { InvitationForm } from '@/features/invitations/components/invitation-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, UserPlus, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

function AddStudentContent() {
  const searchParams = useSearchParams();
  const paramTab = searchParams?.get('tab');
  const from = searchParams?.get('from');
  const initialTab = paramTab === 'attach' || paramTab === 'place' ? 'attach' : 'invite';
  const [tab, setTab] = React.useState<'invite' | 'attach'>(initialTab);

  const backHref =
    from === 'dashboard-students' || from === 'dashboard'
      ? '/app/dashboard?tab=students'
      : '/app/students';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add or Invite Student"
        description="Send an email invitation to a new student or place and enroll an onboarded platform learner."
        backHref={backHref}
        backLabel="Back to Students"
      />

      <div className="mx-auto mt-6 max-w-2xl space-y-4">
        {tab === 'invite' && (
          <Alert className="border-blue-200 bg-blue-50/50 text-blue-900 text-xs">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription>
              Students who already accepted invitations are already members of your academy. To place
              them into curriculum tracks and assign instructors, switch to{' '}
              <button
                type="button"
                onClick={() => setTab('attach')}
                className="font-semibold underline hover:text-blue-800"
              >
                Attach Existing User
              </button>{' '}
              or visit the Student Directory.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={tab} onValueChange={(val) => setTab(val as 'invite' | 'attach')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="invite" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Invite by Email
            </TabsTrigger>
            <TabsTrigger value="attach" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Attach Existing User
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invite" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Send Student Invitation</CardTitle>
                <CardDescription>
                  The student will receive an invitation email with a secure link to activate their account and join your academy.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InvitationForm role="student" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attach" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Attach Existing User</CardTitle>
                <CardDescription>
                  Place an onboarded student into a curriculum track or enter a user ID to enroll them directly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddStudentForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AddStudentPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading...</div>}>
      <AddStudentContent />
    </React.Suspense>
  );
}
