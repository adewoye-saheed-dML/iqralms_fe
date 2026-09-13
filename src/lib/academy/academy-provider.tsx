'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { components } from '@/lib/api/schema';
import { useAuth } from '@/lib/auth/auth-provider';

type MyOrganizationMembership = components['schemas']['MyOrganizationMembership'];

interface AcademyContextValue {
  memberships: MyOrganizationMembership[];
  selectedAcademyId: number | null;
  selectedAcademy: MyOrganizationMembership | null;
  setSelectedAcademyId: (id: number) => void;
  isLoading: boolean;
  error: Error | null;
}

const AcademyContext = React.createContext<AcademyContextValue | undefined>(undefined);

const ACADEMY_STORAGE_KEY = 'quran_fe_selected_academy_id';

export function AcademyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [storedAcademyId, setStoredAcademyId] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(ACADEMY_STORAGE_KEY);
      if (stored) {
        // eslint-disable-next-line
        setStoredAcademyId(Number(stored));
      }
    }
  }, []);

  const {
    data: memberships = [],
    isLoading,
    error,
  } = useQuery<MyOrganizationMembership[], Error>({
    queryKey: ['organizations', 'mine'],
    queryFn: () => apiClient.get<MyOrganizationMembership[]>('/api/organizations/mine/'),
    enabled: !!user,
  });

  // Deterministic rule: Use stored ID if it matches a valid membership, else use the first membership, else null.
  const activeAcademyId = React.useMemo(() => {
    if (memberships.length === 0) return null;
    if (storedAcademyId !== null && memberships.some(m => m.organization.id === storedAcademyId)) {
      return storedAcademyId;
    }
    // If no valid stored preference, fall back to the first membership deterministically
    return memberships[0].organization.id;
  }, [memberships, storedAcademyId]);

  const setSelectedAcademyId = React.useCallback((id: number) => {
    setStoredAcademyId(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACADEMY_STORAGE_KEY, String(id));
    }
  }, []);

  const selectedAcademy = React.useMemo(() => {
    if (!activeAcademyId) return null;
    return memberships.find((m) => m.organization.id === activeAcademyId) || null;
  }, [memberships, activeAcademyId]);

  const value = React.useMemo(
    () => ({
      memberships,
      selectedAcademyId: activeAcademyId,
      selectedAcademy,
      setSelectedAcademyId,
      isLoading,
      error,
    }),
    [memberships, activeAcademyId, selectedAcademy, setSelectedAcademyId, isLoading, error]
  );

  return (
    <AcademyContext.Provider value={value}>
      {children}
    </AcademyContext.Provider>
  );
}

export function useAcademy() {
  const context = React.useContext(AcademyContext);
  if (context === undefined) {
    throw new Error('useAcademy must be used within an AcademyProvider');
  }
  return context;
}
