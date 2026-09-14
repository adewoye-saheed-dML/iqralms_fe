'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { AgreementList } from './agreement-list';
import { AgreementForm } from './agreement-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function PricingDashboard() {
  const { activeRole } = useAcademy();
  const [showForm, setShowForm] = React.useState(false);

  const isLeadOrAdmin = activeRole && ['lead', 'admin', 'owner'].includes(activeRole);
  const isStudent = activeRole === 'student';

  if (!isLeadOrAdmin && !isStudent) {
    // Other roles shouldn't see this unless specified
    return null; 
  }

  return (
    <div className="space-y-4">
      {isLeadOrAdmin && (
        <div className="flex justify-end">
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? 'Cancel' : 'New Agreement'}
          </Button>
        </div>
      )}

      {showForm && isLeadOrAdmin && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Create Pricing Agreement</h2>
          <AgreementForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <AgreementList type={isLeadOrAdmin ? 'all' : 'mine'} />
    </div>
  );
}
