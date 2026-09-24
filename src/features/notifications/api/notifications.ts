import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type Notification = components['schemas']['Notification'];
export type NotificationDelivery = components['schemas']['NotificationDelivery'];
export type EventTypeEnum = components['schemas']['EventTypeEnum'];
export type ChannelEnum = components['schemas']['ChannelEnum'];

export const notificationsApi = {
  getMyNotifications: async (organizationId: number): Promise<Notification[]> => {
    const { data } = await apiClient.GET('/api/notifications/organizations/{organization_pk}/mine/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  getNotification: async (organizationId: number, notificationId: number): Promise<Notification> => {
    const { data } = await apiClient.GET('/api/notifications/organizations/{organization_pk}/{id}/', {
      params: { path: { organization_pk: organizationId, id: notificationId } },
    });
    if (!data) {
      throw new Error('Notification not found');
    }
    return data;
  },

  markAsRead: async (organizationId: number, notificationId: number): Promise<Notification> => {
    const { data } = await apiClient.POST('/api/notifications/organizations/{organization_pk}/{id}/read/', {
      params: { path: { organization_pk: organizationId, id: notificationId } },
    });
    if (!data) {
      throw new Error('Failed to mark notification as read');
    }
    return data;
  },

  getAdminNotifications: async (organizationId: number): Promise<Notification[]> => {
    const { data } = await apiClient.GET('/api/notifications/organizations/{organization_pk}/admin/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  getDeliveries: async (organizationId: number): Promise<NotificationDelivery[]> => {
    const { data } = await apiClient.GET('/api/notifications/organizations/{organization_pk}/deliveries/', {
      params: { 
        path: { organization_pk: organizationId },
      },
    });
    return data ?? [];
  },
};
