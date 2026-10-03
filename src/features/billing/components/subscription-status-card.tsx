'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { billingApi, type PlatformSubscription } from '../api/billing';
import { billingKeys } from '@/lib/api/query-keys';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, CheckCircle2, CreditCard, RefreshCw, XCircle } from 'lucide-react';

interface SubscriptionStatusCardProps {
  organizationId: number;
  subscription: PlatformSubscription | null;
  isLoading?: boolean;
}

export function SubscriptionStatusCard({
  organizationId,
  subscription,
  isLoading,
}: SubscriptionStatusCardProps) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const subscribeMutation = useMutation({
    mutationFn: () => billingApi.subscribe(organizationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription(organizationId) });
      setErrorMessage(null);
    },
    onError: (err: Error) => {
      setErrorMessage(err.message || 'Failed to initialize subscription');
    },
  });

  const status = subscription?.status;

  const renderStatusBadge = () => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 py-1 px-2.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Active Plan
          </Badge>
        );
      case 'past_due':
        return (
          <Badge variant="destructive" className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 py-1 px-2.5">
            <AlertTriangle className="h-3.5 w-3.5" /> Past Due
          </Badge>
        );
      case 'not_renewing':
        return (
          <Badge variant="secondary" className="gap-1.5 py-1 px-2.5">
            <AlertCircle className="h-3.5 w-3.5" /> Not Renewing
          </Badge>
        );
      case 'disabled':
        return (
          <Badge variant="destructive" className="gap-1.5 py-1 px-2.5">
            <XCircle className="h-3.5 w-3.5" /> Disabled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1.5 py-1 px-2.5">
            Inactive
          </Badge>
        );
    }
  };

  return (
    <Card className="border shadow-xs">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Platform Subscription
          </CardTitle>
          <CardDescription className="text-sm mt-1">
            IqraLMS recurring subscription for academy administration and LMS infrastructure.
          </CardDescription>
        </div>
        <div>{renderStatusBadge()}</div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1">
        {/* Past due warning banner */}
        {status === 'past_due' && (
          <div
            role="alert"
            className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200 space-y-1"
          >
            <div className="flex items-center gap-2 font-medium text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Payment Past Due — Subscription Grace Period</span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300 pl-6">
              A recent charge for your academy subscription failed. Your academy remains active during this grace period,
              but platform access will be suspended if renewal is not settled. Please re-subscribe below.
            </p>
          </div>
        )}

        {/* Disabled warning banner */}
        {status === 'disabled' && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive space-y-1"
          >
            <div className="flex items-center gap-2 font-medium text-sm">
              <XCircle className="h-4 w-4 shrink-0" />
              <span>Subscription Disabled</span>
            </div>
            <p className="text-xs pl-6 opacity-90">
              Your platform subscription has expired and was disabled. Academy services are restricted until reactivated.
            </p>
          </div>
        )}

        {/* Not renewing notice */}
        {status === 'not_renewing' && (
          <div
            role="alert"
            className="rounded-lg border border-border bg-muted/40 p-4 text-foreground space-y-1"
          >
            <div className="flex items-center gap-2 font-medium text-sm">
              <AlertCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>Cancellation Scheduled</span>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Your academy retains full access until the end of the current billing period ({subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'period end'}). It will not renew automatically.
            </p>
          </div>
        )}

        {/* Plan Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          <div className="rounded-md border p-3 bg-muted/20">
            <span className="text-xs text-muted-foreground block font-medium">Plan Code</span>
            <span className="text-sm font-semibold mt-0.5 block truncate">
              {subscription?.paystack_plan_code || 'Standard Academy Monthly'}
            </span>
          </div>

          <div className="rounded-md border p-3 bg-muted/20">
            <span className="text-xs text-muted-foreground block font-medium">Current Period Ends</span>
            <span className="text-sm font-semibold mt-0.5 block">
              {subscription?.current_period_end
                ? new Date(subscription.current_period_end).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : 'No active period'}
            </span>
          </div>

          <div className="rounded-md border p-3 bg-muted/20">
            <span className="text-xs text-muted-foreground block font-medium">Member Since</span>
            <span className="text-sm font-semibold mt-0.5 block">
              {subscription?.created_at
                ? new Date(subscription.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : '—'}
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded p-2.5">
            {errorMessage}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <span className="text-xs text-muted-foreground">
          {status === 'active' ? 'Managed automatically via Paystack recurring subscription.' : 'Platform subscription gives your academy access to LMS services.'}
        </span>
        <Button
          onClick={() => subscribeMutation.mutate()}
          disabled={subscribeMutation.isPending || isLoading}
          size="sm"
          variant={status === 'past_due' || status === 'disabled' ? 'default' : 'outline'}
        >
          {subscribeMutation.isPending && <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
          {status === 'active' ? 'Sync / Update Plan' : status === 'past_due' ? 'Re-subscribe Plan' : 'Subscribe Academy'}
        </Button>
      </CardFooter>
    </Card>
  );
}
