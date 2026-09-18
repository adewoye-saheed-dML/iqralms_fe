import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/schema';

export type AvailabilityBlock = components['schemas']['Availability'];
export type BookingCreate = components['schemas']['BookingCreate'];
export type Booking = components['schemas']['Booking'];
export type CohortCreate = components['schemas']['CohortCreate'];
export type Cohort = components['schemas']['Cohort'];
export type RouteRequest = components['schemas']['RouteRequest'];
export type Routed = components['schemas']['Routed'];
export type WaitlistEntry = components['schemas']['WaitlistEntry'];
export type WaitlistPromote = components['schemas']['WaitlistPromote'];

export const schedulingApi = {
  getAvailability: async (organizationId: number, teacherId: number) => {
    const { data } = await apiClient.GET('/api/scheduling/organizations/{organization_pk}/availability/', {
      params: { 
        path: { organization_pk: organizationId },
        query: { teacher_id: teacherId } 
      },
    });
    return data as AvailabilityBlock[];
  },

  createBooking: async (organizationId: number, body: BookingCreate) => {
    const { data } = await apiClient.POST('/api/scheduling/organizations/{organization_pk}/bookings/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    return data as Booking;
  },

  cancelBooking: async (organizationId: number, bookingId: number) => {
    const { data } = await apiClient.POST('/api/scheduling/organizations/{organization_pk}/bookings/{id}/cancel/', {
      params: { path: { organization_pk: organizationId, id: bookingId } },
    });
    return data as Booking;
  },

  getMyBookings: async (organizationId: number) => {
    const { data } = await apiClient.GET('/api/scheduling/organizations/{organization_pk}/bookings/mine/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data as Booking[];
  },

  getTeachingBookings: async (organizationId: number) => {
    const { data } = await apiClient.GET('/api/scheduling/organizations/{organization_pk}/bookings/teaching/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data as Booking[];
  },

  createCohort: async (organizationId: number, body: CohortCreate) => {
    const { data } = await apiClient.POST('/api/scheduling/organizations/{organization_pk}/cohorts/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    return data as Cohort;
  },

  getOpenCohorts: async (organizationId: number, levelId: number) => {
    const { data } = await apiClient.GET('/api/scheduling/organizations/{organization_pk}/cohorts/open/', {
      params: { 
        path: { organization_pk: organizationId },
        query: { level_id: levelId }
      },
    });
    return data as Cohort[];
  },

  routeBooking: async (organizationId: number, body: RouteRequest) => {
    const { data } = await apiClient.POST('/api/scheduling/organizations/{organization_pk}/route/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    return data as Routed;
  },

  getMyWaitlist: async (organizationId: number) => {
    const { data } = await apiClient.GET('/api/scheduling/organizations/{organization_pk}/waitlist/mine/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data as WaitlistEntry[];
  },

  getTeacherWaitlist: async (organizationId: number, teacherId: number) => {
    const { data } = await apiClient.GET('/api/scheduling/organizations/{organization_pk}/waitlist/for-teacher/', {
      params: { 
        path: { organization_pk: organizationId },
        query: { teacher_id: teacherId }
      },
    });
    return data as WaitlistEntry[];
  },

  promoteWaitlist: async (organizationId: number, waitlistId: number, body: WaitlistPromote) => {
    const { data } = await apiClient.POST('/api/scheduling/organizations/{organization_pk}/waitlist/{id}/promote/', {
      params: { path: { organization_pk: organizationId, id: waitlistId } },
      body,
    });
    return data as Booking;
  },
};
