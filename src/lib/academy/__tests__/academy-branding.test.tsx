'use client';

import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  applyAcademyTheme,
  getAcademyBranding,
  saveAcademyBranding,
  resetAcademyBranding,
  DEFAULT_PRIMARY_COLOR,
  type AcademyBranding,
} from '../academy-branding';
import SettingsPage from '@/app/app/settings/page';
import { AppSidebar } from '@/components/layout/app-sidebar';
import * as AcademyProvider from '@/lib/academy/academy-provider';
import * as AuthProvider from '@/lib/auth/auth-provider';

// Mock dependencies
vi.mock('@/lib/auth/auth-provider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/academy/academy-provider', () => ({
  useAcademy: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/app/dashboard',
  useRouter: () => ({ push: vi.fn() }),
}));

describe('Academy Branding & Dynamic Tab Wording', () => {
  beforeEach(() => {
    localStorage.clear();
    document.title = '';
    document.documentElement.style.removeProperty('--primary');
  });

  describe('applyAcademyTheme & Document Title', () => {
    it('sets browser tab title to "ikacad | Iqra LMS" when active academy is ikacad', () => {
      applyAcademyTheme(null, 'ikacad');
      expect(document.title).toBe('ikacad | Iqra LMS');
    });

    it('sets browser tab title to "dia | Iqra LMS" when active academy is dia', () => {
      applyAcademyTheme(null, 'dia');
      expect(document.title).toBe('dia | Iqra LMS');
    });

    it('falls back to "Iqra LMS - Quran Academy Platform" when no academy is active (e.g. marketing)', () => {
      applyAcademyTheme(null);
      expect(document.title).toBe('Iqra LMS - Quran Academy Platform');
    });

    it('applies customized academy color to CSS variable --primary', () => {
      const branding: AcademyBranding = {
        academyId: 10,
        academyName: 'ikacad',
        primaryColor: '#1d4ed8',
      };
      applyAcademyTheme(branding, 'ikacad');
      expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#1d4ed8');
    });

    it('resets CSS variable --primary to default Islamic green when no custom color is provided', () => {
      applyAcademyTheme(null, 'ikacad');
      expect(document.documentElement.style.getPropertyValue('--primary')).toBe(DEFAULT_PRIMARY_COLOR);
    });
  });

  describe('Local Storage Persistence', () => {
    it('saves and retrieves academy branding for specific academy ID', () => {
      const branding: AcademyBranding = {
        academyId: 42,
        academyName: 'ikacad',
        logoUrl: 'data:image/png;base64,mockicon',
        primaryColor: '#059669',
      };

      saveAcademyBranding(branding);
      const loaded = getAcademyBranding(42);

      expect(loaded).not.toBeNull();
      expect(loaded?.academyName).toBe('ikacad');
      expect(loaded?.logoUrl).toBe('data:image/png;base64,mockicon');
      expect(loaded?.primaryColor).toBe('#059669');
    });

    it('resets academy branding properly', () => {
      const branding: AcademyBranding = {
        academyId: 42,
        academyName: 'ikacad',
        primaryColor: '#059669',
      };

      saveAcademyBranding(branding);
      expect(getAcademyBranding(42)).not.toBeNull();

      resetAcademyBranding(42, 'ikacad');
      expect(getAcademyBranding(42)).toBeNull();
    });
  });

  describe('SettingsPage Branding & Customization UI', () => {
    beforeEach(() => {
      vi.mocked(AuthProvider.useAuth).mockReturnValue({
        user: { id: 1, username: 'owner_user', role: 'owner' },
        isAuthenticated: true,
      } as any);

      vi.mocked(AcademyProvider.useAcademy).mockReturnValue({
        activeAcademy: {
          id: 77,
          name: 'ikacad',
          slug: 'ikacad',
          timezone: 'Africa/Lagos',
          is_active: true,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        },
        activeRole: 'owner',
        academies: [],
        activeMembership: null,
        isLoading: false,
        error: null,
        setActiveAcademy: vi.fn(),
        refreshAcademies: vi.fn(),
      });
    });

    it('renders Academy Settings with Branding & Visual Customization and Organization Details', () => {
      render(<SettingsPage />);

      expect(screen.getByText('Academy Settings & Customization')).toBeInTheDocument();
      expect(screen.getByText('Branding & Visual Customization')).toBeInTheDocument();
      expect(screen.getByText('Academy Icon / Logo')).toBeInTheDocument();
      expect(screen.getByText('Academy Display Color')).toBeInTheDocument();
      expect(screen.getByText('Organization Registration Details')).toBeInTheDocument();
      expect(screen.getAllByDisplayValue('ikacad').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Save Branding Changes')).toBeInTheDocument();
    });

    it('allows changing display color and saving branding', async () => {
      render(<SettingsPage />);

      const royalBlueButton = screen.getByTitle('Royal Blue');
      fireEvent.click(royalBlueButton);

      const saveButton = screen.getByText('Save Branding Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Branding Updated')).toBeInTheDocument();
        const saved = getAcademyBranding(77);
        expect(saved?.primaryColor).toBe('#1d4ed8');
      });
    });
  });

  describe('AppSidebar Custom Icon Display', () => {
    beforeEach(() => {
      vi.mocked(AuthProvider.useAuth).mockReturnValue({
        user: { id: 1, username: 'owner_user', role: 'owner' },
        isAuthenticated: true,
      } as any);

      vi.mocked(AcademyProvider.useAcademy).mockReturnValue({
        activeAcademy: {
          id: 77,
          name: 'ikacad',
          slug: 'ikacad',
          timezone: 'Africa/Lagos',
          is_active: true,
          created_at: '2026-01-01',
          updated_at: '2026-01-01',
        },
        activeRole: 'owner',
        academies: [],
        activeMembership: null,
        isLoading: false,
        error: null,
        setActiveAcademy: vi.fn(),
        refreshAcademies: vi.fn(),
      });
    });

    it('renders only the custom academy icon without the text name when custom icon is uploaded', () => {
      saveAcademyBranding({
        academyId: 77,
        academyName: 'ikacad',
        logoUrl: 'data:image/png;base64,mocklogo',
      });

      render(<AppSidebar />);

      const img = screen.getByRole('img', { name: /ikacad/i });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'data:image/png;base64,mocklogo');

      // The text name 'ikacad' must NOT be in the sidebar header so the icon is prominent and clear
      expect(screen.queryByText('@ikacad')).not.toBeInTheDocument();
    });

    it('renders fallback academy name and monogram when no custom icon is uploaded', () => {
      render(<AppSidebar />);

      expect(screen.getByText('ikacad')).toBeInTheDocument();
      expect(screen.getByText('@ikacad')).toBeInTheDocument();
    });
  });
});
