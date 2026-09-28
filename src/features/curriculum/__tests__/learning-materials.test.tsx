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
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(AcademyProvider, 'useAcademy').mockReturnValue({
      activeAcademy: mockAcademy,
      activeRole: 'owner',
    } as any);

    vi.mocked(curriculumApi.getTracks).mockResolvedValue([
      { id: 1, name: 'Tajweed & Recitation', slug: 'tajweed' } as any,
    ]);
    vi.mocked(curriculumApi.getLevels).mockResolvedValue([
      { id: 10, track: 1, name: 'Level 1 - Qaida', order: 1 } as any,
    ]);
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

    renderWithProviders(<LearningMaterialsManager />);

    await waitFor(() => {
      expect(screen.getByText('Noorani Qaida Beginners Handbook')).toBeInTheDocument();
    });

    expect(screen.queryByText('Upload New Material')).not.toBeInTheDocument();
  });
});
