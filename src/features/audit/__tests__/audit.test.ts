import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auditApi } from '../api/audit';
import { apiClient } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    GET: vi.fn(),
  },
}));

describe('auditApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches paginated audit logs and extracts results', async () => {
    const mockLogs = [
      { id: 1, action: 'member_invited', object_type: 'invitation', object_id: '12' },
    ];
    vi.mocked(apiClient.GET).mockResolvedValue({
      data: { count: 1, next: null, previous: null, results: mockLogs },
    } as any);

    const result = await auditApi.getAuditLogs(1);
    expect(apiClient.GET).toHaveBeenCalledWith(
      '/api/organizations/{organization_pk}/audit-logs/',
      {
        params: { path: { organization_pk: 1 }, query: undefined },
      }
    );
    expect(result).toEqual(mockLogs);
  });

  it('fetches audit log detail', async () => {
    const mockDetail = {
      id: 5,
      action: 'role_changed',
      object_type: 'membership',
      object_id: '44',
    };
    vi.mocked(apiClient.GET).mockResolvedValue({ data: mockDetail } as any);

    const result = await auditApi.getAuditLogDetail(1, 5);
    expect(apiClient.GET).toHaveBeenCalledWith(
      '/api/organizations/{organization_pk}/audit-logs/{id}/',
      {
        params: { path: { organization_pk: 1, id: 5 } },
      }
    );
    expect(result).toEqual(mockDetail);
  });
});
