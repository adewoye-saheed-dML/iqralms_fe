import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type Notification = components['schemas']['Notification'];
export type NotificationDelivery = components['schemas']['NotificationDelivery'];
export type EventTypeEnum = components['schemas']['EventTypeEnum'];
export type ChannelEnum = components['schemas']['ChannelEnum'];

export const notificationsApi = {
  getMyNotifications: (organizationId: number, unread?: boolean) =>
    apiClient.get<Notification[]>(
      `/api/notifications/organizations/${organizationId}/mine/`,
      { params: unread !== undefined ? { unread: unread.toString() } : undefined }
    ),

  getNotificationDetail: (organizationId: number, id: number) =>
    apiClient.get<Notification>(
      `/api/notifications/organizations/${organizationId}/${id}/`
    ),

  markAsRead: (organizationId: number, id: number) =>
    apiClient.post<Notification>(
      `/api/notifications/organizations/${organizationId}/${id}/read/`
    ),

  getAdminNotifications: (organizationId: number) =>
    apiClient.get<Notification[]>(
      `/api/notifications/organizations/${organizationId}/admin/`
    ),

  getDeliveries: (organizationId: number) =>
    apiClient.get<NotificationDelivery[]>(
      `/api/notifications/organizations/${organizationId}/deliveries/`
    ),
};
