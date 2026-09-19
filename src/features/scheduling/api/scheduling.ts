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
  getAvailability: async (organizationId: number, teacherId: number): Promise<AvailabilityBlock[]> => {
    const { data } = await apiClient.GET('/api/scheduling/organizations/{organization_pk}/availability/', {
      params: { 
        path: { organization_pk: organizationId },
        query: { teacher_id: teacherId } 
      },
    });
    return data ?? [];
  },

  createBooking: async (organizationId: number, body: BookingCreate): Promise<Booking> => {
    const { data } = await apiClient.POST('/api/scheduling/organizations/{organization_pk}/bookings/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    if (!data) {
      throw new Error('Failed to create booking');
    }
    return data;
  },

  cancelBooking: async (organizationId: number, bookingId: number): Promise<Booking> => {
    const { data } = await apiClient.POST('/api/scheduling/organizations/{organization_pk}/bookings/{id}/cancel/', {
      params: { path: { organization_pk: organizationId, id: bookingId } },
    });
    if (!data) {
      throw new Error('Failed to cancel booking');
    }
    return data;
  },

  getMyBookings: async (organizationId: number): Promise<Booking[]> => {
    const { data } = await apiClient.GET('/api/scheduling/organizations/{organization_pk}/bookings/mine/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  getTeachingBookings: async (organizationId: number): Promise<Booking[]> => {
    const { data } = await apiClient.GET('/api/scheduling/organizations/{organization_pk}/bookings/teaching/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  createCohort: async (organizationId: number, body: CohortCreate): Promise<Cohort> => {
    const { data } = await apiClient.POST('/api/scheduling/organizations/{organization_pk}/cohorts/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    if (!data) {
      throw new Error('Failed to create cohort');
    }
    return data;
  },

  getOpenCohorts: async (organizationId: number, levelId: number): Promise<Cohort[]> => {
    const { data } = await apiClient.GET('/api/scheduling/organizations/{organization_pk}/cohorts/open/', {
      params: { 
        path: { organization_pk: organizationId },
        query: { level_id: levelId }
      },
    });
    return data ?? [];
  },

  routeBooking: async (organizationId: number, body: RouteRequest): Promise<Routed> => {
    const { data } = await apiClient.POST('/api/scheduling/organizations/{organization_pk}/route/', {
      params: { path: { organization_pk: organizationId } },
      body,
    });
    if (!data) {
      throw new Error('Failed to route booking');
    }
    return data;
  },

  getMyWaitlist: async (organizationId: number): Promise<WaitlistEntry[]> => {
    const { data } = await apiClient.GET('/api/scheduling/organizations/{organization_pk}/waitlist/mine/', {
      params: { path: { organization_pk: organizationId } },
    });
    return data ?? [];
  },

  getTeacherWaitlist: async (organizationId: number, teacherId: number): Promise<WaitlistEntry[]> => {
    const { data } = await apiClient.GET('/api/scheduling/organizations/{organization_pk}/waitlist/for-teacher/', {
      params: { 
        path: { organization_pk: organizationId },
        query: { teacher_id: teacherId }
      },
    });
    return data ?? [];
  },

  promoteWaitlist: async (organizationId: number, waitlistId: number, body: WaitlistPromote): Promise<Booking> => {
    const { data } = await apiClient.POST('/api/scheduling/organizations/{organization_pk}/waitlist/{id}/promote/', {
      params: { path: { organization_pk: organizationId, id: waitlistId } },
      body,
    });
    if (!data) {
      throw new Error('Failed to promote waitlist entry');
    }
    return data;
  },
};
