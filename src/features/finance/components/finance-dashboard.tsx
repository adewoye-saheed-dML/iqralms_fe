'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadPayoutsView } from '@/features/payouts/components/lead-payouts-view';
import { GeneratePayoutsForm } from '@/features/payouts/components/generate-payouts-form';
import { PricingDashboard } from '@/features/pricing/components/pricing-dashboard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { can } from '@/lib/permissions/capabilities';

export function FinanceDashboard() {
  const { activeRole } = useAcademy();
  const [showGenerate, setShowGenerate] = React.useState(false);

  const canManageFinance = can('manage_finance', { activeRole });
  const canViewAcademyPayouts = can('view_academy_payouts', { activeRole });

  if (!canManageFinance && !canViewAcademyPayouts) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        You do not have permission to view academy finance management.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="payouts">
        <TabsList>
          <TabsTrigger value="payouts">Payout Management</TabsTrigger>
          {canManageFinance && (
            <TabsTrigger value="pricing">Pricing Agreements</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="payouts" className="pt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowGenerate(!showGenerate)}>
              <Plus className="mr-2 h-4 w-4" />
              {showGenerate ? 'Hide Generator' : 'Generate Payouts'}
            </Button>
          </div>
          
          {showGenerate && (
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-medium mb-4">Generate Period Payouts</h2>
              <GeneratePayoutsForm />
            </div>
          )}
          
          <LeadPayoutsView />
        </TabsContent>
        
        {canManageFinance && (
          <TabsContent value="pricing" className="pt-4">
            <PricingDashboard />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
