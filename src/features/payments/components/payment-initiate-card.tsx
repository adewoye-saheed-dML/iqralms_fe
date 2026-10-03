'use client';

import * as React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { pricingApi } from '@/features/pricing/api/pricing';
import { pricingKeys } from '@/lib/api/query-keys';
import { paymentsApi, type FamilyPayment } from '../api/payments';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, ArrowRight, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';

interface PaymentInitiateCardProps {
  organizationId: number;
  studentId?: number;
  studentName?: string;
  isParent?: boolean;
  recentChildPayments?: FamilyPayment[];
}

export function PaymentInitiateCard({
  organizationId,
  studentId,
  studentName,
  isParent = false,
  recentChildPayments = [],
}: PaymentInitiateCardProps) {
  const [selectedAgreementIdState, setSelectedAgreementId] = React.useState<number | null>(null);
  const [manualAgreementId, setManualAgreementId] = React.useState<string>('');
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Student queries own active agreements
  const { data: studentAgreements, isLoading: isAgreementsLoading } = useQuery({
    queryKey: pricingKeys.mine(organizationId),
    queryFn: () => pricingApi.getMyAgreements(organizationId),
    enabled: !isParent && !!organizationId,
  });

  const activeAgreements = React.useMemo(() => {
    return (studentAgreements || []).filter((a) => a.active);
  }, [studentAgreements]);

  // For parent: check if child has a known pricing agreement from recent payments
  const childKnownAgreementId = React.useMemo(() => {
    if (!isParent || !recentChildPayments || recentChildPayments.length === 0) return null;
    const match = recentChildPayments.find((p) => p.pricing_agreement);
    return match ? match.pricing_agreement : null;
  }, [isParent, recentChildPayments]);

  const childLastPaymentAmount = React.useMemo(() => {
    if (!isParent || !recentChildPayments || recentChildPayments.length === 0) return null;
    return recentChildPayments[0]?.amount || null;
  }, [isParent, recentChildPayments]);

  // Derived active selection without triggering cascading renders in effect
  const selectedAgreementId =
    selectedAgreementIdState ??
    (!isParent && activeAgreements.length > 0
      ? activeAgreements[0].id
      : isParent && childKnownAgreementId
      ? childKnownAgreementId
      : null);

  const payMutation = useMutation({
    mutationFn: async (agreementId: number) => {
      const callbackUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/app/payments/callback`
        : undefined;

      return paymentsApi.initializePayment(agreementId, isParent ? studentId : undefined, callbackUrl);
    },
    onSuccess: (data) => {
      if (data.authorization_url) {
        // Acceptance Criterion 6: full page redirect, never open a new tab
        window.location.href = data.authorization_url;
      } else {
        setErrorMsg('Paystack did not return an authorization URL.');
      }
    },
    onError: (err: Error) => {
      setErrorMsg(err.message || 'Payment initialization failed. Please try again.');
    },
  });

  const handlePay = () => {
    setErrorMsg(null);
    const agreementId = selectedAgreementId || (manualAgreementId ? parseInt(manualAgreementId, 10) : null);
    if (!agreementId || isNaN(agreementId)) {
      setErrorMsg('Please select or specify a valid pricing agreement.');
      return;
    }
    payMutation.mutate(agreementId);
  };

  const selectedAgreement = activeAgreements.find((a) => a.id === selectedAgreementId) || activeAgreements[0];

  return (
    <Card className="border shadow-xs">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">
              {isParent ? `Tuition Payment for ${studentName || 'Student'}` : 'Tuition & Outstanding Balance'}
            </CardTitle>
          </div>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
            0% Platform Fee
          </Badge>
        </div>
        <CardDescription className="text-sm mt-1">
          {isParent
            ? `Settle monthly academy tuition on behalf of ${studentName || 'your child'} directly to the academy.`
            : 'Settle your monthly academy tuition directly to the academy settlement subaccount.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {isAgreementsLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Loading tuition plan details...
          </div>
        ) : !isParent && activeAgreements.length === 0 ? (
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-1">
            <div className="flex items-center gap-2 font-medium text-sm">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span>No Active Tuition Agreement</span>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              You do not have an active pricing agreement assigned by the academy yet. Please contact your academy administrator or lead teacher.
            </p>
          </div>
        ) : !isParent && selectedAgreement ? (
          <div className="space-y-4">
            {activeAgreements.length > 1 && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Select Level / Track</Label>
                <div className="flex flex-wrap gap-2">
                  {activeAgreements.map((a) => (
                    <Button
                      key={a.id}
                      type="button"
                      variant={selectedAgreementId === a.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedAgreementId(a.id)}
                      className="text-xs"
                    >
                      {a.track} ({formatCurrency(a.agreed_rate)})
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-md border p-3 bg-muted/20">
                <span className="text-xs text-muted-foreground block font-medium">Track &amp; Level</span>
                <span className="text-sm font-semibold mt-0.5 block truncate">
                  {selectedAgreement.track} · {selectedAgreement.level?.name || 'Level'}
                </span>
              </div>

              <div className="rounded-md border p-3 bg-muted/20">
                <span className="text-xs text-muted-foreground block font-medium">Monthly Tuition</span>
                <span className="text-base font-bold text-foreground mt-0.5 block">
                  {formatCurrency(selectedAgreement.agreed_rate)}
                </span>
              </div>

              <div className="rounded-md border p-3 bg-muted/20">
                <span className="text-xs text-muted-foreground block font-medium">Pricing Plan</span>
                <span className="text-xs font-medium mt-0.5 block capitalize truncate">
                  {selectedAgreement.reason_display || 'Standard Academy Rate'}
                </span>
              </div>
            </div>
          </div>
        ) : isParent ? (
          <div className="space-y-4">
            {childKnownAgreementId ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-md border p-3 bg-muted/20">
                  <span className="text-xs text-muted-foreground block font-medium">Linked Student</span>
                  <span className="text-sm font-semibold mt-0.5 block">{studentName || 'Student'}</span>
                </div>
                <div className="rounded-md border p-3 bg-muted/20">
                  <span className="text-xs text-muted-foreground block font-medium">Tuition Rate</span>
                  <span className="text-base font-bold text-foreground mt-0.5 block">
                    {childLastPaymentAmount ? formatCurrency(childLastPaymentAmount) : 'Standard Tuition'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="agreement-id" className="text-xs font-medium">
                  Tuition Agreement Reference #
                </Label>
                <Input
                  id="agreement-id"
                  placeholder="Enter Agreement ID (e.g. 1)"
                  value={manualAgreementId}
                  onChange={(e) => setManualAgreementId(e.target.value.replace(/\D/g, ''))}
                  className="h-9 font-mono max-w-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Provided on the student&apos;s academy enrollment or tuition statement.
                </p>
              </div>
            )}
          </div>
        ) : null}

        {errorMsg && (
          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded p-2.5">
            {errorMsg}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Processed securely with Paystack checkout</span>
        </div>
        <Button
          onClick={handlePay}
          disabled={
            payMutation.isPending ||
            (!isParent && activeAgreements.length === 0) ||
            (isParent && !childKnownAgreementId && !manualAgreementId)
          }
          className="gap-2"
        >
          {payMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Redirecting to Paystack...
            </>
          ) : (
            <>
              Pay Tuition
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
