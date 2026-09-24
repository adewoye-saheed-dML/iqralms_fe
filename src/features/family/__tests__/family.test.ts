import { describe, it, expect, vi, beforeEach } from 'vitest';
import { familyApi } from '../api/family';
import { apiClient } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
}));

describe('familyApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches linked children for the calling parent', async () => {
    const mockChildren = [
      { student_id: 101, username: 'child1', email: 'child1@example.com' },
    ];
    vi.mocked(apiClient.GET).mockResolvedValue({ data: mockChildren } as any);

    const result = await familyApi.getMyChildren();
    expect(apiClient.GET).toHaveBeenCalledWith('/api/accounts/my-children/');
    expect(result).toEqual(mockChildren);
  });

  it('fetches academy-specific children', async () => {
    const mockChildren = [
      { student_id: 101, username: 'child1', email: 'child1@example.com' },
    ];
    vi.mocked(apiClient.GET).mockResolvedValue({ data: mockChildren } as any);

    const result = await familyApi.getAcademyChildren(1);
    expect(apiClient.GET).toHaveBeenCalledWith(
      '/api/accounts/organizations/{organization_pk}/children/',
      { params: { path: { organization_pk: 1 } } }
    );
    expect(result).toEqual(mockChildren);
  });

  it('creates parent link with code', async () => {
    const linkData = { link_code: 'LINK123' };
    vi.mocked(apiClient.POST).mockResolvedValue({ data: linkData } as any);

    const result = await familyApi.createParentLink(linkData as any);
    expect(apiClient.POST).toHaveBeenCalledWith('/api/accounts/parent-links/', {
      body: linkData,
    });
    expect(result).toEqual(linkData);
  });
});
