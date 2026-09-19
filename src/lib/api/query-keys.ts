/**
 * Centralized React Query key factories.
 * Ensures every tenant-scoped query explicitly incorporates the academy ID.
 * Helps prevent cross-tenant data leakage and simplifies cache invalidation.
 */

type AcademyId = number | undefined;

export const academyKeys = {
  all: ['academy'] as const,
  tenant: (academyId: AcademyId) => ['academy', academyId] as const,
};

export const staffKeys = {
  all: (academyId: AcademyId) => [...academyKeys.tenant(academyId), 'staff'] as const,
  detail: (academyId: AcademyId, memberId: number | string) => [...staffKeys.all(academyId), memberId] as const,
};

export const studentKeys = {
  all: (academyId: AcademyId) => [...academyKeys.tenant(academyId), 'students'] as const,
  detail: (academyId: AcademyId, enrollmentId: number | string) => [...studentKeys.all(academyId), enrollmentId] as const,
};

export const curriculumKeys = {
  all: (academyId: AcademyId) => [...academyKeys.tenant(academyId), 'curriculum'] as const,
  tracks: (academyId: AcademyId) => [...curriculumKeys.all(academyId), 'tracks'] as const,
  trackDetail: (academyId: AcademyId, trackId: number | string) => [...curriculumKeys.all(academyId), 'track', trackId] as const,
  levels: (academyId: AcademyId, trackId?: number | string) => [...curriculumKeys.all(academyId), 'levels', trackId] as const,
};

export const schedulingKeys = {
  all: (academyId: AcademyId) => [...academyKeys.tenant(academyId), 'scheduling'] as const,
  bookings: (academyId: AcademyId) => [...schedulingKeys.all(academyId), 'bookings'] as const,
  bookingsByType: (academyId: AcademyId, type: string) => [...schedulingKeys.bookings(academyId), type] as const,
  waitlist: (academyId: AcademyId) => [...schedulingKeys.all(academyId), 'waitlist'] as const,
  waitlistMine: (academyId: AcademyId) => [...schedulingKeys.waitlist(academyId), 'mine'] as const,
};

export const assessmentKeys = {
  all: (academyId: AcademyId) => [...academyKeys.tenant(academyId), 'assessment'] as const,
  list: (academyId: AcademyId, type: string) => [...assessmentKeys.all(academyId), type] as const,
  reviewQueue: (academyId: AcademyId) => [...assessmentKeys.all(academyId), 'review-queue'] as const,
};

export const progressKeys = {
  all: (academyId: AcademyId) => [...academyKeys.tenant(academyId), 'progress'] as const,
  list: (academyId: AcademyId, type: string) => [...progressKeys.all(academyId), type] as const,
  detail: (academyId: AcademyId, trackId?: number | string) => [...progressKeys.all(academyId), 'detail', trackId] as const,
  snapshots: (academyId: AcademyId) => [...progressKeys.all(academyId), 'snapshots'] as const,
};

export const pricingKeys = {
  all: (academyId: AcademyId) => [...academyKeys.tenant(academyId), 'pricing'] as const,
  agreements: (academyId: AcademyId) => [...pricingKeys.all(academyId), 'agreements'] as const,
  mine: (academyId: AcademyId) => [...pricingKeys.all(academyId), 'mine'] as const,
};

export const payoutsKeys = {
  all: (academyId: AcademyId) => [...academyKeys.tenant(academyId), 'payouts'] as const,
  myStatement: (academyId: AcademyId, start?: string, end?: string) => [...payoutsKeys.all(academyId), 'my-statement', start, end] as const,
  lead: (academyId: AcademyId) => [...payoutsKeys.all(academyId), 'lead'] as const,
};

export const notificationKeys = {
  all: (academyId: AcademyId) => [...academyKeys.tenant(academyId), 'notifications'] as const,
  deliveries: (academyId: AcademyId) => [...notificationKeys.all(academyId), 'deliveries'] as const,
  mine: (academyId: AcademyId, unreadOnly?: boolean) => [...notificationKeys.all(academyId), 'mine', unreadOnly] as const,
  admin: (academyId: AcademyId) => [...notificationKeys.all(academyId), 'admin'] as const,
};

export const teacherKeys = {
  all: (academyId?: number) => [...academyKeys.tenant(academyId), 'teachers'] as const,
  detail: (academyId?: number, id?: number) => [...teacherKeys.all(academyId), 'detail', id] as const,
  tracks: (academyId?: number) => [...teacherKeys.all(academyId), 'tracks'] as const,
};
