'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { AgreementList } from './agreement-list';
import { AgreementForm } from './agreement-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

import { useAuth } from '@/lib/auth/auth-provider';

import { can } from '@/lib/permissions/capabilities';

export function PricingDashboard() {
  const { activeRole, isLoading: isAcademyLoading } = useAcademy();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [showForm, setShowForm] = React.useState(false);

  const isLeadOrAdmin = can('manage_pricing', { activeRole, userRole: user?.role });
  const isStudentOrParent =
    can('view_own_pricing', { userRole: user?.role, activeRole }) ||
    activeRole === 'parent' ||
    user?.role === 'parent';

  if (isAcademyLoading || isAuthLoading) {
    return null;
  }

  if (!isLeadOrAdmin && !isStudentOrParent) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Pricing agreements are managed by academy administrators or viewed by enrolled students.
      </div>
    );
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
