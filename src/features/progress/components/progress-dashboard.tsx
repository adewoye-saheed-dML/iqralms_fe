'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressList } from './progress-list';
import { FreezeSnapshotDialog } from './freeze-snapshot-dialog';

import { useAuth } from '@/lib/auth/auth-provider';

import { can } from '@/lib/permissions/capabilities';

export function ProgressDashboard() {
  const { activeRole } = useAcademy();
  const { user } = useAuth();

  const isStudentOrParent = can('view_own_progress', { userRole: user?.role, activeRole });
  const isTeacher = can('manage_progress', { userRole: user?.role, activeRole });
  const isLeadOrAdmin =
    activeRole === 'owner' ||
    activeRole === 'admin' ||
    (user?.role as string) === 'owner' ||
    (user?.role as string) === 'admin' ||
    user?.role === 'lead';

  const defaultTab = isStudentOrParent ? 'my-progress' : 'snapshots';

  return (
    <div className="space-y-4">
      {isLeadOrAdmin && (
        <div className="flex justify-end">
          <FreezeSnapshotDialog />
        </div>
      )}

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
