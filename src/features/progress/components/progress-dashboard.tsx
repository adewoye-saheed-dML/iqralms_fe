'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressList } from './progress-list';

import { useAuth } from '@/lib/auth/auth-provider';

import { can } from '@/lib/permissions/capabilities';

export function ProgressDashboard() {
  const { activeRole } = useAcademy();
  const { user } = useAuth();

  const isStudentOrParent = can('view_own_progress', { userRole: user?.role });
  const isTeacher = can('manage_progress', { userRole: user?.role, activeRole });
  const isLeadOrAdmin = can('manage_academy', { activeRole });

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
