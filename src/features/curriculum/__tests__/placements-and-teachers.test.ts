import { describe, it, expect, vi, beforeEach } from 'vitest';
import { curriculumApi } from '../api/curriculum';
import { apiClient } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    GET: vi.fn(),
    POST: vi.fn(),
    PATCH: vi.fn(),
  },
}));

describe('curriculumApi Teacher Track Assignments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches teacher own teaching tracks', async () => {
    const tracks = [{ id: 5, track: 1, can_teach: true }];
    vi.mocked(apiClient.GET).mockResolvedValue({ data: tracks } as any);

    const res = await curriculumApi.getMyTeachingTracks(1);
    expect(apiClient.GET).toHaveBeenCalledWith(
      '/api/curriculum/organizations/{organization_pk}/teachers/mine/',
      {
        params: { path: { organization_pk: 1 } },
      }
    );
    expect(res).toEqual(tracks);
  });

  it('assigns teacher to a track', async () => {
    const assignment = { id: 6, teacher: 2, track: 1, can_teach: true };
    vi.mocked(apiClient.POST).mockResolvedValue({ data: assignment } as any);

    const body = { teacher: 2, track: 1, can_teach: true };
    const res = await curriculumApi.assignTeacherTrack(1, body as any);

    expect(apiClient.POST).toHaveBeenCalledWith(
      '/api/curriculum/organizations/{organization_pk}/teachers/',
      {
        params: { path: { organization_pk: 1 } },
        body,
      }
    );
    expect(res).toEqual(assignment);
  });
});
