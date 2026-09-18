'use client';
import { progressKeys } from '@/lib/api/query-keys';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { progressApi } from '../api/progress';
import { useAcademy } from '@/lib/academy/academy-provider';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';

interface ProgressListProps {
  type: 'mine' | 'snapshots';
}

export function ProgressList({ type }: ProgressListProps) {
  const { activeAcademy } = useAcademy();

  const queryKey = progressKeys.list(activeAcademy?.id, type);

  const { data: records, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return type === 'mine'
        ? progressApi.getMyProgress(activeAcademy.id)
        : progressApi.getAllSnapshots(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id,
  });

  if (isLoading) return <LoadingState />;
  
  if (error) {
    if (error instanceof ApiError && error.status === 403) {
      return <ErrorState title="Access Denied" message="You don't have permission to view progress." />;
    }
    return <ErrorState title="Failed to load progress" message={error.message} onRetry={() => refetch()} />;
  }

  if (!records || records.length === 0) {
    return (
      <EmptyState
        title="No progress records"
        description="There are no progress or snapshot records to display."
        icon={<TrendingUp className="h-10 w-10 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {records.map((record: any, index: number) => (
        <Card key={record.id || index}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {type === 'mine' ? `Track: ${record.track?.name}` : `Snapshot #${record.id}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {type === 'mine' ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sessions Completed:</span>
                  <span className="font-medium">{record.completed_sessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sessions Assessed:</span>
                  <span className="font-medium">{record.assessed_sessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Overall Average:</span>
                  <span className="font-medium">{record.overall_average || 'N/A'}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Snapshot Period:</span>
                  <span className="font-medium">{new Date(record.period_end).toLocaleDateString()}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
