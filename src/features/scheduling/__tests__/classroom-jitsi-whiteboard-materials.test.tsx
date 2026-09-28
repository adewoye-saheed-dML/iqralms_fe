'use client';

import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClassSession } from '../components/class-session';
import { ClassroomMaterials } from '../components/classroom-materials';
import { ClassroomWhiteboard } from '../components/classroom-whiteboard';
import { schedulingApi } from '../api/scheduling';
import { assessmentApi } from '@/features/assessment/api/assessment';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import * as AuthProvider from '@/lib/auth/auth-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { materialsApi } from '@/features/curriculum/api/materials';

vi.mock('@/features/curriculum/api/materials', () => ({
  materialsApi: {
    getMaterials: vi.fn(),
    createMaterial: vi.fn(),
  },
}));

vi.mock('../api/scheduling', () => ({
  schedulingApi: {
    getMeeting: vi.fn(),
    completeBooking: vi.fn(),
  },
}));

vi.mock('@/features/assessment/api/assessment', () => ({
  assessmentApi: {
    submitAssessment: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Classroom Jitsi, Whiteboard & Materials Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: { id: 1, name: 'Darul Quran Academy' },
      activeRole: 'teacher',
    } as any);
    vi.spyOn(AuthProvider, 'useAuth').mockReturnValue({
      user: { id: 10, role: 'lead' },
    } as any);
  });

  it('renders classroom layout controls, live teaching timer, and Jitsi video iframe', async () => {
    vi.mocked(schedulingApi.getMeeting).mockResolvedValue({
      provider: 'jitsi',
      provider_meeting_id: 'quran-live-room-777',
      join_url: 'https://meet.jit.si/quran-live-room-777',
      display_name: 'Tajweed Mastery - Surah Al-Mulk',
    });

    renderWithProviders(<ClassSession bookingId={777} />);

    await waitFor(() => {
      expect(screen.getByText('Tajweed Mastery - Surah Al-Mulk')).toBeInTheDocument();
      expect(screen.getByText(/Teaching Time:/i)).toBeInTheDocument();
      expect(screen.getByText('Join Video Here')).toBeInTheDocument();
      expect(screen.getByText('Conclude & Log Hours for Payout')).toBeInTheDocument();
    });

    // Start in-app video
    fireEvent.click(screen.getByText('Join Video Here'));

    // Verify Jitsi iframe is embedded
    expect(screen.getByTitle('Class Video Session')).toHaveAttribute(
      'src',
      'https://meet.jit.si/quran-live-room-777'
    );

    // Verify layout switchers exist
    expect(screen.getByText('Video + Materials')).toBeInTheDocument();
    expect(screen.getByText('Video + Whiteboard')).toBeInTheDocument();
    expect(screen.getByText('Full Materials')).toBeInTheDocument();
    expect(screen.getByText('Full Whiteboard')).toBeInTheDocument();
  }, 15000);

  it('tracks teaching hours and allows teacher to conclude session for payout generation', async () => {
    vi.mocked(schedulingApi.getMeeting).mockResolvedValue({
      provider: 'jitsi',
      provider_meeting_id: 'room-payout-888',
      join_url: 'https://meet.jit.si/room-payout-888',
      display_name: 'Hifz Session #888',
    });

    vi.mocked(schedulingApi.completeBooking).mockResolvedValue({
      id: 888,
      status: 'completed',
      duration_minutes: 45,
    } as any);

    renderWithProviders(<ClassSession bookingId={888} />);

    await waitFor(() => {
      expect(screen.getByText('Conclude & Log Hours for Payout')).toBeInTheDocument();
    });

    // Click Conclude session
    fireEvent.click(screen.getByText('Conclude & Log Hours for Payout'));

    await waitFor(() => {
      expect(schedulingApi.completeBooking).toHaveBeenCalledWith(
        1,
        888,
        expect.objectContaining({
          duration_minutes: expect.any(Number),
        })
      );
      expect(screen.getByText(/Session Recorded Successfully!/i)).toBeInTheDocument();
      expect(screen.getByText(/Payout Eligible/i)).toBeInTheDocument();
    });
  });

  it('renders ClassroomMaterials with academy-uploaded learning materials and allows viewing them', async () => {
    vi.mocked(materialsApi.getMaterials).mockResolvedValue([
      {
        id: 101,
        organization: 1,
        track: 2,
        track_name: 'Quran Recitation',
        level: 3,
        level_name: 'Level 2 - Tajweed',
        level_order: 2,
        title: 'Noorani Qaida - Lesson 4 Worksheet',
        description: 'Practice sheet for Noon Sakinah and Tanween rules',
        material_type: 'worksheet',
        file: 'lesson4.pdf',
        file_url: 'http://127.0.0.1:8000/media/lesson4.pdf',
        external_url: '',
        content_text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        is_active: true,
        uploaded_by: 10,
        uploaded_by_name: 'Ustadh Ahmad',
        created_at: '2026-09-28T00:00:00Z',
        updated_at: '2026-09-28T00:00:00Z',
      },
    ]);

    renderWithProviders(
      <ClassroomMaterials
        levelName="Level 2 - Tajweed"
        trackName="Quran Recitation"
        organizationId={1}
      />
    );

    // Check title and level badge
    expect(screen.getByText('Classroom Learning Materials')).toBeInTheDocument();
    expect(screen.getByText(/Quran Recitation • Level 2 - Tajweed/i)).toBeInTheDocument();

    // Check that uploaded material item is rendered
    await waitFor(() => {
      expect(screen.getByText('Noorani Qaida - Lesson 4 Worksheet')).toBeInTheDocument();
      expect(screen.getByText(/Practice sheet for Noon Sakinah and Tanween rules/i)).toBeInTheDocument();
    });

    // Click to view the material
    fireEvent.click(screen.getByText('Noorani Qaida - Lesson 4 Worksheet'));

    // Check viewer rendered
    await waitFor(() => {
      expect(screen.getByText('Back to All Materials')).toBeInTheDocument();
      expect(screen.getByText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')).toBeInTheDocument();
    });

    // Go back to list
    fireEvent.click(screen.getByText('Back to All Materials'));
    await waitFor(() => {
      expect(screen.getByText('Noorani Qaida - Lesson 4 Worksheet')).toBeInTheDocument();
    });
  });

  it('renders ClassroomWhiteboard with drawing tools, color options, and template switchers', async () => {
    render(<ClassroomWhiteboard />);

    expect(screen.getByText('Interactive Whiteboard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Eraser/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Clear/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ruled Lines/i })).toBeInTheDocument();
    expect(screen.getByText('Makharij Guide')).toBeInTheDocument();
  });
});
