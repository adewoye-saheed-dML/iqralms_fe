import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type Notification = components['schemas']['Notification'];
export type NotificationDelivery = components['schemas']['NotificationDelivery'];
export type EventTypeEnum = components['schemas']['EventTypeEnum'];
export type ChannelEnum = components['schemas']['ChannelEnum'];

export const notificationsApi = {
  getMyNotifications: async (organizationId: number) => {
    const { data } = await apiClient.GET('/api/notifications/organizations/{organization_pk}/mine/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data as Notification[];
  },

  markAsRead: async (organizationId: number, notificationId: number) => {
    const { data } = await apiClient.POST('/api/notifications/organizations/{organization_pk}/{id}/read/', {
      params: { path: { organization_pk: organizationId, id: notificationId } },
    });
    return data as Notification;
  },

  getAdminNotifications: async (organizationId: number) => {
    const { data } = await apiClient.GET('/api/notifications/organizations/{organization_pk}/admin/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data as Notification[];
  },

  getDeliveries: async (organizationId: number, eventType?: EventTypeEnum, channel?: ChannelEnum) => {
    const { data } = await apiClient.GET('/api/notifications/organizations/{organization_pk}/deliveries/', {
      params: { 
        path: { organization_pk: organizationId },
        query: { 
          ...(eventType ? { event_type: eventType } : {}),
          ...(channel ? { channel } : {})
        }
      },
    });
    return data as NotificationDelivery[];
  },
};
