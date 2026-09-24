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

  // Explicit academy selection resolution per SSoT remediation
  const activeAcademyId = React.useMemo(() => {
    if (memberships.length === 0) return null;
    if (memberships.length === 1) {
      return memberships[0].organization.id;
    }
    if (
      storedAcademyId !== null &&
      memberships.some((m) => m.organization.id === storedAcademyId)
    ) {
      return storedAcademyId;
    }
    // Multiple academies with no valid persisted selection requires explicit selection
    return null;
  }, [memberships, storedAcademyId]);

  const setActiveAcademy = React.useCallback(
    (id: number) => {
      setStoredAcademyId(id);
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACADEMY_STORAGE_KEY, String(id));
      }
      // Remove stale queries from other academies
      queryClient.removeQueries({
        predicate: (query) => {
          const key = query.queryKey;
          if (!Array.isArray(key)) return false;
          if (
            key[0] === 'auth' ||
            (key[0] === 'organizations' && key[1] === 'mine') ||
            key[0] === 'global'
          ) {
            return false;
          }
          if (key[0] === 'academy') {
            return key[1] !== undefined && key[1] !== id;
          }
          const tenantFeatures = [
            'students',
            'teachers',
            'staff',
            'curriculum',
            'scheduling',
            'assessment',
            'progress',
            'pricing',
            'payouts',
            'notifications',
            'imports',
            'audit',
          ];
          if (tenantFeatures.includes(key[0] as string)) {
            return true;
          }
          return false;
        },
      });
    },
    [queryClient]
  );

  const activeMembership = React.useMemo(() => {
    if (!activeAcademyId) return null;
    return memberships.find((m) => m.organization.id === activeAcademyId) || null;
  }, [memberships, activeAcademyId]);

  const activeAcademy = React.useMemo(() => {
    return activeMembership ? activeMembership.organization : null;
  }, [activeMembership]);

  const activeRole = React.useMemo(() => {
    return activeMembership ? activeMembership.role : null;
  }, [activeMembership]);

  const academies = React.useMemo(() => {
    return memberships.map((m) => m.organization);
  }, [memberships]);

  const refreshAcademies = React.useCallback(async () => {
    await refetch();
  }, [refetch]);

  const value = React.useMemo(
    () => ({
      academies,
      activeAcademy,
      activeMembership,
      activeRole,
      isLoading,
      error: error || null,
      setActiveAcademy,
      refreshAcademies,
    }),
    [academies, activeAcademy, activeMembership, activeRole, isLoading, error, setActiveAcademy, refreshAcademies]
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
