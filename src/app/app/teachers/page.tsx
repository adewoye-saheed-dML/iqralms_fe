'use client';

import * as React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { StaffDirectory } from '@/features/staff/components/staff-directory';
import { TeacherDirectory } from '@/features/teachers/components/teacher-directory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function TeachersPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Teachers & Staff"
        description="View and manage the people who operate this academy."
      />
      
      <Tabs defaultValue="teachers">
        <TabsList className="mb-4">
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="staff">Administrative Staff</TabsTrigger>
        </TabsList>
        <TabsContent value="teachers">
          <TeacherDirectory />
        </TabsContent>
        <TabsContent value="staff">
          <StaffDirectory showOnlyAdmin={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
