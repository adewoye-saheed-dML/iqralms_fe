import { pricingKeys } from '@/lib/api/query-keys';
'use client';
import type { PricingAgreement, MyPricingAgreement } from "../api/pricing";

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { pricingApi } from '../api/pricing';
import { useAcademy } from '@/lib/academy/academy-provider';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';

interface AgreementListProps {
  type: 'all' | 'mine';
}

export function AgreementList({ type }: AgreementListProps) {
  const { activeAcademy } = useAcademy();

  const queryKey = type === 'mine' ? pricingKeys.mine(activeAcademy?.id) : pricingKeys.agreements(activeAcademy?.id);

  const { data: agreements, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return type === 'mine'
        ? pricingApi.getMyAgreements(activeAcademy.id)
        : pricingApi.getAgreements(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id,
  });

  if (isLoading) return <LoadingState />;
  
  if (error) {
    if (error instanceof ApiError && error.status === 403) {
      return <ErrorState title="Access Denied" message="You don't have permission to view pricing agreements." />;
    }
    return <ErrorState title="Failed to load agreements" message={error.message} onRetry={() => refetch()} />;
  }

  if (!agreements || agreements.length === 0) {
    return (
      <EmptyState
        title="No agreements"
        description="There are no pricing agreements to display."
        icon={<Wallet className="h-10 w-10 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {agreements.map((agreement: PricingAgreement | MyPricingAgreement) => (
        <Card key={agreement.id} className={!agreement.active ? 'opacity-60' : ''}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                {type === 'all' 
                  ? `${agreement.student?.first_name} ${agreement.student?.last_name}`
                  : `Level ${agreement.level?.name || 'Unknown'}`
                }
              </CardTitle>
              {agreement.active ? (
                <Badge variant="default">Active</Badge>
              ) : (
                <Badge variant="secondary">Superseded</Badge>
              )}
            </div>
            {type === 'all' && (
              <div className="text-sm text-muted-foreground">
                Level: {agreement.level?.name} ({agreement.track})
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Standard Rate:</span>
              <span>{agreement.standard_rate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Agreed Rate:</span>
              <span className="font-medium">{agreement.agreed_rate}</span>
            </div>
            {type === 'all' && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reason:</span>
                  <span>{agreement.reason_display}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Approved By:</span>
                  <span>{agreement.approved_by}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
