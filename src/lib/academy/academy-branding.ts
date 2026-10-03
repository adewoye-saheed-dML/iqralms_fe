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
const BRANDING_BROADCAST_CHANNEL = 'iqra_branding_sync_channel';

// In-memory cache for ultra-fast synchronous lookups
const memoryCache = new Map<number, AcademyBranding>();

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      return new BroadcastChannel(BRANDING_BROADCAST_CHANNEL);
    } catch {
      return null;
    }
  }
  return null;
}

export function clearBrandingMemoryCache(): void {
  memoryCache.clear();
}

export function getAcademyBranding(academyId: number): AcademyBranding | null {
  if (typeof window === 'undefined' || !academyId) return null;
  try {
    const raw = localStorage.getItem(`${BRANDING_STORAGE_PREFIX}${academyId}`);
    if (!raw) {
      memoryCache.delete(academyId);
      return null;
    }
    const parsed = JSON.parse(raw) as AcademyBranding;
    memoryCache.set(academyId, parsed);
    return parsed;
  } catch (err) {
    console.error('Failed to load academy branding', err);
    return null;
  }
}

/**
 * Fetches branding from the server route so all roles (Students, Parents, Teachers)
 * receive the exact same company logo and brand color configuration.
 */
export async function fetchAcademyBranding(
  academyId: number,
  fallbackName?: string
): Promise<AcademyBranding | null> {
  if (typeof window === 'undefined' || !academyId) return null;
  try {
    const res = await fetch(`/api/academies/${academyId}/branding`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      return getAcademyBranding(academyId);
    }
    const json = await res.json();
    if (json?.branding) {
      const branding: AcademyBranding = {
        ...json.branding,
        academyName: json.branding.academyName || fallbackName || 'Academy',
      };
      memoryCache.set(academyId, branding);
      try {
        localStorage.setItem(
          `${BRANDING_STORAGE_PREFIX}${academyId}`,
          JSON.stringify(branding)
        );
      } catch {}
      applyAcademyTheme(branding, branding.academyName);
      return branding;
    }
  } catch (err) {
    // Graceful offline fallback to localStorage
  }
  return getAcademyBranding(academyId);
}

export function saveAcademyBranding(branding: AcademyBranding): void {
  if (typeof window === 'undefined' || !branding.academyId) return;
  try {
    const dataToSave: AcademyBranding = {
      ...branding,
      updatedAt: new Date().toISOString(),
    };
    memoryCache.set(branding.academyId, dataToSave);
    localStorage.setItem(
      `${BRANDING_STORAGE_PREFIX}${branding.academyId}`,
      JSON.stringify(dataToSave)
    );
    window.dispatchEvent(
      new CustomEvent(BRANDING_EVENT, { detail: { academyId: branding.academyId } })
    );

    const channel = getBroadcastChannel();
    if (channel) {
      channel.postMessage({ type: 'SAVED', academyId: branding.academyId });
      channel.close();
    }

    applyAcademyTheme(dataToSave, branding.academyName);

    // Asynchronously sync to server API for all students, parents, and teachers
    fetch(`/api/academies/${branding.academyId}/branding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSave),
    }).catch(() => {});
  } catch (err) {
    console.error('Failed to save academy branding', err);
  }
}

export function resetAcademyBranding(academyId: number, academyName: string): void {
  if (typeof window === 'undefined' || !academyId) return;
  try {
    memoryCache.delete(academyId);
    localStorage.removeItem(`${BRANDING_STORAGE_PREFIX}${academyId}`);
    window.dispatchEvent(
      new CustomEvent(BRANDING_EVENT, { detail: { academyId } })
    );

    const channel = getBroadcastChannel();
    if (channel) {
      channel.postMessage({ type: 'RESET', academyId });
      channel.close();
    }

    applyAcademyTheme(null, academyName);

    // Asynchronously notify server
    fetch(`/api/academies/${academyId}/branding`, {
      method: 'DELETE',
    }).catch(() => {});
  } catch (err) {
    console.error('Failed to reset academy branding', err);
  }
}

/**
 * Dynamically applies the academy theme:
 * 1. Document title reflects current academy name (e.g. `ikacad | Iqra LMS`)
 * 2. Primary CSS theme variables `--primary`, `--color-primary`, and `--ring`
 *    adapt to the academy's customized color across all UI widgets
 * 3. Browser tab favicon updates if a custom company logo exists
 */
export function applyAcademyTheme(branding: AcademyBranding | null, academyName?: string): void {
  if (typeof window === 'undefined') return;

  // 1. Browser Tab Wording / Document Title
  if (academyName) {
    document.title = `${academyName} | Iqra LMS`;
  } else {
    document.title = 'Iqra LMS - Quran Academy Platform';
  }

  // 2. Display Color Theme (--primary, --color-primary, --ring)
  const targetColor = branding?.primaryColor || DEFAULT_PRIMARY_COLOR;
  document.documentElement.style.setProperty('--primary', targetColor);
  document.documentElement.style.setProperty('--color-primary', targetColor);
  document.documentElement.style.setProperty('--ring', targetColor);

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
 * React hook for reading and updating active academy branding across all personas
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

    // Concurrently fetch latest server branding to ensure student/teacher/parent
    // devices immediately receive the owner's logo & custom color
    if (academyId) {
      fetchAcademyBranding(academyId, fallbackName).then((serverData) => {
        if (serverData) {
          setBranding(serverData);
          applyAcademyTheme(serverData, fallbackName);
        }
      });
    }

    const handleStorageOrCustom = (e: Event) => {
      const customEvent = e as CustomEvent<{ academyId?: number }>;
      if (!customEvent.detail || customEvent.detail.academyId === academyId) {
        refreshBranding();
      }
    };

    window.addEventListener(BRANDING_EVENT, handleStorageOrCustom);
    window.addEventListener('storage', handleStorageOrCustom);

    let channel: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        channel = new BroadcastChannel(BRANDING_BROADCAST_CHANNEL);
        channel.onmessage = (msgEvent) => {
          if (!msgEvent.data?.academyId || msgEvent.data.academyId === academyId) {
            refreshBranding();
          }
        };
      } catch {}
    }

    return () => {
      window.removeEventListener(BRANDING_EVENT, handleStorageOrCustom);
      window.removeEventListener('storage', handleStorageOrCustom);
      if (channel) {
        channel.close();
      }
    };
  }, [academyId, fallbackName, refreshBranding]);

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
