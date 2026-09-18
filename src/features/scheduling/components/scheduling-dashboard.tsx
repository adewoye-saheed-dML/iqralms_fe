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

  const isTeacherOrAdmin = can('manage_scheduling', { userRole: user?.role, activeRole });
  const isStudentOrParent = can('view_own_schedule', { userRole: user?.role, activeRole });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {isStudentOrParent && (
          <Button onClick={() => router.push('/app/scheduling/book')}>
            <Plus className="mr-2 h-4 w-4" /> Book a Session
          </Button>
        )}
      </div>

      <Tabs defaultValue={isStudentOrParent ? "my-bookings" : "teaching"}>
        <TabsList>
          {isStudentOrParent && <TabsTrigger value="my-bookings">My Bookings</TabsTrigger>}
          {isTeacherOrAdmin && <TabsTrigger value="teaching">Teaching Schedule</TabsTrigger>}
          <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
        </TabsList>

        {isStudentOrParent && (
          <TabsContent value="my-bookings" className="pt-4">
            <BookingList type="mine" />
          </TabsContent>
        )}
        
        {isTeacherOrAdmin && (
          <TabsContent value="teaching" className="pt-4">
            <BookingList type="teaching" />
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
