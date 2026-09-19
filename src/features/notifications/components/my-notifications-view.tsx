'use client';

import { notificationKeys } from '@/lib/api/query-keys';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi, type Notification } from '../api/notifications';
import { useAcademy } from '@/lib/academy/academy-provider';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';

export function MyNotificationsView() {
  const { activeAcademy } = useAcademy();
  const queryClient = useQueryClient();
  const [unreadOnly, setUnreadOnly] = React.useState(false);

  const queryKey = notificationKeys.mine(activeAcademy?.id, unreadOnly);

  const { data: notifications, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return notificationsApi.getMyNotifications(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return notificationsApi.markAsRead(activeAcademy.id, id);
    },
    onSuccess: () => {
      // Invalidate all mine notifications for this academy
      queryClient.invalidateQueries({ queryKey: notificationKeys.mine(activeAcademy?.id) });
    }
  });

  if (isLoading) return <LoadingState />;
  
  if (error) {
    if (error instanceof ApiError && error.status === 403) {
      return <ErrorState title="Access Denied" message="You don't have permission to view notifications." />;
    }
    return <ErrorState title="Failed to load notifications" message={error.message} onRetry={() => refetch()} />;
  }

  const filteredNotifications = unreadOnly
    ? notifications?.filter((n) => !n.is_read)
    : notifications;

  if (!filteredNotifications || filteredNotifications.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setUnreadOnly(!unreadOnly)}>
            {unreadOnly ? 'Show All' : 'Show Unread Only'}
          </Button>
        </div>
        <EmptyState
          title="No notifications"
          description="You are completely caught up."
          icon={<Bell className="h-10 w-10 text-muted-foreground" />}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => setUnreadOnly(!unreadOnly)}>
          {unreadOnly ? 'Show All' : 'Show Unread Only'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredNotifications.map((notification: Notification) => (
          <Card key={notification.id} className={notification.is_read ? 'opacity-70 bg-muted/30' : 'border-l-4 border-l-primary'}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{notification.title}</CardTitle>
                {!notification.is_read && (
                  <Badge variant="default">New</Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {new Date(notification.created_at).toLocaleString()}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>{notification.summary}</p>
              <div className="flex justify-between items-end pt-2">
                <Badge variant="outline">{notification.event_type_display}</Badge>
                {!notification.is_read && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    disabled={markReadMutation.isPending}
                    onClick={() => markReadMutation.mutate(notification.id)}
                  >
                    Mark as read
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
