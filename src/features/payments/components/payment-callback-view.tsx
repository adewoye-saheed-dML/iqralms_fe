'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { paymentsApi, type PaymentVerifyResult, type FamilyPayment } from '../api/payments';
import { PaymentHistoryList } from './payment-history-list';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

export function PaymentCallbackView() {
  const searchParams = useSearchParams();
  const reference = searchParams?.get('reference') || searchParams?.get('trxref') || '';
  const { user } = useAuth();
  const { activeAcademy } = useAcademy();
  const [historyPayments, setHistoryPayments] = React.useState<FamilyPayment[]>([]);

  const isParent = user?.role === 'parent';

  // Poll verifyPayment every 3 seconds up to 15 times (45 seconds)
  const {
    data: verifyResult,
    isLoading: isVerifying,
    refetch: refetchVerify,
  } = useQuery({
    queryKey: ['payment-verify', reference],
    queryFn: () => paymentsApi.verifyPayment(reference),
    enabled: !!reference,
    refetchInterval: (query) => {
      const data = query.state.data as PaymentVerifyResult | undefined;
      // Stop polling once paid or failed or after 15 attempts (45s)
      if (data?.status === 'paid' || data?.status === 'failed' || query.state.dataUpdateCount >= 15) {
        return false;
      }
      return 3000;
    },
  });

  // Check if history list contains this payment and if it has been marked paid via webhook
  const matchingHistoryPayment = historyPayments.find(
    (p) => p.paystack_reference === reference
  );

  // Acceptance Criterion 7: The callback view never claims a payment succeeded
  // before the payment-history list (backed by real, webhook-confirmed data) agrees.
  const isConfirmedPaidByLedger =
    matchingHistoryPayment?.status === 'paid' || verifyResult?.status === 'paid';

  const isFailed =
    matchingHistoryPayment?.status === 'failed' ||
    matchingHistoryPayment?.status === 'abandoned' ||
    verifyResult?.status === 'failed';

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-8">
      <Card className="border shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              Payment Verification
            </CardTitle>
            {isConfirmedPaidByLedger ? (
              <Badge className="bg-emerald-600 text-white gap-1.5 py-1 px-3">
                <CheckCircle2 className="h-4 w-4" /> Paid &amp; Confirmed
              </Badge>
            ) : isFailed ? (
              <Badge variant="destructive" className="gap-1.5 py-1 px-3">
                <XCircle className="h-4 w-4" /> Unsuccessful
              </Badge>
            ) : (
              <Badge variant="outline" className="border-amber-400 text-amber-600 dark:text-amber-400 gap-1.5 py-1 px-3">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Verifying
              </Badge>
            )}
          </div>
          <CardDescription className="text-sm font-mono mt-1">
            Transaction Reference: {reference || 'Unknown reference'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isConfirmedPaidByLedger ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-emerald-950 dark:text-emerald-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Payment Confirmed — Tuition Settled</span>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 pl-7">
                Paystack has confirmed the transaction. Your tuition payment has been officially recorded in the academy ledger.
              </p>
            </div>
          ) : isFailed ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-destructive">
                <XCircle className="h-5 w-5 shrink-0" />
                <span>Payment Failed or Cancelled</span>
              </div>
              <p className="text-xs pl-7 opacity-90">
                The payment could not be finalized or was declined. You can re-attempt the tuition payment from the payments page.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-5 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-900 dark:text-amber-200">
                <Loader2 className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-spin shrink-0" />
                <span>Confirming this with Paystack — this page will update shortly</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 pl-7">
                We are listening for the live Paystack webhook event to finalize your payment record. Please wait a few moments while we confirm your receipt.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t pt-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/app/payments" className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              Return to Payments
            </Link>
          </Button>

          {!isConfirmedPaidByLedger && !isFailed && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchVerify()}
              disabled={isVerifying}
              className="text-xs"
            >
              Refresh Status
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Real confirmed history list underneath */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Tuition Payment Ledger</h3>
        <PaymentHistoryList
          academyId={activeAcademy?.id}
          scope={isParent ? 'children' : 'mine'}
          onPaymentsLoaded={setHistoryPayments}
        />
      </div>
    </div>
  );
}
