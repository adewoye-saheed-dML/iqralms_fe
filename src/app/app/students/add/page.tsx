'use client';

import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { AddStudentForm } from '@/features/students/components/add-student-form';
import { InvitationForm } from '@/features/invitations/components/invitation-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Mail, UserPlus } from 'lucide-react';

export default function AddStudentPage() {
  const [tab, setTab] = React.useState<'invite' | 'attach'>('invite');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/app/students">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to students</span>
          </Link>
        </Button>
        <PageHeader
          title="Add or Invite Student"
          description="Send an email invitation to a new student or attach an existing platform user."
        />
      </div>

      <div className="mx-auto mt-6 max-w-2xl">
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
                  If the student already has an active account on the platform, enter their user ID to enroll them directly.
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
