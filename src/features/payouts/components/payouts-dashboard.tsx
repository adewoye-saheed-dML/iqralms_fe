'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth } from '@/lib/auth/auth-provider';
import { can } from '@/lib/permissions/capabilities';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadPayoutsView } from './lead-payouts-view';
import { GeneratePayoutsForm } from './generate-payouts-form';
import { MyStatementView } from './my-statement-view';

import { LoadingState } from '@/components/ui/loading';

export function PayoutsDashboard() {
  const { activeRole, isLoading: isAcademyLoading } = useAcademy();
  const auth = useAuth?.();
  const user = auth?.user;
  const isAuthLoading = auth?.isLoading;

  const canManageAcademyPayouts = can('view_academy_payouts', {
    activeRole,
    userRole: user?.role,
  });

  const canViewOwnEarnings = can('view_own_payouts', {
    activeRole,
    userRole: user?.role,
  });

  if (isAcademyLoading || isAuthLoading) {
    return <LoadingState />;
  }

  if (!canManageAcademyPayouts) {
    return <MyStatementView />;
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="academy-payouts">
        <TabsList>
          <TabsTrigger value="academy-payouts">Academy Payouts</TabsTrigger>
          <TabsTrigger value="generate">Generate Payouts</TabsTrigger>
          {canViewOwnEarnings && (
            <TabsTrigger value="my-earnings">My Earnings</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="academy-payouts" className="pt-4">
          <LeadPayoutsView />
        </TabsContent>

        <TabsContent value="generate" className="pt-4">
          <GeneratePayoutsForm />
        </TabsContent>

        {canViewOwnEarnings && (
          <TabsContent value="my-earnings" className="pt-4">
            <MyStatementView />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
