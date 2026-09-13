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

export function AcademyProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [selectedAcademyId, setSelectedAcademyId] = React.useState<number | null>(null);

  const {
    data: memberships = [],
    isLoading,
    error,
  } = useQuery<MyOrganizationMembership[], Error>({
    queryKey: ['organizations', 'mine'],
    queryFn: () => apiClient.get<MyOrganizationMembership[]>('/api/organizations/mine/'),
    enabled: !!user,
  });

  const activeAcademyId =
    selectedAcademyId !== null
      ? selectedAcademyId
      : memberships.length > 0
        ? memberships[0].organization.id
        : null;

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
    [memberships, activeAcademyId, selectedAcademy, isLoading, error]
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
