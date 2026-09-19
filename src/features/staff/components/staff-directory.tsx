'use client';

import { staffKeys } from '@/lib/api/query-keys';
import { can } from '@/lib/permissions/capabilities';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { staffApi } from '../api/staff';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Spinner } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus } from 'lucide-react';
import Link from 'next/link';

export function StaffDirectory({ showOnlyAdmin }: { showOnlyAdmin?: boolean }) {
  const { activeAcademy, activeRole } = useAcademy();
  const [search, setSearch] = React.useState('');

  const {
    data: memberships,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: staffKeys.all(activeAcademy?.id),
    queryFn: () => staffApi.getMemberships(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  if (!activeAcademy) {
    return <EmptyState title="No Academy Context" description="Please select an academy." />;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState title="Failed to load directory" message={error?.message} onRetry={() => refetch()} />
    );
  }

  const canManage = can('manage_staff', { activeRole });

  const filtered = (memberships || []).filter((m) => (!showOnlyAdmin || m.role !== "teacher") && 
    m.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        {canManage && (
          <Button asChild>
            <Link href="/app/teachers/add">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Link>
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={search ? 'No matches found' : 'No staff members'}
          description={search ? 'Try a different search term.' : 'This academy has no members.'}
        />
      ) : (
        <Card className="divide-y">
          <div className="hidden grid-cols-4 items-center gap-4 p-4 font-medium sm:grid">
            <div className="col-span-2">Member</div>
            <div>Role</div>
            <div>Status</div>
          </div>
          {filtered.map((member) => (
            <Link
              key={member.id}
              href={`/app/teachers/${member.id}`}
              className="hover:bg-muted/50 block p-4 transition-colors"
            >
              <div className="grid gap-4 sm:grid-cols-4 sm:items-center">
                <div className="col-span-2">
                  <div className="text-foreground font-medium">{member.username}</div>
                  <div className="text-muted-foreground text-sm">
                    Added {new Date(member.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                    {member.role_display}
                  </Badge>
                </div>
                <div>
                  <Badge variant={member.status === 'active' ? 'default' : 'destructive'}>
                    {member.status_display}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </Card>
      )}
    </div>
  );
}
