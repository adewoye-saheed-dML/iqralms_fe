'use client';

import * as React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { invitationKeys } from '@/lib/api/query-keys';
import { invitationsApi, type InvitationRole } from '../api/invitations';
import { can } from '@/lib/permissions/capabilities';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/loading';
import { AlertCircle, RefreshCw, XCircle } from 'lucide-react';

const roleLabels: Record<InvitationRole, string> = {
  teacher: 'Teacher',
  parent: 'Parent',
  student: 'Student',
  admin: 'Administrator',
};

const statusVariants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  pending: 'secondary',
  accepted: 'default',
  expired: 'outline',
  revoked: 'destructive',
};

interface InvitationListProps {
  roleFilter?: InvitationRole | 'all';
  showFilters?: boolean;
}

export function InvitationList({ roleFilter: initialRoleFilter, showFilters = true }: InvitationListProps = {}) {
  const queryClient = useQueryClient();
  const { activeAcademy, activeRole } = useAcademy();
  const [activeTab, setActiveTab] = React.useState<InvitationRole | 'all'>(initialRoleFilter || 'all');

  const query = useQuery({
    queryKey: invitationKeys.all(activeAcademy?.id),
    queryFn: () => invitationsApi.list(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  const actionMutation = useMutation({
    mutationFn: async ({
      action,
      invitationId,
    }: {
      action: 'resend' | 'revoke';
      invitationId: number;
    }) => {
      if (!activeAcademy) throw new Error('No active academy context');
      return action === 'resend'
        ? invitationsApi.resend(activeAcademy.id, invitationId)
        : invitationsApi.revoke(activeAcademy.id, invitationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitationKeys.all(activeAcademy?.id),
      });
    },
  });

  if (!activeAcademy) return null;

  if (query.isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load invitations</AlertTitle>
        <AlertDescription>
          {query.error instanceof Error ? query.error.message : 'Unable to load invitations.'}
        </AlertDescription>
      </Alert>
    );
  }

  const rawData = Array.isArray(query.data) ? query.data : [];
  const allEligible = rawData.filter((invitation) =>
    ['teacher', 'parent', 'student'].includes(invitation.role),
  );

  const effectiveFilter = initialRoleFilter || activeTab;
  const items = effectiveFilter === 'all'
    ? allEligible
    : allEligible.filter((inv) => inv.role === effectiveFilter);

  const teacherCount = allEligible.filter((inv) => inv.role === 'teacher').length;
  const studentCount = allEligible.filter((inv) => inv.role === 'student').length;
  const parentCount = allEligible.filter((inv) => inv.role === 'parent').length;

  const canManage = can('manage_invitations', { activeRole });

  return (
    <div className="space-y-4">
      {!initialRoleFilter && showFilters && (
        <div className="flex flex-wrap gap-2 border-b pb-3">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('all')}
          >
            All Roles ({allEligible.length})
          </Button>
          <Button
            variant={activeTab === 'teacher' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('teacher')}
          >
            Teachers ({teacherCount})
          </Button>
          <Button
            variant={activeTab === 'student' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('student')}
          >
            Students ({studentCount})
          </Button>
          <Button
            variant={activeTab === 'parent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('parent')}
          >
            Parents ({parentCount})
          </Button>
        </div>
      )}

      {items.length === 0 ? (
        <EmptyState
          title={`No ${effectiveFilter === 'all' ? '' : effectiveFilter + ' '}invitations`}
          description={
            effectiveFilter === 'all'
              ? 'Teacher, parent, and student invitations will appear here.'
              : `No invitations sent for ${effectiveFilter}s yet.`
          }
        />
      ) : (
        <Card className="divide-y">
          {items.map((invitation) => {
            const status = invitation.status;
            const canResend = status !== 'accepted' && status !== 'revoked';
            const canRevoke = status === 'pending';

            return (
              <div
                key={invitation.id}
                className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium break-all">{invitation.email}</span>
                    <Badge variant={statusVariants[status] ?? 'outline'} className="capitalize">
                      {status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {roleLabels[invitation.role as InvitationRole] ?? invitation.role}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Sent {invitation.created_at ? new Date(invitation.created_at).toLocaleDateString() : 'recently'}
                    {' · '}
                    Expires {new Date(invitation.expires_at).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Email delivery: <span className="capitalize">{invitation.email_delivery_status || 'queued'}</span>
                  </div>
                </div>

                {canManage && (canResend || canRevoke) && (
                  <div className="flex shrink-0 gap-2">
                    {canResend && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionMutation.isPending}
                        onClick={() =>
                          actionMutation.mutate({
                            action: 'resend',
                            invitationId: invitation.id,
                          })
                        }
                      >
                        <RefreshCw className="mr-1.5 h-4 w-4" />
                        Resend
                      </Button>
                    )}
                    {canRevoke && (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={actionMutation.isPending}
                        onClick={() =>
                          actionMutation.mutate({
                            action: 'revoke',
                            invitationId: invitation.id,
                          })
                        }
                      >
                        <XCircle className="mr-1.5 h-4 w-4" />
                        Revoke
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
