'use client';

import * as React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { components } from '@/lib/api/schema';
import { useAuth } from '@/lib/auth/auth-provider';

type MyOrganizationMembership = components['schemas']['MyOrganizationMembership'];
type Organization = components['schemas']['Organization'];
type OrganizationRoleEnum = components['schemas']['OrganizationRoleEnum'];

interface AcademyContextValue {
  academies: Organization[];
  activeAcademy: Organization | null;
  activeMembership: MyOrganizationMembership | null;
  activeRole: OrganizationRoleEnum | null;
  isLoading: boolean;
  error: Error | null;
  setActiveAcademy: (id: number) => void;
  refreshAcademies: () => Promise<void>;
}

const AcademyContext = React.createContext<AcademyContextValue | undefined>(undefined);

const ACADEMY_STORAGE_KEY = 'quran_fe_selected_academy_id';

export function AcademyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [storedAcademyId, setStoredAcademyId] = React.useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(ACADEMY_STORAGE_KEY);
      if (stored) {
        return Number(stored);
      }
    }
    return null;
  });

  const {
    data: memberships = [],
    isLoading,
    error,
    refetch,
  } = useQuery<MyOrganizationMembership[], Error>({
    queryKey: ['organizations', 'mine'],
    queryFn: async () => {
      const { data } = await apiClient.GET('/api/organizations/mine/');
      return data as MyOrganizationMembership[];
    },
    enabled: !!user,
  });

  const activeAcademyId = React.useMemo(() => {
    if (memberships.length === 0) return null;
    if (
      storedAcademyId !== null &&
      memberships.some((m) => m.organization.id === storedAcademyId)
    ) {
      return storedAcademyId;
    }
    return memberships[0].organization.id;
  }, [memberships, storedAcademyId]);

  const setActiveAcademy = React.useCallback(
    (id: number) => {
      setStoredAcademyId(id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACADEMY_STORAGE_KEY, String(id));
      }
      queryClient.removeQueries({
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === 'academy' && key[1] !== id;
        },
      });
    },
    [queryClient]
  );

  const refreshAcademies = React.useCallback(async () => {
    await refetch();
  }, [refetch]);

  const activeMembership = React.useMemo(() => {
    if (!activeAcademyId) return null;
    return memberships.find((m) => m.organization.id === activeAcademyId) || null;
  }, [memberships, activeAcademyId]);

  const value = React.useMemo<AcademyContextValue>(
    () => ({
      academies: memberships.map((m) => m.organization),
      activeAcademy: activeMembership?.organization || null,
      activeMembership,
      activeRole: activeMembership?.role || null,
      isLoading,
      error,
      setActiveAcademy,
      refreshAcademies,
    }),
    [memberships, activeMembership, isLoading, error, setActiveAcademy, refreshAcademies]
  );

  return <AcademyContext.Provider value={value}>{children}</AcademyContext.Provider>;
}

export function useAcademy() {
  const context = React.useContext(AcademyContext);
  if (context === undefined) {
    throw new Error('useAcademy must be used within an AcademyProvider');
  }
  return context;
}
