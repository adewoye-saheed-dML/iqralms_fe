'use client';

import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/auth-provider';
import { useAcademy } from '@/lib/academy/academy-provider';

export default function DashboardPage() {
  const { user } = useAuth();
  const { selectedAcademy } = useAcademy();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.first_name || user?.username}.`}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Academy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {selectedAcademy?.organization.name || 'None Selected'}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Role: {selectedAcademy?.role || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
