'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { staffApi } from '@/features/staff/api/staff';
import { staffKeys } from '@/lib/api/query-keys';
import { StaffDetail } from '@/features/staff/components/staff-detail';
import { TeacherDetail } from '@/features/teachers/components/teacher-detail';
import { Spinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';

interface PageProps {
  params: {
    memberId: string;
  };
}

export default function StaffMemberPage({ params }: PageProps) {
  const memberId = parseInt(params.memberId, 10);
  const { activeAcademy } = useAcademy();

  const {
    data: member,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: staffKeys.detail(activeAcademy?.id, memberId),
    queryFn: () => staffApi.getMembership(activeAcademy!.id, memberId),
    enabled: !!activeAcademy && !isNaN(memberId),
  });

  if (isNaN(memberId)) {
    return <div>Invalid member ID</div>;
  }

  if (!activeAcademy) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError || !member) {
    return (
      <div className="mx-auto max-w-5xl">
        <ErrorState title="Member Not Found" message={error?.message} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {member.role === 'teacher' ? (
        <TeacherDetail membershipId={memberId} />
      ) : (
        <StaffDetail memberId={memberId} />
      )}
    </div>
  );
}
