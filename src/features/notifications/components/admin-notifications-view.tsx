import { notificationKeys } from '@/lib/api/query-keys';
'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi, type Notification } from '../api/notifications';
import { useAcademy } from '@/lib/academy/academy-provider';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BellRing } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';

export function AdminNotificationsView() {
  const { activeAcademy } = useAcademy();

  const queryKey = notificationKeys.admin(activeAcademy?.id);

  const { data: notifications, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return notificationsApi.getAdminNotifications(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id,
  });

  if (isLoading) return <LoadingState />;
  
  if (error) {
    if (error instanceof ApiError && error.status === 403) {
      return <ErrorState title="Access Denied" message="You don't have permission to view academy-wide notifications." />;
    }
    return <ErrorState title="Failed to load notifications" message={error.message} onRetry={() => refetch()} />;
  }

  if (!notifications || notifications.length === 0) {
    return (
      <EmptyState
        title="No academy notifications"
        description="There is no notification history for this academy."
        icon={<BellRing className="h-10 w-10 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notifications.map((notification: Notification) => (
          <Card key={notification.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{notification.title}</CardTitle>
                <Badge variant={notification.is_read ? 'secondary' : 'default'}>
                  {notification.is_read ? 'Read' : 'Unread'}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Sent to: <span className="font-medium">{notification.recipient_username}</span> • {new Date(notification.created_at).toLocaleString()}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>{notification.summary}</p>
              <div>
                <Badge variant="outline">{notification.event_type_display}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
