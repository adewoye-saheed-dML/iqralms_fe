import { payoutsKeys } from '@/lib/api/query-keys';
'use client';
import type { MyTeacherPayout } from "../api/payouts";

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { payoutsApi } from '../api/payouts';
import { useAcademy } from '@/lib/academy/academy-provider';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';

export function MyStatementView() {
  const { activeAcademy } = useAcademy();
  const [start, setStart] = React.useState('');
  const [end, setEnd] = React.useState('');
  const [searchParams, setSearchParams] = React.useState<{start: string, end: string} | null>(null);

  const queryKey = payoutsKeys.myStatement(activeAcademy?.id, searchParams?.start, searchParams?.end);

  const { data: statement, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      if (!activeAcademy?.id || !searchParams) throw new Error('Missing params');
      return payoutsApi.getMyStatement(activeAcademy.id, searchParams.start, searchParams.end);
    },
    enabled: !!activeAcademy?.id && !!searchParams,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (start && end) {
      setSearchParams({ start: new Date(start).toISOString(), end: new Date(end).toISOString() });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="start">Period Start</Label>
          <Input id="start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end">Period End</Label>
          <Input id="end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required />
        </div>
        <Button type="submit">View Statement</Button>
      </form>

      {isLoading && <LoadingState />}

      {error && (
        error instanceof ApiError && error.status === 403 ? (
          <ErrorState title="Access Denied" message="You do not have permission to view payouts." />
        ) : (
          <ErrorState title="Error" message={error.message} onRetry={() => refetch()} />
        )
      )}

      {statement && statement.status === 'empty' && (
        <EmptyState title="No payouts found" description="No payouts exist for the selected period." icon={<Wallet className="h-10 w-10 text-muted-foreground" />} />
      )}

      {statement && statement.status !== 'empty' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">Statement Summary</CardTitle>
                <Badge variant={statement.status === 'finalized' ? 'default' : 'secondary'}>
                  {statement.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Total Sessions</span>
                  <span className="font-medium text-lg">{statement.session_count}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Finalized Sessions</span>
                  <span className="font-medium text-lg">{statement.finalized_count}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-medium text-lg">{statement.total_amount} {statement.currency}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <h3 className="text-lg font-medium mt-6">Payout Records</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statement.payouts?.map((payout: MyTeacherPayout) => (
              <Card key={payout.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-md">Booking #{payout.booking.id}</CardTitle>
                    <Badge variant={payout.status === 'finalized' ? 'default' : 'outline'}>
                      {payout.status_display}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(payout.booking.start_time_utc).toLocaleString()}
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Student:</span>
                    <span>{payout.booking.student}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate Used:</span>
                    <span>{payout.rate_used}</span>
                  </div>
                  <div className="flex justify-between font-medium mt-2 pt-2 border-t">
                    <span>Amount:</span>
                    <span>{payout.amount} {payout.currency}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
