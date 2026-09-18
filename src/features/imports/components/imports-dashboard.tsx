'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { ImportWorkflow } from './import-workflow';
import { ErrorState } from '@/components/ui/error-state';
import { can } from '@/lib/permissions/capabilities';

export function ImportsDashboard() {
  const { activeRole } = useAcademy();

  // Based on the spec, check CanImportRecords. For frontend purposes we hide for standard members.
  // We'll rely on backend 403 for absolute enforcement.
  const canImport = can('manage_imports', { activeRole });

  if (!canImport) {
    return (
      <ErrorState 
        title="Access Denied" 
        message="You do not have permission to perform bulk imports." 
      />
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <ImportWorkflow />
    </div>
  );
}
