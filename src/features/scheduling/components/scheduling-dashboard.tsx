'use client';

import * as React from 'react';
import { useAcademy } from '@/lib/academy/academy-provider';
import { useAuth } from '@/lib/auth/auth-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, CalendarCheck, UserCheck, Users, Calendar } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookingList } from './booking-list';
import { Waitlist } from './waitlist';
import { CohortList } from './cohort-list';
import { TeacherAvailabilityView } from './teacher-availability-view';
import { can } from '@/lib/permissions/capabilities';

export function SchedulingDashboard() {
  return (
    <React.Suspense fallback={<div className="py-6 text-sm text-muted-foreground">Loading schedule...</div>}>
      <SchedulingDashboardInner />
    </React.Suspense>
  );
}

function SchedulingDashboardInner() {
  const { activeRole } = useAcademy();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isOwnerOrAdminUser =
    activeRole === 'owner' ||
    activeRole === 'admin' ||
    (user?.role as string) === 'owner' ||
    (user?.role as string) === 'admin';

  const isLeadTeacher = user?.role === 'lead';
  const isSubTeacher = user?.role === 'sub';
  const isTeacherUser = activeRole === 'teacher' || isLeadTeacher || isSubTeacher;
  const canAllocate = isOwnerOrAdminUser || isLeadTeacher;
  const isStudentOrParent = !isTeacherUser && !isOwnerOrAdminUser;

  const defaultTab = isOwnerOrAdminUser
    ? 'academy-schedule'
    : isTeacherUser
    ? 'teaching'
    : 'my-bookings';

  const queryTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = React.useState<string>(queryTab || defaultTab);

  React.useEffect(() => {
    if (queryTab) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {isTeacherUser && (
            <span>Viewing teaching sessions and declared working availability.</span>
          )}
          {isOwnerOrAdminUser && (
            <span>Full academy scheduling overview, student allocation queue, and cohorts.</span>
          )}
          {isStudentOrParent && (
            <span>Manage your booked recitation sessions and requested times.</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Student/Parent Booking Action */}
          {isStudentOrParent && (
            <Button onClick={() => router.push('/app/scheduling/book')}>
              <Plus className="mr-2 h-4 w-4" /> Book a Session
            </Button>
          )}

          {/* Teacher Actions */}
          {isTeacherUser && canAllocate && (
            <Button
              variant={activeTab === 'waitlist' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('waitlist')}
            >
              <Users className="mr-2 h-4 w-4" /> Review Student Requests
            </Button>
          )}

          {/* Owner/Admin Action */}
          {isOwnerOrAdminUser && (
            <Button
              variant={activeTab === 'waitlist' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('waitlist')}
            >
              <UserCheck className="mr-2 h-4 w-4" /> Review Student Requests & Allocate
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
          {isTeacherUser && (
            <TabsTrigger value="availability">My Availability</TabsTrigger>
          )}
          <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
          {/* Only show allocation workspace to management (owner, admin, or lead teacher) */}
          {(canAllocate || isStudentOrParent) && (
            <TabsTrigger value="waitlist">
              {canAllocate ? 'Requests & Allocation' : 'Requests & Waitlist'}
            </TabsTrigger>
          )}
          {isOwnerOrAdminUser && (
            <TabsTrigger value="availability">Teacher Availabilities</TabsTrigger>
          )}
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

        <TabsContent value="availability" className="pt-4">
          <TeacherAvailabilityView />
        </TabsContent>

        <TabsContent value="cohorts" className="pt-4">
          <CohortList />
        </TabsContent>

        {(canAllocate || isStudentOrParent) && (
          <TabsContent value="waitlist" className="pt-4">
            <Waitlist />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
