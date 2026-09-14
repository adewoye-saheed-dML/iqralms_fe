'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressList } from './progress-list';

export function ProgressDashboard() {
  const { activeRole } = useAcademy();

  const isStudentOrParent = activeRole && ['student', 'parent'].includes(activeRole);
  const isTeacher = activeRole && ['teacher', 'sub', 'lead'].includes(activeRole);
  const isLeadOrAdmin = activeRole && ['lead', 'admin', 'owner'].includes(activeRole);

  const defaultTab = isStudentOrParent ? 'my-progress' : (isLeadOrAdmin ? 'snapshots' : 'snapshots');

  return (
    <div className="space-y-4">
      <Tabs defaultValue={defaultTab}>
        <TabsList>
          {isStudentOrParent && <TabsTrigger value="my-progress">My Progress</TabsTrigger>}
          {(isTeacher || isLeadOrAdmin) && <TabsTrigger value="snapshots">Snapshots</TabsTrigger>}
        </TabsList>

        {isStudentOrParent && (
          <TabsContent value="my-progress" className="pt-4">
            <ProgressList type="mine" />
          </TabsContent>
        )}
        
        {(isTeacher || isLeadOrAdmin) && (
          <TabsContent value="snapshots" className="pt-4">
            <ProgressList type="snapshots" />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
