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

describe('curriculumApi Placements and Teacher Assignments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits placement assessment', async () => {
    const mockPlacement = { id: 1, status: 'pending' };
    vi.mocked(apiClient.POST).mockResolvedValue({ data: mockPlacement } as any);

    const body = {
      track: 1,
      self_assessed_level: 2,
    };
    const res = await curriculumApi.submitPlacement(1, body as any);

    expect(apiClient.POST).toHaveBeenCalledWith(
      '/api/curriculum/organizations/{organization_pk}/placements/',
      {
        params: { path: { organization_pk: 1 } },
        body,
      }
    );
    expect(res).toEqual(mockPlacement);
  });

  it('fetches pending placements for lead review', async () => {
    const mockList = [{ id: 10, status: 'pending' }];
    vi.mocked(apiClient.GET).mockResolvedValue({ data: mockList } as any);

    const res = await curriculumApi.getPendingPlacements(1);
    expect(apiClient.GET).toHaveBeenCalledWith(
      '/api/curriculum/organizations/{organization_pk}/placements/pending/',
      {
        params: { path: { organization_pk: 1 } },
      }
    );
    expect(res).toEqual(mockList);
  });

  it('reviews placement with recommended level', async () => {
    const reviewed = { id: 10, status: 'reviewed', recommended_level: 3 };
    vi.mocked(apiClient.POST).mockResolvedValue({ data: reviewed } as any);

    const body = { recommended_level: 3, notes: 'Good pronunciation' };
    const res = await curriculumApi.reviewPlacement(1, 10, body as any);

    expect(apiClient.POST).toHaveBeenCalledWith(
      '/api/curriculum/organizations/{organization_pk}/placements/{id}/review/',
      {
        params: { path: { organization_pk: 1, id: 10 } },
        body,
      }
    );
    expect(res).toEqual(reviewed);
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
