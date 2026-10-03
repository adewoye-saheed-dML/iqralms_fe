'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth } from '@/lib/auth/auth-provider';
import { can } from '@/lib/permissions/capabilities';
import { billingApi } from '../api/billing';
import { billingKeys } from '@/lib/api/query-keys';
import { SubscriptionStatusCard } from './subscription-status-card';
import { BankDetailsForm } from './bank-details-form';
import { OrganizationPaymentsList } from './organization-payments-list';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';

export function BillingPanel() {
  const { activeAcademy, activeRole, isLoading: isAcademyLoading } = useAcademy();
  const { user, isLoading: isAuthLoading } = useAuth();

  const canManageBilling = can('manage_subscription', {
    activeRole,
    userRole: user?.role,
  });

  const organizationId = activeAcademy?.id;

  const {
    data: subscription,
    isLoading: isSubLoading,
  } = useQuery({
    queryKey: billingKeys.subscription(organizationId),
    queryFn: () => {
      if (!organizationId) throw new Error('No active organization');
      return billingApi.getSubscriptionStatus(organizationId);
    },
    enabled: !!organizationId && canManageBilling,
  });

  if (isAcademyLoading || isAuthLoading) {
    return (
      <div className="py-12">
        <LoadingState />
      </div>
    );
  }

  if (!canManageBilling) {
    return (
      <ErrorState
        title="Access Denied"
        message="Only academy owners and administrators can manage platform subscriptions and billing."
      />
    );
  }

  if (!organizationId) {
    return (
      <ErrorState
        title="No Active Academy"
        message="Please select or create an academy to access billing."
      />
    );
  }

  return (
    <div className="space-y-8 max-w-6xl pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing &amp; Subscriptions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your IqraLMS platform subscription, tuition settlement banking, and tuition payment logs.
        </p>
      </div>

      <SubscriptionStatusCard
        organizationId={organizationId}
        subscription={subscription ?? null}
        isLoading={isSubLoading}
      />

      <BankDetailsForm
        organizationId={organizationId}
        initialBusinessName={activeAcademy.name}
      />

      <OrganizationPaymentsList organizationId={organizationId} />
    </div>
  );
}
