'use client';

import * as React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LearningMaterialsManager } from '../components/learning-materials-manager';
import { ClassroomMaterials } from '@/features/scheduling/components/classroom-materials';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import { materialsApi, type LearningMaterial } from '../api/materials';
import { curriculumApi } from '../api/curriculum';
import { studentsApi } from '@/features/students/api/students';
import { schedulingApi } from '@/features/scheduling/api/scheduling';

vi.mock('../api/materials', () => ({
  materialsApi: {
    getMaterials: vi.fn(),
    createMaterial: vi.fn(),
    updateMaterial: vi.fn(),
    deleteMaterial: vi.fn(),
  },
}));

vi.mock('../api/curriculum', () => ({
  curriculumApi: {
    getTracks: vi.fn(),
    getLevels: vi.fn(),
    getMyTeachingTracks: vi.fn(),
    getMyPlacements: vi.fn(),
  },
}));

vi.mock('@/features/students/api/students', () => ({
  studentsApi: {
    getMyStudents: vi.fn(),
  },
}));

vi.mock('@/features/scheduling/api/scheduling', () => ({
  schedulingApi: {
    getMyBookings: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Learning Materials Feature', () => {
  const mockAcademy = { id: 1, name: 'Iqra Quran Academy' };

  const mockMaterials: LearningMaterial[] = [
    {
      id: 101,
      organization: 1,
      track: 1,
      track_name: 'Tajweed & Recitation',
      level: 10,
      level_name: 'Level 1 - Qaida',
      level_order: 1,
      title: 'Noorani Qaida Beginners Handbook',
      description: 'Foundational reading rules and letter articulation',
      material_type: 'book',
      file: 'noorani_qaida.pdf',
      file_url: '/api/curriculum/organizations/1/materials/101/file/',
      external_url: '',
      content_text: '',
      is_active: true,
      uploaded_by: 5,
      uploaded_by_name: 'Sheikh Ahmad',
      created_at: '2026-09-20T10:00:00Z',
      updated_at: '2026-09-20T10:00:00Z',
    },
    {
      id: 102,
      organization: 1,
      track: 1,
      track_name: 'Tajweed & Recitation',
      level: null,
      level_name: null,
      level_order: null,
      title: 'Makharij Visual Articulation Chart',
      description: 'Comprehensive infographic for tongue and throat letters',
      material_type: 'image',
      file: 'makharij_chart.png',
      file_url: '/api/curriculum/organizations/1/materials/102/file/',
      external_url: '',
      content_text: '',
      is_active: true,
      uploaded_by: 5,
      uploaded_by_name: 'Sheikh Ahmad',
      created_at: '2026-09-22T10:00:00Z',
      updated_at: '2026-09-22T10:00:00Z',
    },
    {
      id: 103,
      organization: 1,
      track: null,
      track_name: null,
      level: null,
      level_name: null,
      level_order: null,
      title: 'Surah Al-Fatihah Pronunciation Notes',
      description: 'Ayah-by-ayah breakdown of stopping and prolongation',
      material_type: 'text',
      file: null,
      file_url: null,
      external_url: '',
      content_text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      is_active: true,
      uploaded_by: 5,
      uploaded_by_name: 'Sheikh Ahmad',
      created_at: '2026-09-23T10:00:00Z',
      updated_at: '2026-09-23T10:00:00Z',
    },
    {
      id: 104,
      organization: 1,
      track: 2,
      track_name: 'Hifz & Memorization',
      level: 20,
      level_name: 'Level 2 - Juz Amma',
      level_order: 2,
      title: 'Juz Amma Memorization Guide',
      description: 'Systematic schedule for memorizing the 30th juz',
      material_type: 'book',
      file: 'juz_amma.pdf',
      file_url: '/api/curriculum/organizations/1/materials/104/file/',
      external_url: '',
      content_text: '',
      is_active: true,
      uploaded_by: 5,
      uploaded_by_name: 'Sheikh Ahmad',
      created_at: '2026-09-24T10:00:00Z',
      updated_at: '2026-09-24T10:00:00Z',
    },
    {
      id: 105,
      organization: 1,
      track: 1,
      track_name: 'Tajweed & Recitation',
      level: 15,
      level_name: 'Level 5 - Advanced Ahkam',
      level_order: 5,
      title: 'Advanced Tajweed Rules Workbook',
      description: 'In-depth study of Noon Sakinah and Tanween exceptions',
      material_type: 'worksheet',
      file: 'advanced_tajweed.pdf',
      file_url: '/api/curriculum/organizations/1/materials/105/file/',
      external_url: '',
      content_text: '',
      is_active: true,
      uploaded_by: 5,
      uploaded_by_name: 'Sheikh Ahmad',
      created_at: '2026-09-25T10:00:00Z',
      updated_at: '2026-09-25T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: mockAcademy,
      activeRole: 'owner',
    } as any);

    vi.mocked(curriculumApi.getTracks).mockResolvedValue([
      { id: 1, name: 'Tajweed & Recitation', slug: 'tajweed' } as any,
      { id: 2, name: 'Hifz & Memorization', slug: 'hifz' } as any,
    ]);
    vi.mocked(curriculumApi.getLevels).mockResolvedValue([
      { id: 10, track: 1, name: 'Level 1 - Qaida', order: 1 } as any,
      { id: 15, track: 1, name: 'Level 5 - Advanced Ahkam', order: 5 } as any,
      { id: 20, track: 2, name: 'Level 2 - Juz Amma', order: 2 } as any,
    ]);
    vi.mocked(curriculumApi.getMyTeachingTracks).mockResolvedValue([]);
    vi.mocked(curriculumApi.getMyPlacements).mockResolvedValue([]);
    vi.mocked(studentsApi.getMyStudents).mockResolvedValue([]);
    vi.mocked(schedulingApi.getMyBookings).mockResolvedValue([]);
    vi.mocked(materialsApi.getMaterials).mockResolvedValue(mockMaterials);
  });

  it('renders learning materials in LearningMaterialsManager directory', async () => {
    renderWithProviders(<LearningMaterialsManager />);

    await waitFor(() => {
      expect(screen.getByText('Noorani Qaida Beginners Handbook')).toBeInTheDocument();
      expect(screen.getByText('Makharij Visual Articulation Chart')).toBeInTheDocument();
      expect(screen.getByText('Surah Al-Fatihah Pronunciation Notes')).toBeInTheDocument();
    });

    expect(screen.getByText('Curriculum Books & Learning Materials')).toBeInTheDocument();
    expect(screen.getByText('Upload New Material')).toBeInTheDocument();
  });

  it('filters learning materials by search keyword in directory', async () => {
    renderWithProviders(<LearningMaterialsManager />);

    await waitFor(() => {
      expect(screen.getByText('Noorani Qaida Beginners Handbook')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search materials by title/i);
    fireEvent.change(searchInput, { target: { value: 'Makharij' } });

    await waitFor(() => {
      expect(screen.getByText('Makharij Visual Articulation Chart')).toBeInTheDocument();
      expect(screen.queryByText('Noorani Qaida Beginners Handbook')).not.toBeInTheDocument();
    });
  });

  it('renders materials in the classroom component and allows viewing text', async () => {
    renderWithProviders(
      <ClassroomMaterials
        organizationId={1}
        trackName="Tajweed & Recitation"
        levelName="Level 1 - Qaida"
        trackId={1}
        levelId={10}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Classroom Learning Materials')).toBeInTheDocument();
      expect(screen.getByText('Noorani Qaida Beginners Handbook')).toBeInTheDocument();
      expect(screen.getByText('Surah Al-Fatihah Pronunciation Notes')).toBeInTheDocument();
    });

    // Click to view text material
    fireEvent.click(screen.getByText('Surah Al-Fatihah Pronunciation Notes'));

    await waitFor(() => {
      expect(screen.getByText('Back to All Materials')).toBeInTheDocument();
      expect(screen.getByText(/بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ/)).toBeInTheDocument();
    });
  });

  it('hides upload button for teacher role in directory', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: mockAcademy,
      activeRole: 'teacher',
    } as any);

    vi.mocked(curriculumApi.getMyTeachingTracks).mockResolvedValue([
      { id: 1, teacher: 5, track: 1, active: true } as any,
    ]);

    renderWithProviders(<LearningMaterialsManager />);

    await waitFor(() => {
      expect(screen.getByText('Noorani Qaida Beginners Handbook')).toBeInTheDocument();
    });

    expect(screen.queryByText('Upload New Material')).not.toBeInTheDocument();
  });

  it('displays books and materials scoped strictly to student attached track and level', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: mockAcademy,
      activeRole: 'student',
    } as any);

    // Student has booked session in Track 1, Level 10
    vi.mocked(schedulingApi.getMyBookings).mockResolvedValue([
      {
        id: 50,
        level: { id: 10, track: 1, name: 'Level 1 - Qaida', order: 1 },
        start_time_utc: '2026-10-10T10:00:00Z',
        status: 'scheduled',
      } as any,
    ]);

    renderWithProviders(<LearningMaterialsManager />);

    await waitFor(() => {
      // Books for their enrolled level 10 appear
      expect(screen.getByText('Noorani Qaida Beginners Handbook')).toBeInTheDocument();
      // Track-wide resources for their track appear
      expect(screen.getByText('Makharij Visual Articulation Chart')).toBeInTheDocument();
      // General academy-wide resources appear
      expect(screen.getByText('Surah Al-Fatihah Pronunciation Notes')).toBeInTheDocument();
    });

    // Books for other tracks do NOT appear
    expect(screen.queryByText('Juz Amma Memorization Guide')).not.toBeInTheDocument();
    // Books for other levels in the same track do NOT appear
    expect(screen.queryByText('Advanced Tajweed Rules Workbook')).not.toBeInTheDocument();

    // Banner indicates assigned curriculum
    expect(screen.getByText(/Assigned Curriculum:/i)).toBeInTheDocument();
  });

  it('displays notice and withholds track-specific books when student has no track/level attachment', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: mockAcademy,
      activeRole: 'student',
    } as any);

    vi.mocked(schedulingApi.getMyBookings).mockResolvedValue([]);
    vi.mocked(curriculumApi.getMyPlacements).mockResolvedValue([]);

    renderWithProviders(<LearningMaterialsManager />);

    await waitFor(() => {
      expect(
        screen.getByText(/You are not currently enrolled in any curriculum track or level/i)
      ).toBeInTheDocument();
      // General academy-wide resources remain accessible
      expect(screen.getByText('Surah Al-Fatihah Pronunciation Notes')).toBeInTheDocument();
    });

    // Track-specific books are not disclosed
    expect(screen.queryByText('Noorani Qaida Beginners Handbook')).not.toBeInTheDocument();
    expect(screen.queryByText('Juz Amma Memorization Guide')).not.toBeInTheDocument();
  });

  it('scopes books and materials for teacher to their authorized teaching tracks', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: mockAcademy,
      activeRole: 'teacher',
    } as any);

    // Teacher is authorized only for Track 1 (Tajweed)
    vi.mocked(curriculumApi.getMyTeachingTracks).mockResolvedValue([
      { id: 1, teacher: 5, track: 1, active: true } as any,
    ]);

    renderWithProviders(<LearningMaterialsManager />);

    await waitFor(() => {
      // Books in Track 1 are visible to teacher
      expect(screen.getByText('Noorani Qaida Beginners Handbook')).toBeInTheDocument();
      expect(screen.getByText('Makharij Visual Articulation Chart')).toBeInTheDocument();
      expect(screen.getByText('Advanced Tajweed Rules Workbook')).toBeInTheDocument();
      // Academy-wide is visible
      expect(screen.getByText('Surah Al-Fatihah Pronunciation Notes')).toBeInTheDocument();
    });

    // Books in unassigned Track 2 (Hifz) are NOT visible
    expect(screen.queryByText('Juz Amma Memorization Guide')).not.toBeInTheDocument();
    // Banner indicates authorized subject scope
    expect(screen.getByText(/Authorized Subject Scope:/i)).toBeInTheDocument();
  });

  it('scopes books and materials for parent to the track and level of their linked children', async () => {
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: mockAcademy,
      activeRole: 'parent',
    } as any);

    // Parent has child Bilal enrolled in Track 2, Level 20
    vi.mocked(studentsApi.getMyStudents).mockResolvedValue([
      {
        id: 99,
        user_id: 200,
        first_name: 'Bilal',
        last_name: 'Ahmad',
        username: 'bilal',
        track_id: 2,
        level_id: 20,
      } as any,
    ]);

    renderWithProviders(<LearningMaterialsManager />);

    await waitFor(() => {
      // Child's enrolled track 2 and level 20 book is visible
      expect(screen.getByText('Juz Amma Memorization Guide')).toBeInTheDocument();
      // Academy-wide resource is visible
      expect(screen.getByText('Surah Al-Fatihah Pronunciation Notes')).toBeInTheDocument();
    });

    // Other tracks not enrolled by child are NOT visible
    expect(screen.queryByText('Noorani Qaida Beginners Handbook')).not.toBeInTheDocument();
    expect(screen.queryByText('Advanced Tajweed Rules Workbook')).not.toBeInTheDocument();

    // Child switcher header displays child's name and track
    expect(screen.getByText(/Viewing Books for Child:/i)).toBeInTheDocument();
    expect(screen.getByText(/Bilal Ahmad/i)).toBeInTheDocument();
  });
});
