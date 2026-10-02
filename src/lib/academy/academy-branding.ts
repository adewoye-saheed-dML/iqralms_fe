'use client';

import * as React from 'react';

export interface AcademyBranding {
  academyId: number;
  academyName: string;
  logoUrl?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
  updatedAt?: string;
}

export const DEFAULT_PRIMARY_COLOR = '#044b36'; // Deep Islamic Green

export const COLOR_PRESETS = [
  { name: 'Islamic Green', hex: '#044b36' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Royal Blue', hex: '#1d4ed8' },
  { name: 'Navy Slate', hex: '#1e293b' },
  { name: 'Deep Indigo', hex: '#4338ca' },
  { name: 'Imperial Violet', hex: '#6d28d9' },
  { name: 'Teal Oasis', hex: '#0f766e' },
  { name: 'Golden Amber', hex: '#b45309' },
  { name: 'Crimson', hex: '#b91c1c' },
];

const BRANDING_STORAGE_PREFIX = 'iqra_academy_branding_';
const BRANDING_EVENT = 'iqra_academy_branding_changed';

export function getAcademyBranding(academyId: number): AcademyBranding | null {
  if (typeof window === 'undefined' || !academyId) return null;
  try {
    const raw = localStorage.getItem(`${BRANDING_STORAGE_PREFIX}${academyId}`);
    if (!raw) return null;
    return JSON.parse(raw) as AcademyBranding;
  } catch (err) {
    console.error('Failed to load academy branding', err);
    return null;
  }
}

export function saveAcademyBranding(branding: AcademyBranding): void {
  if (typeof window === 'undefined' || !branding.academyId) return;
  try {
    const dataToSave: AcademyBranding = {
      ...branding,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(
      `${BRANDING_STORAGE_PREFIX}${branding.academyId}`,
      JSON.stringify(dataToSave)
    );
    window.dispatchEvent(
      new CustomEvent(BRANDING_EVENT, { detail: { academyId: branding.academyId } })
    );
    applyAcademyTheme(dataToSave, branding.academyName);
  } catch (err) {
    console.error('Failed to save academy branding', err);
  }
}

export function resetAcademyBranding(academyId: number, academyName: string): void {
  if (typeof window === 'undefined' || !academyId) return;
  try {
    localStorage.removeItem(`${BRANDING_STORAGE_PREFIX}${academyId}`);
    window.dispatchEvent(
      new CustomEvent(BRANDING_EVENT, { detail: { academyId } })
    );
    applyAcademyTheme(null, academyName);
  } catch (err) {
    console.error('Failed to reset academy branding', err);
  }
}

/**
 * Dynamically applies the academy theme:
 * 1. Document title reflects the current academy name (e.g. `ikacad | Iqra LMS`)
 * 2. Primary CSS theme color variable `--primary` adapts to the academy's customized color
 * 3. Browser tab favicon updates if a custom logo exists
 */
export function applyAcademyTheme(branding: AcademyBranding | null, academyName?: string): void {
  if (typeof window === 'undefined') return;

  // 1. Browser Tab Wording / Document Title
  if (academyName) {
    document.title = `${academyName} | Iqra LMS`;
  } else {
    document.title = 'Iqra LMS - Quran Academy Platform';
  }

  // 2. Display Color Theme (--primary)
  const targetColor = branding?.primaryColor || DEFAULT_PRIMARY_COLOR;
  document.documentElement.style.setProperty('--primary', targetColor);

  // 3. Dynamic Favicon (if custom icon is set)
  if (branding?.logoUrl) {
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = branding.logoUrl;
  }
}

/**
 * React hook for reading and updating active academy branding
 */
export function useAcademyBranding(academyId?: number, fallbackName?: string) {
  const [branding, setBranding] = React.useState<AcademyBranding | null>(() => {
    return academyId ? getAcademyBranding(academyId) : null;
  });

  const refreshBranding = React.useCallback(() => {
    if (academyId) {
      const loaded = getAcademyBranding(academyId);
      setBranding(loaded);
      applyAcademyTheme(loaded, fallbackName);
    } else {
      setBranding(null);
      applyAcademyTheme(null);
    }
  }, [academyId, fallbackName]);

  React.useEffect(() => {
    refreshBranding();

    const handleStorageOrCustom = (e: Event) => {
      const customEvent = e as CustomEvent<{ academyId?: number }>;
      if (!customEvent.detail || customEvent.detail.academyId === academyId) {
        refreshBranding();
      }
    };

    window.addEventListener(BRANDING_EVENT, handleStorageOrCustom);
    window.addEventListener('storage', handleStorageOrCustom);
    return () => {
      window.removeEventListener(BRANDING_EVENT, handleStorageOrCustom);
      window.removeEventListener('storage', handleStorageOrCustom);
    };
  }, [academyId, refreshBranding]);

  const save = React.useCallback(
    (newBranding: Partial<AcademyBranding>) => {
      if (!academyId) return;
      const combined: AcademyBranding = {
        academyId,
        academyName: fallbackName || 'Academy',
        ...branding,
        ...newBranding,
      };
      saveAcademyBranding(combined);
      setBranding(combined);
    },
    [academyId, fallbackName, branding]
  );

  const reset = React.useCallback(() => {
    if (!academyId) return;
    resetAcademyBranding(academyId, fallbackName || 'Academy');
    setBranding(null);
  }, [academyId, fallbackName]);

  return {
    branding,
    saveBranding: save,
    resetBranding: reset,
  };
}
