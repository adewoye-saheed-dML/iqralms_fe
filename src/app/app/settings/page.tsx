'use client';

import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAcademy } from '@/lib/academy/academy-provider';
import { Info, Building2 } from 'lucide-react';

export default function SettingsPage() {
  const { activeAcademy } = useAcademy();

  if (!activeAcademy) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader
        title="Academy Settings"
        description="View organization profile, timezone, and operational parameters."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Organization Details</CardTitle>
          </div>
          <CardDescription>
            Configuration parameters for {activeAcademy.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50/50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
            <Info className="h-4 w-4" />
            <AlertTitle className="font-semibold text-xs">Settings Modification Contract</AlertTitle>
            <AlertDescription className="text-xs mt-0.5">
              Academy mutation endpoint: <span className="font-semibold">BACKEND CONTRACT REQUIRED</span>.
              Organization details are currently read-only once created.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="name">Academy Name</Label>
            <Input id="name" readOnly value={activeAcademy.name} className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug / Identifier</Label>
            <Input id="slug" readOnly value={activeAcademy.slug} className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Unique identifier used in URLs and tenant isolation.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input id="timezone" readOnly value={activeAcademy.timezone} className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Standard IANA timezone name configured during academy onboarding.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="id">Organization ID</Label>
            <Input id="id" readOnly value={String(activeAcademy.id)} className="bg-muted" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
