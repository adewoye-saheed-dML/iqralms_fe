# Phase 18 — Scheduling & Booking

**Repository:** `adewoye-saheed-dML/quran_fe`  
**Branch:** `main`  
**Status:** READY TO IMPLEMENT

## 1. Readiness

The live frontend `main` branch is ready for Phase 18.

Verified:

- `spec/CURRENT_PHASE.md` says Phase 18 is active.
- `spec/verification/phase-17-curriculum.md` marks Phase 17 COMPLETE.
- `/app/curriculum` is implemented.
- Curriculum uses generated OpenAPI types and academy-scoped TanStack Query keys.
- Track list/retrieve/create/update and level list/create/update are implemented.
- Placement UI was explicitly deferred from Phase 17.
- The progress tracker is stale and still says Phase 17 is pending; do not trust it until it is updated after verification.

The product SSoT sequence is:

```text
Onboard → configure academy → establish curriculum → invite staff → add students
→ enroll students → schedule learning → teach → assess → monitor progress
→ reconcile pricing/payout information
```

Phase 18 therefore implements scheduling/booking after the completed student and curriculum foundations.

## 2. Source of truth

Use, in order:

1. `spec/FRONTEND_MASTER_SSoT.md`
2. current backend `openapi/schema.yml`
3. generated frontend API types
4. backend authorization, tenancy, validation, and business rules

Never invent endpoints, fields, permissions, statuses, conflict semantics, or booking rules.

The backend remains authoritative for teacher availability, overlap checks, approvals, track specialty, weekly caps, routing, cohort rules, waitlisting, and cancellation.

## 3. Live scheduling contract

The backend currently exposes these academy-scoped scheduling routes:

```text
GET  /api/scheduling/organizations/{organization_pk}/availability/?teacher_id=
POST /api/scheduling/organizations/{organization_pk}/bookings/
GET  /api/scheduling/organizations/{organization_pk}/bookings/mine/
GET  /api/scheduling/organizations/{organization_pk}/bookings/teaching/
POST /api/scheduling/organizations/{organization_pk}/bookings/{id}/cancel/
POST /api/scheduling/organizations/{organization_pk}/route/
POST /api/scheduling/organizations/{organization_pk}/cohorts/
GET  /api/scheduling/organizations/{organization_pk}/cohorts/open/?level_id=
GET  /api/scheduling/organizations/{organization_pk}/waitlist/mine/
GET  /api/scheduling/organizations/{organization_pk}/waitlist/for-teacher/
POST /api/scheduling/organizations/{organization_pk}/waitlist/{id}/promote/
```

Confirmed backend semantics:

- Availability is read-only through this API.
- Direct booking is for a student or parent.
- Students book for themselves; parents must identify a linked child.
- Backend models remain authoritative for whether a slot is legal.
- Cancellation is party-scoped and may return `409` for a state conflict.
- Routing can automatically select a teacher.
- Routing can accept an optional preferred teacher.
- Routing no-capacity is a structured `409` outcome.
- Preferred-teacher capacity failure can create a waitlist entry.
- Cohort creation is lead-teacher only.
- Open cohorts expose seat counts, not a full roster.
- Waitlist promotion is a separate backend action.

## 4. Phase goal

Build a tenant-safe scheduling experience for the active academy:

```text
Scheduling
→ choose student
→ choose track/level
→ choose time
→ optionally prefer teacher
→ route/book
→ confirmation
→ view bookings
→ cancel when permitted
```

Also support, where backend permissions allow it:

```text
Teacher → view teaching bookings
Lead/admin → create cohorts
Preferred teacher unavailable → explain waitlist outcome
```

## 5. Information architecture

Add:

```text
/app/scheduling
```

Use journey-oriented routes only when needed. Do not create routes merely because an API endpoint exists.

Possible supporting route:

```text
/app/scheduling/bookings/[bookingId]
```

only when the existing API/use case requires a detail page.

## 6. Booking workflow

Use the SSoT flow:

```text
student → track/level → teacher/availability → slot → confirmation
```

Respect backend routing:

- Direct booking may name a teacher.
- Routing may choose the teacher.
- Never simulate routing client-side.
- Never report availability as authoritative booking eligibility.

Direct-booking payload is contract-defined around:

```text
teacher
level
start_time_utc
duration_minutes (optional)
student (required for parent, ignored for student)
```

Routing payload is contract-defined around:

```text
level
requested_time_window.start_time_utc
requested_time_window.duration_minutes (optional)
student (required for parent, ignored for student)
preferred_teacher (optional)
```

Do not send unsupported fields.

## 7. Student vs parent

Student users may only book for themselves.

Parent users must select a linked child. Backend tenancy and parent-link checks remain authoritative.

Do not implement client-only authorization logic.

## 8. Curriculum integration

Reuse the existing curriculum feature/API for tracks and levels.

Do not duplicate track/level storage in scheduling.

Selected levels must be academy-scoped.

## 9. Availability

Use:

```text
GET /api/scheduling/organizations/{organization_pk}/availability/?teacher_id=
```

`teacher_id` is required.

Use the backend-provided local representation for display where possible. Preserve UTC values when sending requests.

Do not build a teacher availability editor in this phase; the current backend scheduling API exposes availability read-only.

## 10. Time handling

- Backend stores UTC.
- Preserve ISO/UTC values in requests.
- Display the backend-provided local values.
- Do not invent independent booking timezone rules.

## 11. Booking results

Successful booking data includes the actual backend booking representation, including teacher, student, level, track, time, status, provider, and join URL where present.

Only show confirmation after a successful API response.

## 12. Routing

