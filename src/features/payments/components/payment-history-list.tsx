'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi, type FamilyPayment } from '../api/payments';
import { paymentsKeys } from '@/lib/api/query-keys';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Receipt, RefreshCw, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

interface PaymentHistoryListProps {
  academyId?: number;
  scope: 'mine' | 'children';
  studentId?: number;
  onPaymentsLoaded?: (payments: FamilyPayment[]) => void;
}

export function PaymentHistoryList({
  academyId,
  scope,
  studentId,
  onPaymentsLoaded,
}: PaymentHistoryListProps) {
  const queryKey =
    scope === 'mine'
      ? paymentsKeys.mine(academyId)
      : paymentsKeys.children(academyId, studentId);

  const {
    data: payments,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const result =
        scope === 'mine'
          ? await paymentsApi.getMyPayments()
          : await paymentsApi.getChildPayments(studentId);
      return result;
    },
  });

  React.useEffect(() => {
    if (payments && onPaymentsLoaded) {
      onPaymentsLoaded(payments);
    }
  }, [payments, onPaymentsLoaded]);

  const renderStatusBadge = (status: FamilyPayment['status']) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-[11px] font-medium py-0.5 px-2">
            <CheckCircle2 className="h-3 w-3" /> Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-amber-600 border-amber-300 dark:text-amber-400 gap-1 text-[11px] font-medium py-0.5 px-2">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="gap-1 text-[11px] font-medium py-0.5 px-2">
            <XCircle className="h-3 w-3" /> Failed
          </Badge>
        );
      case 'abandoned':
        return (
          <Badge variant="secondary" className="gap-1 text-[11px] font-medium py-0.5 px-2">
            <AlertCircle className="h-3 w-3" /> Abandoned
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="border shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">
              {scope === 'children' ? "Children's Payment History" : 'My Payment History'}
            </CardTitle>
          </div>
          <CardDescription className="text-sm mt-1">
            Confirmed tuition transactions and receipts recorded via Paystack.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="h-8 gap-1.5 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>

      <CardContent className="pt-2">
        {isLoading ? (
          <div className="py-12">
            <LoadingState />
          </div>
        ) : isError ? (
          <ErrorState
            title="Failed to Load Payments"
            message={error instanceof Error ? error.message : 'Could not retrieve payment history.'}
            onRetry={() => refetch()}
          />
        ) : !payments || payments.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-10 w-10 text-muted-foreground" />}
            title="No Payment History"
            description="Completed and pending tuition transactions will be listed here with reference receipts."
          />
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium border-b">
                <tr>
                  {scope === 'children' && <th scope="col" className="px-4 py-3">Student</th>}
                  <th scope="col" className="px-4 py-3">Academy</th>
                  <th scope="col" className="px-4 py-3">Amount</th>
                  <th scope="col" className="px-4 py-3">Reference</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    {scope === 'children' && (
                      <td className="px-4 py-3 font-medium text-foreground">
                        <div>{p.student_name || p.student_username}</div>
                        {p.student_name && p.student_username && (
                          <div className="text-xs text-muted-foreground">@{p.student_username}</div>
                        )}
                      </td>
                    )}
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {p.organization_name || 'Academy'}
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">
                      {formatCurrency(p.amount, p.currency)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {p.paystack_reference}
                    </td>
                    <td className="px-4 py-3">
                      {renderStatusBadge(p.status)}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {p.paid_at
                        ? new Date(p.paid_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : p.created_at
                        ? new Date(p.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
