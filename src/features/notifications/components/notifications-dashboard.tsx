'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MyNotificationsView } from './my-notifications-view';
import { AdminNotificationsView } from './admin-notifications-view';
import { AdminDeliveriesView } from './admin-deliveries-view';
import { can } from '@/lib/permissions/capabilities';

export function NotificationsDashboard() {
  const { activeRole } = useAcademy();

  const canManageAcademyNotifications = can('manage_notifications', { activeRole });
  const defaultTab = canManageAcademyNotifications ? 'admin-history' : 'my-notifications';

  return (
    <div className="space-y-4">
      <Tabs defaultValue={defaultTab}>
        <TabsList>
          <TabsTrigger value="my-notifications">My Notifications</TabsTrigger>
          {canManageAcademyNotifications && (
            <>
              <TabsTrigger value="admin-history">Academy History</TabsTrigger>
              <TabsTrigger value="admin-deliveries">Delivery Logs</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="my-notifications" className="pt-4">
          <MyNotificationsView />
        </TabsContent>
        
        {canManageAcademyNotifications && (
          <>
            <TabsContent value="admin-history" className="pt-4">
              <AdminNotificationsView />
            </TabsContent>
            <TabsContent value="admin-deliveries" className="pt-4">
              <AdminDeliveriesView />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
