'use client';

import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';

export default function AcademyPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Academy" description="Manage your academy settings and foundation." />
      <div>Academy foundation content goes here.</div>
    </div>
  );
}
