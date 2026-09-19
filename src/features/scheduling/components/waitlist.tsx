'use client';

import { schedulingKeys } from '@/lib/api/query-keys';

import * as React from 'react';
import { useQuery } from "@tanstack/react-query";
import { schedulingApi } from '../api/scheduling';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth } from '@/lib/auth/auth-provider';
import { LoadingState } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/error-state';
import { EmptyState } from '@/components/ui/empty-state';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {  } from '@/components/ui/button';
import { User } from "lucide-react";
import { ApiError } from '@/lib/api/errors';

import { can } from '@/lib/permissions/capabilities';

export function Waitlist() {
  const { activeAcademy } = useAcademy();
  const { user } = useAuth();

  const isStudentOrParent = can('manage_own_waitlist', { userRole: user?.role });
  // Note: we assume a lead teacher is viewing their own waitlist, or we just pass the user ID. 
  // Wait, `for-teacher/` requires `teacher_id` query param. We might need the user ID.
  // Actually, lead teacher fetches for a specific teacher. If we don't have the teacher ID handy, 
  // maybe we don't implement the lead's view yet? 
  // Let's check `activeAcademy.userId` or something. 
  // The spec says: GET /api/scheduling/organizations/{id}/waitlist/mine/
  
  

  const { data: mineWaitlist, isLoading, error, refetch } = useQuery({
    queryKey: schedulingKeys.waitlistMine(activeAcademy?.id),
    queryFn: () => {
      if (!activeAcademy?.id) throw new Error('No active academy');
      return schedulingApi.getMyWaitlist(activeAcademy.id);
    },
    enabled: !!activeAcademy?.id && isStudentOrParent,
  });

  // Promote mutation placeholder

  if (isLoading) return <LoadingState />;
  
  if (error) {
    if (error instanceof ApiError && error.status === 403) {
      return <ErrorState title="Access Denied" message="You don't have permission to view waitlists." />;
    }
    return <ErrorState title="Error" message={error.message || "Failed to load waitlist"} onRetry={() => refetch()} />;
  }

  // Teacher waitlist not fully implemented as we need teacher selection or context
  if (!isStudentOrParent) {
    return (
      <EmptyState
        title="Teacher Waitlist"
        description="Select a teacher to view their waitlist (Not fully implemented in this phase)."
        icon={<User className="h-10 w-10 text-muted-foreground" />}
      />
    );
  }

  if (!mineWaitlist || mineWaitlist.length === 0) {
    return (
      <EmptyState
        title="No waitlist entries"
        description="You are not currently on any waitlists."
        icon={<User className="h-10 w-10 text-muted-foreground" />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mineWaitlist.map((entry) => (
          <Card key={entry.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Waitlist Entry #{entry.id}</CardTitle>
                <Badge variant={entry.status === 'fulfilled' ? 'default' : 'secondary'}>
                  {entry.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center text-muted-foreground">
                <User className="mr-2 h-4 w-4" />
                <span>
                  Requested Teacher: {entry.requested_teacher?.first_name || entry.requested_teacher?.username || 'Any'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
