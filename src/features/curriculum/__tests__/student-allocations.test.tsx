'use client';

import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StudentAllocationsTable } from '../components/student-allocations-table';
import { AudioPlacementTestsPanel } from '../components/audio-placement-tests-panel';
import { PlacementReviewQueue } from '../components/placement-review-queue';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import * as AuthProvider from '@/lib/auth/auth-provider';
import { studentsApi } from '@/features/students/api/students';
import { curriculumApi } from '../api/curriculum';
import { membershipsApi } from '@/features/memberships/api/memberships';
import { act } from 'react';

vi.mock('@/features/students/api/students', () => ({
  studentsApi: {
    getAcademyStudents: vi.fn(),
    updateStudentStatus: vi.fn(),
  },
}));

vi.mock('../api/curriculum', () => ({
  curriculumApi: {
    getTracks: vi.fn(),
    getLevels: vi.fn(),
    getAcademyTeacherTracks: vi.fn(),
    assignTeacherTrack: vi.fn(),
    updateTeacherTrack: vi.fn(),
    getPendingPlacements: vi.fn(),
    getMyPlacements: vi.fn(),
    getChildPlacements: vi.fn(),
    reviewPlacement: vi.fn(),
    getPlacementAudioUrl: vi.fn(),
  },
}));

vi.mock('@/features/memberships/api/memberships', () => ({
  membershipsApi: {
    list: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Student Allocations & Curriculum Features', () => {
  const mockAcademy = { id: 1, name: 'Furqan Academy' };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: mockAcademy,
      activeRole: 'owner',
    } as any);
    vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
      user: { id: 1, role: 'owner', username: 'owner_user' },
    } as any);
  });

  describe('StudentAllocationsTable', () => {
    it('renders enrolled students with assigned subjects, levels, and qualified teachers', async () => {
      vi.mocked(studentsApi.getAcademyStudents).mockResolvedValue([
        {
          id: 101,
          user_id: 201,
          username: 'zayd_student',
          first_name: 'Zayd',
          last_name: 'Harun',
          email: 'zayd@example.com',
          enrollment_status: 'active',
          is_minor: false,
          date_of_birth: '2005-01-01',
          track_id: 10,
          level_id: 20,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
        {
          id: 102,
          user_id: 202,
          username: 'fatima_student',
          first_name: 'Fatima',
          last_name: 'Zahra',
          email: 'fatima@example.com',
          enrollment_status: 'active',
          is_minor: true,
          date_of_birth: '2015-05-05',
          track_id: null,
          level_id: null,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ]);

      vi.mocked(curriculumApi.getTracks).mockResolvedValue([
        { id: 10, organization: 1, name: 'Tajweed Program', slug: 'tajweed' },
      ]);

      vi.mocked(curriculumApi.getLevels).mockResolvedValue([
        { id: 20, track: 10, order: 1, name: 'Foundations' } as any,
      ]);

      vi.mocked(curriculumApi.getAcademyTeacherTracks).mockResolvedValue([
        {
          id: 1,
          membership: 5,
          user: 301,
          username: 'ustadh_ali',
          organization: 1,
          track: 10,
          track_slug: 'tajweed',
          active: true,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ]);

      vi.mocked(membershipsApi.list).mockResolvedValue([
        {
          id: 5,
          organization: 1,
          user: 301,
          username: 'ustadh_ali',
          role: 'teacher',
          role_display: 'Teacher',
          status: 'active',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ]);

      renderWithProviders(<StudentAllocationsTable />);

      await waitFor(() => {
        expect(screen.getByText('Zayd Harun')).toBeInTheDocument();
        expect(screen.getByText('Tajweed Program')).toBeInTheDocument();
        expect(screen.getByText('Level 1: Foundations')).toBeInTheDocument();
        expect(screen.getByText('Ustadh ustadh_ali')).toBeInTheDocument();
      });

      expect(screen.getByText('Fatima Zahra')).toBeInTheDocument();
      expect(screen.getByText('Not Assigned')).toBeInTheDocument();
      expect(screen.getByText('Pending subject')).toBeInTheDocument();
    });

    it('opens allocation modal and updates student track and level', async () => {
      vi.mocked(studentsApi.getAcademyStudents).mockResolvedValue([
        {
          id: 102,
          user_id: 202,
          username: 'fatima_student',
          first_name: 'Fatima',
          last_name: 'Zahra',
          email: 'fatima@example.com',
          enrollment_status: 'active',
          is_minor: false,
          date_of_birth: '2005-01-01',
          track_id: null,
          level_id: null,
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
        },
      ]);

      vi.mocked(curriculumApi.getTracks).mockResolvedValue([
        { id: 10, organization: 1, name: 'Tajweed Program', slug: 'tajweed' },
      ]);

      vi.mocked(curriculumApi.getLevels).mockResolvedValue([
        { id: 20, track: 10, order: 1, name: 'Foundations' } as any,
      ]);

      vi.mocked(curriculumApi.getAcademyTeacherTracks).mockResolvedValue([]);
      vi.mocked(membershipsApi.list).mockResolvedValue([]);
      vi.mocked(studentsApi.updateStudentStatus).mockResolvedValue({} as any);

      renderWithProviders(<StudentAllocationsTable />);

      await waitFor(() => {
        expect(screen.getByText('Fatima Zahra')).toBeInTheDocument();
      });

      // Click "Allocate Level"
      fireEvent.click(screen.getByRole('button', { name: 'Allocate Level' }));

      await waitFor(() => {
        expect(screen.getByText('Allocate Level for Fatima Zahra')).toBeInTheDocument();
      });

      // Confirm allocation
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Confirm Allocation' }));
      });

      expect(studentsApi.updateStudentStatus).toHaveBeenCalledWith(1, 102, {
        track_id: 10,
        level_id: 20,
        teacher_id: null,
      });
    });
  });

  describe('AudioPlacementTestsPanel & Beginner Placement', () => {
    it('reviews complete beginner placement and recommends starting Level 1', async () => {
      vi.mocked(curriculumApi.getPendingPlacements).mockResolvedValue([
        {
          id: 55,
          student: {
            id: 88,
            username: 'beginner_student',
            first_name: 'Bilal',
            last_name: 'Habashi',
            timezone: 'UTC',
            is_minor: false,
          },
          organization: 1,
          track: 'Tajweed',
          has_audio_sample: false,
          audio_filename: null,
          skipped_as_beginner: true,
          recommended_level: null as any,
          reviewed_by: '',
          reviewed_at: null,
          reviewed_at_local: null,
          status: 'pending',
        } as any,
      ]);

      vi.mocked(curriculumApi.getTracks).mockResolvedValue([
        { id: 10, organization: 1, name: 'Tajweed', slug: 'tajweed' },
      ]);

      vi.mocked(curriculumApi.getLevels).mockResolvedValue([
        { id: 201, track: 10, order: 1, name: 'Foundations (Level 1)' } as any,
      ]);

      vi.mocked(curriculumApi.reviewPlacement).mockResolvedValue({} as any);

      renderWithProviders(<AudioPlacementTestsPanel />);

      await waitFor(() => {
        expect(screen.getByText(/Bilal Habashi — Tajweed/i)).toBeInTheDocument();
        expect(screen.getByText('Declared as a complete beginner')).toBeInTheDocument();
      });

      // Click Review
      fireEvent.click(screen.getByRole('button', { name: 'Review' }));

      await waitFor(() => {
        expect(screen.getByText('Review Bilal Habashi')).toBeInTheDocument();
        expect(screen.getByText('Complete Beginner Assessment')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Confirm Level & Allocate' })).not.toBeDisabled();
      });

      // Confirm Level & Allocate
      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Confirm Level & Allocate' }));
      });

      await waitFor(() => {
        expect(curriculumApi.reviewPlacement).toHaveBeenCalledWith(1, 55, {
          recommended_level: 201,
        });
      });
    });
  });
});
