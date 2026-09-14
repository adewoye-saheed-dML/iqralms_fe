'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { FileQuestion, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export function StudentsPlaceholder() {
  const { activeAcademy } = useAcademy();

  if (!activeAcademy) {
    return <EmptyState title="No Academy Context" description="Please select an academy." />;
  }

  // The backend contract (openapi/schema.yml) currently lacks endpoints for:
  // 1. GET /api/organizations/{id}/students/
  // 2. POST /api/organizations/{id}/students/
  // 3. GET /api/organizations/{id}/students/{id}/
  // Therefore, Student Management is deferred until the backend contract is available.

  return (
    <div className="space-y-6">
      <Alert
        variant="default"
        className="border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Backend Contract Required</AlertTitle>
        <AlertDescription>
          Student management functionality is currently marked as <strong>OPEN</strong>. The OpenAPI
          schema does not yet provide endpoints for academy-wide student listings, creation, or
          direct enrollment. These features will be enabled once the backend contract is finalized.
        </AlertDescription>
      </Alert>

      <EmptyState
        icon={<FileQuestion className="text-muted-foreground h-10 w-10" />}
        title="Student Directory Unavailable"
        description="We are unable to load the student directory because the corresponding API endpoints have not been published in this environment."
        action={
          <Button asChild variant="outline">
            <Link href="/app/dashboard">Return to Dashboard</Link>
          </Button>
        }
      />
    </div>
  );
}
