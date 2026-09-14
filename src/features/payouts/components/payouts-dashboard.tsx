'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MyStatementView } from './my-statement-view';
import { LeadPayoutsView } from './lead-payouts-view';
import { GeneratePayoutsForm } from './generate-payouts-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function PayoutsDashboard() {
  const { activeRole } = useAcademy();
  const [showGenerate, setShowGenerate] = React.useState(false);

  const isTeacherOrSub = activeRole && ['teacher', 'sub'].includes(activeRole);
  const isLeadOrAdmin = activeRole && ['lead', 'admin', 'owner'].includes(activeRole);

  if (!isTeacherOrSub && !isLeadOrAdmin) {
    return null; 
  }

  const defaultTab = isLeadOrAdmin ? 'academy-payouts' : 'my-statement';

  return (
    <div className="space-y-4">
      {isLeadOrAdmin && (
        <div className="flex justify-end">
          <Button onClick={() => setShowGenerate(!showGenerate)}>
            <Plus className="mr-2 h-4 w-4" />
            {showGenerate ? 'Hide Generator' : 'Generate Payouts'}
          </Button>
        </div>
      )}

      {showGenerate && isLeadOrAdmin && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Generate Period Payouts</h2>
          <GeneratePayoutsForm />
        </div>
      )}

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          {(isTeacherOrSub || isLeadOrAdmin) && (
            <TabsTrigger value="my-statement">My Statement</TabsTrigger>
          )}
          {isLeadOrAdmin && (
            <TabsTrigger value="academy-payouts">Academy Payouts</TabsTrigger>
          )}
        </TabsList>

        {(isTeacherOrSub || isLeadOrAdmin) && (
          <TabsContent value="my-statement" className="pt-4">
            <MyStatementView />
          </TabsContent>
        )}
        
        {isLeadOrAdmin && (
          <TabsContent value="academy-payouts" className="pt-4">
            <LeadPayoutsView />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
