'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvitationForm } from './invitation-form';
import { InvitationList } from './invitation-list';
import type { InvitationRole } from '../api/invitations';

const invitationRoles: InvitationRole[] = ['teacher', 'parent', 'student'];

export function InvitationsDashboard() {
  const searchParams = useSearchParams();
  const requestedRole = searchParams?.get('role') as InvitationRole | null;
  const initialRole = invitationRoles.includes(requestedRole ?? 'teacher')
    ? (requestedRole as InvitationRole)
    : 'teacher';

  const [selectedRole, setSelectedRole] = React.useState<InvitationRole | null>(null);
  const [prevRequestedRole, setPrevRequestedRole] = React.useState(requestedRole);

  if (requestedRole !== prevRequestedRole) {
    setPrevRequestedRole(requestedRole);
    setSelectedRole(null);
  }

  const role = selectedRole ?? initialRole;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Send an invitation</CardTitle>
          <CardDescription>
            Invite a teacher, parent, or student by email. Each invitation is tied to this academy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={role} onValueChange={(value) => setSelectedRole(value as InvitationRole)}>
            <TabsList>
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
              <TabsTrigger value="parent">Parent</TabsTrigger>
              <TabsTrigger value="student">Student</TabsTrigger>
            </TabsList>
            <TabsContent value="teacher" className="pt-4">
              <InvitationForm role="teacher" />
            </TabsContent>
            <TabsContent value="parent" className="pt-4">
              <InvitationForm role="parent" />
            </TabsContent>
            <TabsContent value="student" className="pt-4">
              <InvitationForm role="student" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold">Invitation History</h2>
          <p className="text-sm text-muted-foreground">
            Track delivery and resend or revoke invitations where the backend allows it.
          </p>
        </div>
        <InvitationList />
      </div>
    </div>
  );
}
