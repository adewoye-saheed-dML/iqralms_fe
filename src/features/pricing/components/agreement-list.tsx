'use client';

import { pricingKeys, studentKeys } from '@/lib/api/query-keys';
import type { PricingAgreement, MyPricingAgreement } from "../api/pricing";

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { pricingApi } from '../api/pricing';
import { studentsApi } from '@/features/students/api/students';
import { useAcademy } from '@/lib/academy/academy-provider';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';

interface AgreementListProps {
  type: 'all' | 'mine';
}

function isPricingAgreement(ag: PricingAgreement | MyPricingAgreement): ag is PricingAgreement {
  return 'student' in ag;
}

export function AgreementList({ type }: AgreementListProps) {
  const { activeAcademy } = useAcademy();
  const [selectedStudentId, setSelectedStudentId] = React.useState<string>('');

  const { data: students = [] } = useQuery({
    queryKey: studentKeys.all(activeAcademy?.id),
    queryFn: () => {
      if (!activeAcademy?.id) return [];
      return studentsApi.getStudents(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id && type === 'all',
  });

  const activeStudentId = selectedStudentId
    ? parseInt(selectedStudentId, 10)
    : students[0]?.id;

  const queryKey =
    type === 'mine'
      ? pricingKeys.mine(activeAcademy?.id)
      : [...pricingKeys.agreements(activeAcademy?.id), activeStudentId];

  const { data: agreements, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      if (type === 'mine') {
        return pricingApi.getMyAgreements(activeAcademy.id);
      }
      if (!activeStudentId) return [];
      return pricingApi.getAgreements(activeAcademy.id, activeStudentId);
    },
    enabled: !!activeAcademy?.id && (type === 'mine' || !!activeStudentId),
  });

  if (isLoading) return <LoadingState />;
  
  if (error) {
    if (error instanceof ApiError && error.status === 403) {
      return <ErrorState title="Access Denied" message="You don't have permission to view pricing agreements." />;
    }
    return <ErrorState title="Failed to load agreements" message={error.message} onRetry={() => refetch()} />;
  }

  return (
    <div className="space-y-4">
      {type === 'all' && students.length > 0 && (
        <div className="max-w-xs">
          <Select
            value={String(activeStudentId || '')}
            onValueChange={setSelectedStudentId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.first_name ? `${s.first_name} ${s.last_name || ''}`.trim() : s.username}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {!agreements || agreements.length === 0 ? (
        <EmptyState
          title="No agreements"
          description="There are no pricing agreements to display."
          icon={<Wallet className="h-10 w-10 text-muted-foreground" />}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {agreements.map((agreement: PricingAgreement | MyPricingAgreement) => (
            <Card key={agreement.id} className={!agreement.active ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {isPricingAgreement(agreement)
                      ? `${agreement.student.first_name || ''} ${agreement.student.last_name || ''}`.trim() || agreement.student.username
                      : `Level ${agreement.level?.name || 'Unknown'}`
                    }
                  </CardTitle>
                  {agreement.active ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Superseded</Badge>
                  )}
                </div>
                {isPricingAgreement(agreement) && (
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
                {isPricingAgreement(agreement) && (
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
      )}
    </div>
  );
}
