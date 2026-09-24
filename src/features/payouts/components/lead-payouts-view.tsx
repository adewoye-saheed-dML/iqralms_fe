'use client';

import { payoutsKeys } from '@/lib/api/query-keys';
import type { TeacherPayout } from "../api/payouts";

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payoutsApi } from '../api/payouts';
import { useAcademy } from '@/lib/academy/academy-provider';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';
import { can } from '@/lib/permissions/capabilities';
import { useAuth } from '@/lib/auth/auth-provider';

export function LeadPayoutsView() {
  const { activeAcademy, activeRole } = useAcademy();
  const auth = useAuth?.();
  const user = auth?.user;
  const queryClient = useQueryClient();

  const canViewAcademyPayouts = can('view_academy_payouts', {
    activeRole,
    userRole: user?.role,
  });
  const queryKey = payoutsKeys.lead(activeAcademy?.id);

  const { data: payouts, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return payoutsApi.getLeadPayouts(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id && canViewAcademyPayouts,
  });

  const finalizeMutation = useMutation({
    mutationFn: (id: number) => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return payoutsApi.finalizePayout(activeAcademy.id, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  if (!canViewAcademyPayouts) {
    return (
      <ErrorState
        title="Access Denied"
        message="You don't have permission to view academy payouts."
      />
    );
  }

  if (isLoading) return <LoadingState />;
  
  if (error) {
    if (error instanceof ApiError && error.status === 403) {
      return <ErrorState title="Access Denied" message="You don't have permission to view academy payouts." />;
    }
    return <ErrorState title="Failed to load payouts" message={error.message} onRetry={() => refetch()} />;
  }

  if (!payouts || payouts.length === 0) {
    return (
      <EmptyState
        title="No payouts"
        description="There are no payouts recorded for this academy."
        icon={<Wallet className="h-10 w-10 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {payouts.map((payout: TeacherPayout) => (
        <Card key={payout.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">Payout #{payout.id}</CardTitle>
              <Badge variant={payout.status === 'finalized' ? 'default' : 'outline'}>
                {payout.status_display}
              </Badge>
            </div>
            {payout.teacher && (
              <div className="text-sm text-muted-foreground">
                Teacher: {typeof payout.teacher === 'object'
                  ? `${(payout.teacher as { first_name?: string; last_name?: string }).first_name || ''} ${(payout.teacher as { first_name?: string; last_name?: string }).last_name || ''}`.trim() || (payout.teacher as { username?: string }).username || JSON.stringify(payout.teacher)
                  : payout.teacher}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">{payout.amount} {payout.currency}</span>
            </div>
            
            {payout.status === 'generated' && (
              <div className="pt-2">
                <Button 
                  size="sm" 
                  className="w-full"
                  disabled={finalizeMutation.isPending}
                  onClick={() => finalizeMutation.mutate(payout.id)}
                >
                  {finalizeMutation.isPending ? 'Processing...' : 'Finalize Payout'}
                </Button>
                {finalizeMutation.isError && finalizeMutation.error instanceof ApiError && finalizeMutation.error.status === 409 && (
                  <p className="text-xs text-destructive mt-1 text-center">Conflict: State already finalized or changed.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
