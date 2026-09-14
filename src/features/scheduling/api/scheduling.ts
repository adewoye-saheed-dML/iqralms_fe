import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type AvailabilityBlock = components['schemas']['AvailabilityBlock'];
export type BookingCreate = components['schemas']['BookingCreate'];
export type Booking = components['schemas']['Booking'];
export type CohortCreate = components['schemas']['CohortCreate'];
export type Cohort = components['schemas']['Cohort'];
export type RouteRequest = components['schemas']['RouteRequest'];
export type Routed = components['schemas']['Routed'];
export type WaitlistEntry = components['schemas']['WaitlistEntry'];
export type WaitlistPromote = components['schemas']['WaitlistPromote'];
export type BookingCancel = components['schemas']['BookingCancel'];

export const schedulingApi = {
  getAvailability: (organizationId: number, teacherId: number) =>
    apiClient.get<AvailabilityBlock[]>(
      `/api/scheduling/organizations/${organizationId}/availability/`,
      { params: { teacher_id: teacherId } }
    ),

  createBooking: (organizationId: number, data: BookingCreate) =>
    apiClient.post<Booking>(`/api/scheduling/organizations/${organizationId}/bookings/`, {
      body: data,
    }),

  cancelBooking: (organizationId: number, bookingId: number, data: BookingCancel) =>
    apiClient.post<Booking>(
      `/api/scheduling/organizations/${organizationId}/bookings/${bookingId}/cancel/`,
      { body: data }
    ),

  getMyBookings: (organizationId: number) =>
    apiClient.get<Booking[]>(`/api/scheduling/organizations/${organizationId}/bookings/mine/`),

  getTeachingBookings: (organizationId: number) =>
    apiClient.get<Booking[]>(`/api/scheduling/organizations/${organizationId}/bookings/teaching/`),

  createCohort: (organizationId: number, data: CohortCreate) =>
    apiClient.post<Cohort>(`/api/scheduling/organizations/${organizationId}/cohorts/`, {
      body: data,
    }),

  getOpenCohorts: (organizationId: number, levelId: number) =>
    apiClient.get<Cohort[]>(`/api/scheduling/organizations/${organizationId}/cohorts/open/`, {
      params: { level_id: levelId },
    }),

  routeBooking: (organizationId: number, data: RouteRequest) =>
    apiClient.post<Routed>(`/api/scheduling/organizations/${organizationId}/route/`, {
      body: data,
    }),

  getMyWaitlist: (organizationId: number) =>
    apiClient.get<WaitlistEntry[]>(`/api/scheduling/organizations/${organizationId}/waitlist/mine/`),

  getTeacherWaitlist: (organizationId: number, teacherId: number) =>
    apiClient.get<WaitlistEntry[]>(
      `/api/scheduling/organizations/${organizationId}/waitlist/for-teacher/`,
      { params: { teacher_id: teacherId } }
    ),

  promoteWaitlist: (organizationId: number, waitlistId: number, data: WaitlistPromote) =>
    apiClient.post<Booking>(
      `/api/scheduling/organizations/${organizationId}/waitlist/${waitlistId}/promote/`,
      { body: data }
    ),
};