On successful routing, show the backend response:

- booking
- cohort when present
- routing reason
- join information when available

Do not invent routing reasons.

No-capacity responses are `409` and may include structured `considered` data. Treat this as a meaningful business result, not a generic crash.

## 13. Cohorts

Support:

```text
POST /api/scheduling/organizations/{organization_pk}/cohorts/
GET  /api/scheduling/organizations/{organization_pk}/cohorts/open/?level_id=
```

Expose cohort creation only when backend authorization allows it.

The create contract includes fields such as:

```text
teacher
level
max_students
schedule_start_utc
```

Do not add writable student membership fields to cohort creation.

Open cohorts should show backend seat counts. Do not fabricate a roster.

## 14. Booking lists

Student-facing:

```text
GET /bookings/mine/
```

Teacher-facing:

```text
GET /bookings/teaching/
```

Do not fetch all bookings and filter them in the browser.

Cancelled records remain history and should remain visible when returned by the backend.

## 15. Cancellation

Use:

```text
POST /api/scheduling/organizations/{organization_pk}/bookings/{id}/cancel/
```

Handle:

- confirmation
- saving state
- success
- not-found/visibility-safe failure
- `409` cancellation conflict

Never delete bookings client-side.

## 16. Waitlist

Backend exposes:

```text
GET  /waitlist/mine/
GET  /waitlist/for-teacher/
POST /waitlist/{id}/promote/
```

Expose each operation only to roles permitted by the real backend contract.

Do not invent status transitions.

## 17. Query keys

Every academy-scoped scheduling query must include academy id.

Preferred pattern:

```ts
['academy', academyId, 'scheduling', ...]
```

Examples:

```ts
['academy', academyId, 'scheduling', 'bookings', 'mine']
['academy', academyId, 'scheduling', 'bookings', 'teaching']
['academy', academyId, 'scheduling', 'availability', teacherId]
['academy', academyId, 'scheduling', 'cohorts', 'open', levelId]
['academy', academyId, 'scheduling', 'waitlist', 'mine']
```

Academy switching must invalidate/refetch scheduling state so one academy cannot display another academy's bookings.

## 18. API architecture

Follow the existing architecture:

```text
Page → feature hook/component → TanStack Query → typed API client → Django REST API
```

Create:

```text
src/features/scheduling/
├── api/
├── components/
├── hooks/
├── __tests__/
└── types/   # only where generated types do not already cover the need
```

Use generated OpenAPI types. Keep direct API calls out of presentation components.

## 19. UI states

Cover all applicable states:

```text
loading
empty
error
forbidden
not-found
400 validation/business failure
409 conflict
submitting
success
```

Especially distinguish:

- no availability
- invalid booking
- no capacity
- waitlisted
- cancellation conflict
- permission denial

## 20. Accessibility

Follow the SSoT:

- keyboard-complete booking flow
- associated labels
- visible focus
- accessible select/combobox behavior
- programmatic errors
- managed confirmation-dialog focus
- status not conveyed by color alone
- accessible loading/success announcements where needed

## 21. Testing

### Component/unit

Test:

- scheduling loading state
- empty bookings
- successful booking display
- forbidden state
- availability display
- booking validation failure
- booking success
- `409` no-capacity result
- cancellation success
- `409` cancellation conflict
- academy-scoped query keys
- academy switching invalidation/refetch

### API boundary

Verify exact endpoint and payload for implemented scheduling operations.

### E2E

Where fixtures permit:

```text
login
→ select academy
→ open scheduling
→ choose a real academy level
→ request/book a supported slot
→ verify success or a structured backend conflict
```

Also test cancellation for an existing booking when fixtures support it.

Do not mock away the booking rules in E2E.

## 22. Navigation

Add `/app/scheduling` through the existing role-aware navigation architecture.

Do not add unrelated teaching/assessment/progress navigation in this phase.

## 23. Out of scope

Do not implement:

- teacher attendance
- teaching notes
- assessments
- progress dashboards
- payouts
- pricing
- notification center
- placement testing workflow
- bulk import
- video-provider management
- custom availability editing

## 24. Completion gate

Phase 18 is complete only after:

```text
backend contract audit
→ implementation
→ generated API types verified
→ lint
→ typecheck
→ unit/component tests
→ build
→ E2E critical booking workflow
→ academy-switch tenant review
→ verification receipt
→ tracker update
```

The verification receipt must record:

- exact scheduling endpoints used
- exact generated schemas
- routes created/changed
- permissions observed
- booking/routing/waitlist semantics
- tests and results
- build result
- limitations/deferred scheduling work

Do not mark Phase 18 complete because the page renders.

## 25. Required discipline

Before completion:

1. Re-read `spec/FRONTEND_MASTER_SSoT.md`.
2. Inspect the current backend `openapi/schema.yml`.
3. Verify generated frontend API types.
4. Inspect scheduling permissions/business behavior in the backend.
5. Implement only supported workflows.
6. Run relevant verification.
7. Update `spec/verification/phase-18-scheduling.md`.
8. Only after verification update the progress tracker.

## 26. Deliverables

Expected:

```text
src/app/app/scheduling/
src/features/scheduling/
spec/verification/phase-18-scheduling.md
```

Plus any necessary navigation changes, generated type updates, tests, and reusable scheduling UI.

## 27. Definition of Done

Phase 18 is done when the supported scheduling journey works from the active academy context through the real backend API, tenant boundaries are preserved, routing/no-capacity/cancellation semantics are represented accurately, important states are covered, tests/build/E2E pass, and the verification receipt precisely records what was implemented and what remains outside scope.
