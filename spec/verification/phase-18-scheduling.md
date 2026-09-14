# Phase 18 Verification

## Endpoints used
- `GET /api/scheduling/organizations/{organization_pk}/availability/`
- `GET /api/scheduling/organizations/{organization_pk}/bookings/mine/`
- `GET /api/scheduling/organizations/{organization_pk}/bookings/teaching/`
- `POST /api/scheduling/organizations/{organization_pk}/bookings/{id}/cancel/`
- `GET /api/scheduling/organizations/{organization_pk}/cohorts/open/`
- `POST /api/scheduling/organizations/{organization_pk}/route/`
- `GET /api/scheduling/organizations/{organization_pk}/waitlist/mine/`

## Generated Schemas
- `RouteRequest`
- `Routed`
- `Booking`
- `Cohort`
- `WaitlistEntry`
- `WaitlistPromote`
- `BookingCancel`

## Routes created/changed
- `/app/scheduling` - Scheduling dashboard (Tabs: My Bookings, Teaching Schedule, Cohorts, Waitlist)
- `/app/scheduling/book` - Booking request form (utilizing the `/route/` API)

## Permissions observed
- Student/Parent views "My Bookings" and "My Waitlist".
- Teacher/Admin views "Teaching Schedule".
- Parents must select a linked student to submit a booking request.
- Role-based tabs conditionally display.
- Handles `403 Forbidden` for data isolation properly.

## Booking/Routing/Waitlist semantics
- Routing handles `409` as standard conflict ("No capacity available") and surfaces it intelligently in the UI without treating it as a generic crash.
- `preferred_teacher` waitlisting is fully supported during `/route/`.
- Cancellation posts to the specific `/cancel/` endpoint with `reason`.
- Waitlist and bookings use correct activeAcademy query scopes, rendering strictly tenant-isolated views.

## Tests and results
- All components use `@tanstack/react-query` and isolated keys `['academy', academyId, 'scheduling', ...]`.
- `Scheduling Feature` test suite successfully verifies:
  - Initial loading state
  - Empty state
  - Full booking display rendering
  - 403 authorization boundary
  - Booking success via form
  - `409` conflict handling via form
- `pnpm lint` and `pnpm test` pass. Build verified.

## Deferred work
- Teacher availability editing (read-only per spec).
- Sub-teacher cohort creation (Lead only in backend).
- Waitlist promotion UI logic for lead teachers (Waitlist display for teachers is stubbed pending robust teacher selector).
