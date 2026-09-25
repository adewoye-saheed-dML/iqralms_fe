'use client';

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CurriculumDirectory } from '../components/curriculum-directory';
import { TrackForm } from '../components/track-form';
import { TrackDetail } from '../components/track-detail';
import { LevelForm } from '../components/level-form';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import * as AuthProvider from '@/lib/auth/auth-provider';
import { curriculumApi } from '../api/curriculum';
import { ApiError } from '@/lib/api/errors';
import { act } from 'react';

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="mock-link">
      {children}
    </a>
  ),
}));

vi.mock('../api/curriculum', () => ({
  curriculumApi: {
    getTracks: vi.fn(),
    getTrack: vi.fn(),
    getLevels: vi.fn(),
    createTrack: vi.fn(),
    updateTrack: vi.fn(),
    createLevel: vi.fn(),
    updateLevel: vi.fn(),
    getMyPlacements: vi.fn(),
    getChildPlacements: vi.fn(),
    getPendingPlacements: vi.fn(),
    submitPlacement: vi.fn(),
    reviewPlacement: vi.fn(),
    getPlacementAudioUrl: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Curriculum Feature', () => {
  const mockAcademy = { id: 1, name: 'Test Academy' };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(curriculumApi.getLevels).mockResolvedValue([]);
    vi.mocked(curriculumApi.getMyPlacements).mockResolvedValue([]);
    vi.mocked(curriculumApi.getChildPlacements).mockResolvedValue([]);
    vi.mocked(curriculumApi.getPendingPlacements).mockResolvedValue([]);
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: mockAcademy,
      activeRole: 'admin',
    } as any);
    vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
      user: { role: 'owner' },
    } as any);
  });

  describe('CurriculumDirectory', () => {
    it('renders empty state when no tracks', async () => {
      vi.mocked(curriculumApi.getTracks).mockResolvedValue([]);
      renderWithProviders(<CurriculumDirectory />);

      await waitFor(() => {
        expect(screen.getByText('No tracks defined')).toBeInTheDocument();
      });
    });

    it('renders tracks with levels successfully', async () => {
      vi.mocked(curriculumApi.getTracks).mockResolvedValue([
        {
          id: 10,
          organization: 1,
          name: 'Tajweed',
          slug: 'tajweed',
          levels: [{ id: 20, track: 10, order: 1, name: 'Beginner' }],
        },
      ]);
      vi.mocked(curriculumApi.getLevels).mockResolvedValue([
        { id: 20, track: 10, order: 1, name: 'Beginner' } as any,
      ]);
      renderWithProviders(<CurriculumDirectory />);

      await waitFor(() => {
        expect(screen.getByText('Tajweed')).toBeInTheDocument();
      });
      expect(screen.getByText('tajweed')).toBeInTheDocument();
      expect(screen.getByText('1. Beginner')).toBeInTheDocument();
    });

    it('handles 403 Forbidden', async () => {
      vi.mocked(curriculumApi.getTracks).mockRejectedValue(new ApiError(403, 'Forbidden'));
      renderWithProviders(<CurriculumDirectory />);

      await waitFor(() => {
        expect(screen.getByText('Access Denied')).toBeInTheDocument();
      });
    });
  });

  describe('TrackForm', () => {
    it('creates track successfully', async () => {
      vi.mocked(curriculumApi.createTrack).mockResolvedValue({
        id: 10,
        organization: 1,
        name: 'Tajweed',
        slug: 'tajweed',
        levels: [],
      });
      renderWithProviders(<TrackForm />);

      fireEvent.change(screen.getByLabelText('Track Name'), { target: { value: 'Tajweed' } });
      fireEvent.change(screen.getByLabelText('URL Slug'), { target: { value: 'tajweed' } });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Save Track' }));
      });

      expect(curriculumApi.createTrack).toHaveBeenCalledWith(1, {
        name: 'Tajweed',
        slug: 'tajweed',
      });
      expect(pushMock).toHaveBeenCalledWith('/app/curriculum/tracks/10');
    });

    it('handles validation error', async () => {
      vi.mocked(curriculumApi.createTrack).mockRejectedValue(
        new ApiError(400, 'Bad Request', { slug: ['Slug in use'] })
      );
      renderWithProviders(<TrackForm />);

      fireEvent.change(screen.getByLabelText('Track Name'), { target: { value: 'Tajweed' } });
      fireEvent.change(screen.getByLabelText('URL Slug'), { target: { value: 'tajweed' } });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Save Track' }));
      });

      await waitFor(() => {
        expect(screen.getByText('Slug error: Slug in use')).toBeInTheDocument();
      });
    });
  });

  describe('TrackDetail', () => {
    it('renders track and levels', async () => {
      vi.mocked(curriculumApi.getTrack).mockResolvedValue({
        id: 10,
        organization: 1,
        name: 'Hifz',
        slug: 'hifz',
        levels: [{ id: 5, track: 10, order: 1, name: 'Juz 30' }],
      });
      renderWithProviders(<TrackDetail trackId={10} />);

      await waitFor(() => {
        expect(screen.getByText('Hifz')).toBeInTheDocument();
      });
      expect(screen.getByText('Juz 30')).toBeInTheDocument();
    });

    it('handles 404', async () => {
      vi.mocked(curriculumApi.getTrack).mockRejectedValue(new ApiError(404, 'Not Found'));
      renderWithProviders(<TrackDetail trackId={10} />);

      await waitFor(() => {
        expect(screen.getByText('Track Not Found')).toBeInTheDocument();
      });
    });
  });

  describe('LevelForm', () => {
    it('creates level successfully', async () => {
      vi.mocked(curriculumApi.getTrack).mockResolvedValue({
        id: 10,
        organization: 1,
        name: 'Hifz',
        slug: 'hifz',
        levels: [],
      });
      vi.mocked(curriculumApi.createLevel).mockResolvedValue({
        id: 50,
        track: 10,
        order: 1,
        name: 'Juz 30',
        min_age: 5,
      });
      renderWithProviders(<LevelForm trackId={10} />);

      await waitFor(() => {
        expect(screen.getByText('New Level (Order 1)')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText('Level Name'), { target: { value: 'Juz 30' } });
      fireEvent.change(screen.getByLabelText('Minimum Age (Optional)'), { target: { value: '5' } });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Save Level' }));
      });

      expect(curriculumApi.createLevel).toHaveBeenCalledWith(1, expect.objectContaining({
        track: 10,
        name: 'Juz 30',
        min_age: 5,
      }));
      expect(pushMock).toHaveBeenCalledWith('/app/curriculum/tracks/10');
    });
  });
});
