import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type AuditLog = components['schemas']['AuditLog'];
export type PaginatedAuditLogList = components['schemas']['PaginatedAuditLogList'];

export interface AuditLogQueryParams {
  action?: string;
  actor?: number;
  object_type?: string;
  object_id?: string;
  created_after?: string;
  created_before?: string;
  page?: number;
  page_size?: number;
}

export const auditApi = {
  getAuditLogs: async (
    organizationId: number,
    query?: AuditLogQueryParams
  ): Promise<AuditLog[]> => {
    const { data } = await apiClient.GET(
      '/api/organizations/{organization_pk}/audit-logs/',
      {
        params: {
          path: { organization_pk: organizationId },
          query,
        },
      }
    );
    if (!data) return [];
    if ('results' in data && Array.isArray(data.results)) {
      return data.results;
    }
    return [];
  },

  getAuditLogDetail: async (
    organizationId: number,
    auditLogId: number
  ): Promise<AuditLog> => {
    const { data } = await apiClient.GET(
      '/api/organizations/{organization_pk}/audit-logs/{id}/',
      {
        params: {
          path: { organization_pk: organizationId, id: auditLogId },
        },
      }
    );
    if (!data) {
      throw new Error('Audit log not found');
    }
    return data;
  },
};
