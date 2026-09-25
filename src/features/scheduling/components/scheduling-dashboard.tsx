'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth } from '@/lib/auth/auth-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BookingList } from './booking-list';
import { Waitlist } from './waitlist';
import { CohortList } from './cohort-list';

import { can } from '@/lib/permissions/capabilities';

export function SchedulingDashboard() {
  const { activeRole } = useAcademy();
  const { user } = useAuth();
  const router = useRouter();

  const isOwnerOrAdminUser =
    activeRole === 'owner' ||
    activeRole === 'admin' ||
    (user?.role as string) === 'owner' ||
    (user?.role as string) === 'admin';
  const isTeacherUser =
    activeRole === 'teacher' || user?.role === 'lead' || user?.role === 'sub';
  const isStudentOrParent = can('view_own_schedule', { userRole: user?.role, activeRole });

  const defaultTab = isOwnerOrAdminUser
    ? 'academy-schedule'
    : isTeacherUser
    ? 'teaching'
    : 'my-bookings';

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {isStudentOrParent && (
          <Button onClick={() => router.push('/app/scheduling/book')}>
            <Plus className="mr-2 h-4 w-4" /> Book a Session
          </Button>
        )}
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList>
          {isOwnerOrAdminUser && (
            <TabsTrigger value="academy-schedule">Academy Schedule</TabsTrigger>
          )}
          {isTeacherUser && (
            <TabsTrigger value="teaching">Teaching Schedule</TabsTrigger>
          )}
          {isStudentOrParent && (
            <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>
          )}
          <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
        </TabsList>

        {isOwnerOrAdminUser && (
          <TabsContent value="academy-schedule" className="pt-4">
            <BookingList type="academy" />
          </TabsContent>
        )}

        {isTeacherUser && (
          <TabsContent value="teaching" className="pt-4">
            <BookingList type="teaching" />
          </TabsContent>
        )}

        {isStudentOrParent && (
          <TabsContent value="my-bookings" className="pt-4">
            <BookingList type="mine" />
          </TabsContent>
        )}

        <TabsContent value="cohorts" className="pt-4">
          <CohortList />
        </TabsContent>

        <TabsContent value="waitlist" className="pt-4">
          <Waitlist />
        </TabsContent>
      </Tabs>
    </div>
  );
}
