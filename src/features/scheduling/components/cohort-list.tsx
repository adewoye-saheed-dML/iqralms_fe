'use client';

import * as React from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { Users } from 'lucide-react';

export function CohortList() {

  return (
    <div className="space-y-4">
      <EmptyState
        title="Cohorts"
        description="Select a curriculum level to view open cohorts (Pending curriculum integration)."
        icon={<Users className="h-10 w-10 text-muted-foreground" />}
      />
    </div>
  );
}
