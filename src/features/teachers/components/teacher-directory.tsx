'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAcademy } from '@/lib/academy/academy-provider';
import { teachersApi, type TeacherConfiguration } from '../api/teachers';
import { membershipsApi, type Membership } from '@/features/memberships/api/memberships';
import { teacherKeys } from '@/lib/api/query-keys';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Spinner } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, FileUp } from 'lucide-react';
import Link from 'next/link';
import { can } from '@/lib/permissions/capabilities';

export function TeacherDirectory() {
  const { activeAcademy, activeRole } = useAcademy();
  const [search, setSearch] = React.useState('');

  const {
    data: teachers = [],
    isLoading: isTeachersLoading,
    isError,
    error,
  } = useQuery<TeacherConfiguration[]>({
    queryKey: teacherKeys.all(activeAcademy?.id),
    queryFn: async () => {
      if (!activeAcademy?.id) return [];
      const res = await teachersApi.getTeacherConfigurations(activeAcademy.id);
      return res ?? [];
    },
    enabled: !!activeAcademy,
  });

  const { data: members = [] } = useQuery<Membership[]>({
    queryKey: ['memberships', activeAcademy?.id],
    queryFn: async () => {
      try {
        if (!activeAcademy?.id) return [];
        const res = await membershipsApi.list(activeAcademy.id);
        return res ?? [];
      } catch {
        return [];
      }
    },
    enabled: !!activeAcademy,
  });

  const unifiedTeachers = React.useMemo(() => {
    const list: Array<{
      key: string;
      membership: number;
      user: number;
      username: string;
      max_weekly_hours: number | null;
      hourly_payout_rate: string | null;
      approved: boolean;
      hasConfig: boolean;
      created_at: string;
    }> = [];

    const teacherConfigs = teachers || [];
    const teacherMembers = members.filter((m) => m.role === 'teacher');

    // 1. All teacher members first
    for (const m of teacherMembers) {
      const config = teacherConfigs.find(
        (c) =>
          c.membership === m.id ||
          c.user === m.user ||
          c.username.toLowerCase() === m.username.toLowerCase()
      );
      list.push({
        key: `member-${m.id}`,
        membership: m.id,
        user: m.user,
        username: m.username,
        max_weekly_hours: config ? config.max_weekly_hours : null,
        hourly_payout_rate: config ? config.hourly_payout_rate : null,
        approved: config ? config.approved : false,
        hasConfig: !!config,
        created_at: config?.created_at || m.created_at,
      });
    }

    // 2. Any configs not found in membersList
    for (const c of teacherConfigs) {
      if (!list.some((t) => t.username.toLowerCase() === c.username.toLowerCase())) {
        list.push({
          key: `config-${c.id}`,
          membership: c.membership,
          user: c.user,
          username: c.username,
          max_weekly_hours: c.max_weekly_hours,
          hourly_payout_rate: c.hourly_payout_rate,
          approved: c.approved,
          hasConfig: true,
          created_at: c.created_at,
        });
      }
    }

    return list;
  }, [teachers, members]);

  if (!activeAcademy) return null;

  if (isTeachersLoading) {
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

  const filtered = unifiedTeachers.filter((t) =>
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
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href="/app/invitations?role=teacher&from=teachers">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Teacher
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/app/imports?kind=teachers">
                <FileUp className="mr-2 h-4 w-4" />
                Import CSV / Excel
              </Link>
            </Button>
          </div>
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
              key={teacher.key}
              href={`/app/teachers/${teacher.membership}?from=teachers`}
              className="hover:bg-muted/50 block p-4 transition-colors"
            >
              <div className="grid gap-4 sm:grid-cols-4 sm:items-center">
                <div className="col-span-2">
                  <div className="text-foreground font-medium">{teacher.username}</div>
                  <div className="text-muted-foreground text-sm">
                    Added {teacher.created_at ? new Date(teacher.created_at).toLocaleDateString() : 'Recently'}
                  </div>
                </div>
                <div>
                  <div className="text-sm">
                    {teacher.hasConfig && teacher.max_weekly_hours != null
                      ? `${teacher.max_weekly_hours} hrs/wk`
                      : 'Terms not set'}
                  </div>
                  {teacher.hasConfig && teacher.hourly_payout_rate && (
                    <div className="text-xs text-muted-foreground">
                      ${teacher.hourly_payout_rate}/hr
                    </div>
                  )}
                </div>
                <div>
                  {teacher.hasConfig ? (
                    <Badge variant={teacher.approved ? 'default' : 'secondary'}>
                      {teacher.approved ? 'Active' : 'Pending Activation'}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-300 text-amber-600 dark:text-amber-400">
                      Pending Terms Setup
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </Card>
      )}

      {canManage && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Need to manage pending teacher invitations?</span>
            <p className="text-xs">Track delivery status, resend, or revoke teacher invitations in the Invitations hub.</p>
          </div>
          <Button variant="ghost" size="sm" asChild className="self-start sm:self-auto shrink-0">
            <Link href="/app/invitations?role=teacher">
              View Teacher Invitations &rarr;
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
