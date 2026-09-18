import { staffKeys } from '@/lib/api/query-keys';
import { can } from '@/lib/permissions/capabilities';
'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAcademy } from '@/lib/academy/academy-provider';
import { staffApi, UpdateMemberPayload, AssignableRole, Status } from '../api/staff';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface StaffDetailProps {
  memberId: number;
}

export function StaffDetail({ memberId }: StaffDetailProps) {
  const queryClient = useQueryClient();
  const { activeAcademy, activeRole } = useAcademy();

  const {
    data: member,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: staffKeys.detail(activeAcademy?.id, memberId),
    queryFn: () => staffApi.getMembership(activeAcademy!.id, memberId),
    enabled: !!activeAcademy,
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateMemberPayload) => {
      if (!activeAcademy) throw new Error('No active academy context');
      return staffApi.updateMember(activeAcademy.id, memberId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all(activeAcademy?.id) });
    },
  });

  if (!activeAcademy) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError || !member) {
    return <ErrorState title="Member Not Found" message={error?.message} />;
  }

  const canManage = can('manage_staff', { activeRole });
  const isSelf = member.role === 'owner'; // You can't demote owner. Or actually, if member is owner, owner is not assignable.

  const handleRoleChange = (newRole: AssignableRole) => {
    if (confirm(`Are you sure you want to change this member's role to ${newRole}?`)) {
      updateMutation.mutate({ role: newRole });
    }
  };

  const handleStatusChange = (newStatus: Status) => {
    const action = newStatus === 'suspended' ? 'suspend' : 'reactivate';
    if (confirm(`Are you sure you want to ${action} this member?`)) {
      updateMutation.mutate({ status: newStatus });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/app/teachers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{member.username}</h1>
      </div>

      {updateMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Update failed</AlertTitle>
          <AlertDescription>
            {updateMutation.error instanceof Error
              ? updateMutation.error.message
              : 'Unknown error occurred'}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Member Profile</CardTitle>
            <CardDescription>Identity and access details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-muted-foreground text-sm font-medium">User ID</div>
              <div>{member.user}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm font-medium">Username</div>
              <div>{member.username}</div>
            </div>
            <div>
              <div className="text-muted-foreground text-sm font-medium">Joined Academy</div>
              <div>{new Date(member.created_at).toLocaleDateString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Management</CardTitle>
            <CardDescription>Roles and status inside this academy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="text-muted-foreground text-sm font-medium">Current Role</div>
              <div className="flex items-center justify-between">
                <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                  {member.role_display}
                </Badge>
                {canManage && !isSelf && (
                  <div className="space-x-2">
                    {member.role !== 'admin' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRoleChange('admin')}
                        disabled={updateMutation.isPending}
                      >
                        Make Admin
                      </Button>
                    )}
                    {member.role !== 'staff' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRoleChange('staff')}
                        disabled={updateMutation.isPending}
                      >
                        Make Staff
                      </Button>
                    )}
                    {member.role !== 'teacher' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRoleChange('teacher')}
                        disabled={updateMutation.isPending}
                      >
                        Make Teacher
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-muted-foreground text-sm font-medium">Current Status</div>
              <div className="flex items-center justify-between">
                <Badge variant={member.status === 'active' ? 'default' : 'destructive'}>
                  {member.status_display}
                </Badge>
                {canManage && !isSelf && (
                  <div>
                    {member.status === 'active' ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStatusChange('suspended')}
                        disabled={updateMutation.isPending}
                      >
                        Suspend Member
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange('active')}
                        disabled={updateMutation.isPending}
                      >
                        Reactivate Member
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
