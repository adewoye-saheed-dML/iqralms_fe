'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { teachersApi } from '../api/teachers';
import { teacherKeys } from '@/lib/api/query-keys';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Spinner } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { can } from '@/lib/permissions/capabilities';

export function TeacherDirectory() {
  const { activeAcademy, activeRole } = useAcademy();
  const [search, setSearch] = React.useState('');

  const {
    data: teachers,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: teacherKeys.all(activeAcademy?.id),
    queryFn: () => teachersApi.getTeacherConfigurations(activeAcademy!.id),
    enabled: !!activeAcademy,
  });

  if (!activeAcademy) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (isError) {
    return <ErrorState title="Failed to load teachers" message={error?.message} />;
  }

  const canManage = can('manage_teachers', { activeRole });

  const filtered = (teachers || []).filter((t) =>
    t.username.toLowerCase().includes(search.toLowerCase())
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
              Invite Teacher
            </Link>
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={search ? 'No matches found' : 'No teachers'}
          description={search ? 'Try a different search term.' : 'This academy has no teachers.'}
        />
      ) : (
        <Card className="divide-y">
          <div className="hidden grid-cols-4 items-center gap-4 p-4 font-medium sm:grid">
            <div className="col-span-2">Teacher</div>
            <div>Max Hours</div>
            <div>Status</div>
          </div>
          {filtered.map((teacher) => (
            <Link
              key={teacher.user}
              href={`/app/teachers/${teacher.membership}`}
              className="hover:bg-muted/50 block p-4 transition-colors"
            >
              <div className="grid gap-4 sm:grid-cols-4 sm:items-center">
                <div className="col-span-2">
                  <div className="text-foreground font-medium">{teacher.username}</div>
                  <div className="text-muted-foreground text-sm">
                    Added {new Date(teacher.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm">{teacher.max_weekly_hours} hrs/wk</div>
                </div>
                <div>
                  <Badge variant={teacher.approved ? 'default' : 'secondary'}>
                    {teacher.approved ? 'Active' : 'Pending Activation'}
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
