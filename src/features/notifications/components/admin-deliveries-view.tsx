'use client';

import { notificationKeys } from '@/lib/api/query-keys';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi, type NotificationDelivery } from '../api/notifications';
import { useAcademy } from '@/lib/academy/academy-provider';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { ApiError } from '@/lib/api/errors';

export function AdminDeliveriesView() {
  const { activeAcademy } = useAcademy();

  const queryKey = notificationKeys.deliveries(activeAcademy?.id);

  const { data: deliveries, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return notificationsApi.getDeliveries(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id,
  });

  if (isLoading) return <LoadingState />;
  
  if (error) {
    if (error instanceof ApiError && error.status === 403) {
      return <ErrorState title="Access Denied" message="You don't have permission to view delivery logs." />;
    }
    return <ErrorState title="Failed to load delivery logs" message={error.message} onRetry={() => refetch()} />;
  }

  if (!deliveries || deliveries.length === 0) {
    return (
      <EmptyState
        title="No delivery logs"
        description="There are no delivery logs for this academy."
        icon={<Activity className="h-10 w-10 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {deliveries.map((delivery: NotificationDelivery) => (
          <Card key={delivery.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-md">Delivery #{delivery.id} (Notification #{delivery.notification_id})</CardTitle>
                <Badge variant={delivery.status === 'delivered' ? 'default' : delivery.status === 'failed' ? 'destructive' : 'secondary'}>
                  {delivery.status_display}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Channel</span>
                  <span className="font-medium">{delivery.channel_display}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-medium">{delivery.provider}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t mt-2">
                <span className="text-muted-foreground block mb-1">Created At:</span>
                <span className="font-mono text-xs">{new Date(delivery.created_at).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
