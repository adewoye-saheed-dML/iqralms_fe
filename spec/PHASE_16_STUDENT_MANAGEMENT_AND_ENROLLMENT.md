# QURAN ACADEMY — FRONTEND PHASE 16
## Student Management & Enrollment

**Repository:** `adewoye-saheed-dML/quran_fe`  
**Branch:** `main`  
**Phase:** SaaS Phase 16  
**Phase name:** Student Management & Enrollment  
**Status:** READY TO START  
**Predecessor:** Phase 15 — Teacher & Staff Management  
**Authority:** `spec/FRONTEND_MASTER_SSoT.md` + `openapi/schema.yml`

> This phase is derived from the Master SSoT's `/app/students` definition and enrollment journey. API behavior must be verified against the live OpenAPI contract before implementation.

---

# 1. Purpose

Phase 16 establishes the academy's student-management foundation.

The objective is not to build a generic student CRUD screen. The product journey is:

```text
identify/import student
        ↓
connect student to academy
        ↓
establish enrollment / program state
        ↓
assign curriculum where supported
        ↓
move into scheduling flow
```

This phase should create the student-management surface required for the later scheduling, teaching, assessment, progress, and parent/student phases.

---

# 2. Source of Truth

Use this order of authority:

1. `spec/FRONTEND_MASTER_SSoT.md`
2. `openapi/schema.yml`
3. Current backend behavior/permissions
4. Existing frontend architecture
5. This phase specification

The SSoT defines `/app/students` as:

- Student management
- Search/filter
- Table on desktop
- Cards on mobile
- Create/import/enrollment actions

The SSoT's enrollment journey is:

```text
Identify/import student
→ connect student to academy/program/track state
→ confirm enrollment state
→ move into scheduling flow
```

Do not invent fields, endpoints, enrollment states, roles, or permissions.

---

# 3. Entry Gate

Before implementation confirm:

```text
Phase 13.0 Foundation        COMPLETE
Phase 13.1 Design System     COMPLETE
Phase 13.2 Authentication    COMPLETE
Phase 13.3 Academy Context   COMPLETE
Phase 14 Academy Onboarding  COMPLETE
Phase 15 Teacher/Staff       COMPLETE
Phase 16 Students            READY TO START
```

The active academy context is mandatory.

Do not rebuild authentication or academy selection.

---

# 4. Backend Contract Audit

Before coding, inspect `openapi/schema.yml` for the current student-related contract.

Audit:

```text
student records
parent/child relationships
organization membership or enrollment
student academy association
program/track association
curriculum state
imports
student detail/update
pagination
search/filtering
permissions
```

Also identify the exact endpoints and schemas for:

```text
GET student list
POST student/create
GET student detail
PATCH student/update
enrollment/connect actions
parent-link actions
```

The SSoT confirms student/parent APIs exist in the supplied contract for identity and parent-link flows, but exact student/enrollment behavior must remain grounded in the current OpenAPI schema.

Record unsupported capabilities as:

```text
OPEN — backend contract required
```

Never turn an assumption into a UI rule.

---

# 5. Core Student Model

Keep these concepts distinct:

```text
User
Student
Parent/guardian relationship
Academy membership / enrollment
Program
Track
Level
Placement
```

Do not assume:

- every user is a student
- every student has a parent
- every student belongs to only one academy
- enrollment equals curriculum placement
- curriculum assignment equals scheduling

The backend remains authoritative.

---

# 6. Tenant Boundary

Every student operation must resolve through the active academy.

Use academy-aware API/query boundaries.

Example query-key shape:

```text
['academy', academyId, 'students', ...]
```

Equivalent repository conventions are acceptable.

Required behavior:

```text
Academy A
   ↓
students query
   ↓
switch to Academy B
   ↓
Academy A student data cleared/invalidated
   ↓
Academy B student data loaded
```

A student ID from another academy must never be treated as valid merely because it is known to the browser.

---

# 7. Student Directory

Build:

```text
/app/students
```

The primary purpose is to help an academy manager answer:

```text
Who are our students?
What is their current enrollment state?
What action should happen next?
```

Desktop:

```text
search/filter
→ data table
→ pagination where supported
```

Mobile:

```text
search/filter
→ student cards
→ focused actions
```

Use existing shared UI primitives.

---

# 8. Directory Data

Show only fields supported by the backend and appropriate to the active role.

Potential categories:

```text
student identity
enrollment/program state
track/level state where available
parent/guardian state where permitted
status
```

Do not expose internal IDs, secrets, or hidden backend fields merely because they appear in API responses.

---

# 9. Directory States

Implement:

```text
loading
loaded
empty
error
searching
filtering
```

Distinguish:

```text
no students in academy
```

from:

```text
no students match current filters
```

when the API/data model makes that distinction possible.

---

# 10. Search & Filtering

Implement only backend-supported filtering.

Possible fields include:

```text
name
email
status
track
level
```

but these are examples only.

The OpenAPI contract decides what exists.

If the backend supports server-side filtering and pagination, use it instead of downloading an unbounded list.

---

# 11. Student Detail

Provide:

```text
/app/students/[studentId]
```

only if this matches the current route architecture.

Student detail should organize supported information into clear sections such as:

```text
Profile
Academy / Enrollment
Curriculum
Parent / Guardian
Next action
```

Only render sections supported by the API.

Handle:

```text
404
403
network error
loading
```

according to the shared UX state standard.

---

# 12. Create Student

Implement student creation only if the backend contract supports direct creation.

The intended user journey is:

```text
Create student
→ validate
→ save
→ establish academy relationship where supported
→ refresh directory
→ open next useful step
```

Do not automatically invent enrollment behavior after creation.

If the API separates user creation from academy enrollment, keep those flows distinct.

---

# 13. Parent / Guardian Linking

The Master SSoT explicitly includes parent-child identity/linking concepts.

Where supported:

```text
student
→ parent/guardian relationship
→ linked account
```

Use the actual backend contract.

Possible operations must be audited before UI implementation.

Do not claim that a parent can access academy/student data simply because a relationship exists; authorization remains backend-owned.

---

# 14. Enrollment

Enrollment is a core Phase 16 journey.

The frontend should model:

```text
student identified
        ↓
academy enrollment
        ↓
program/track state
        ↓
confirmed enrollment
```

But do not collapse multiple backend resources into one invented "student status."

If the backend exposes separate resources, preserve those distinctions.

---

# 15. Curriculum Connection

The SSoT says enrollment can connect a student to academy/program/track state and then move toward scheduling.

Where supported:

```text
Student
  ↓
Program / Track
  ↓
Level / Placement
```

Do not implement curriculum placement review in this phase unless required to complete the actual enrollment contract.

Placement has a dedicated journey and should remain separately modeled.

---

# 16. Import Boundary

The SSoT defines a future import workflow:

```text
upload CSV/XLSX
→ map columns
→ validate
→ show row-level errors
→ commit
→ show created/skipped/rejected result
```

The API inventory includes organization-scoped import endpoints.

However, import must be implemented only if this phase can complete the backend-supported student import contract cleanly.

Otherwise:

```text
OPEN — defer bulk import implementation to the Imports phase
```

Do not build an incomplete fake import wizard merely to show a button.

---

# 17. Student Actions

Actions must be role-aware.

The SSoT establishes that:

```text
Owner/Admin
Lead Teacher
Teacher
Parent
Student
```

have different capabilities.

Student-management controls should be exposed only when the current academy role and backend contract support them.

Never rely on frontend checks as authorization.

---

# 18. Teacher Interaction Boundary

Phase 16 should prepare for later teacher workflows but must not build scheduling or teaching functionality prematurely.

Supported handoff:

```text
student enrollment
        ↓
ready for scheduling
```

Later phases handle:

```text
teacher assignment
availability
booking
class session
attendance
assessment
```

Do not add those domains here unless required by an existing API contract for the student enrollment action itself.

---

# 19. Navigation

Add the student route to role-aware navigation where permitted:

```text
/app/students
```

Do not show Student Management to roles that cannot use it.

Reuse the navigation configuration established in earlier phases.

---

# 20. API Architecture

Follow the repository architecture:

```text
page
→ student feature component
→ feature hook / mutation
→ TanStack Query
→ typed API client / domain API layer
→ backend
```

Do not place direct API calls inside presentation components.

All API requests must pass through:

```text
src/lib/api/client.ts
```

or the established generated-client boundary.

The SSoT explicitly prohibits scattering `fetch()` calls through screens.

---

# 21. Query & Cache Rules

Student query keys must contain the academy context.

Examples:

```text
['academy', academyId, 'students']
['academy', academyId, 'students', studentId]
['academy', academyId, 'enrollments']
```

Use the repository's actual query-key conventions where they exist.

After mutations:

```text
create student
→ invalidate students

update student
→ invalidate list + detail

enroll student
→ invalidate student + enrollment state
```

When switching academies:

```text
clear/invalidate previous academy student data
```

No cross-tenant cache leakage is acceptable.

---

# 22. Forms

For forms:

- use the existing form architecture
- map backend validation to field-level errors
- prevent duplicate submission
- expose saving state
- preserve user input on recoverable failure

Use the design-system form primitives already established.

Do not invent a second form library.

---

# 23. UX State Standard

Follow the Master SSoT:

```text
Loading
→ skeleton/progressive placeholder

Empty
→ explain what is missing + next action

Success
→ confirm what changed + next step

Validation
→ field-level errors

403
→ explain permission limitation

404
→ resource-appropriate not-found state

401
→ re-authenticate/session handling

Network
→ connection failure + retry where safe

Conflict
→ explain changed data + safe refresh/retry
```

---

# 24. Accessibility

Student management must support:

- keyboard navigation
- visible focus
- semantic headings
- accessible tables
- accessible cards
- labeled form controls
- accessible dialogs
- screen-reader-friendly status messaging
- sufficient contrast

For mobile and desktop, preserve the same semantic information.

---

# 25. Responsive Design

Desktop:

```text
sidebar
→ filters
→ dense student table
```

Tablet:

```text
collapsible navigation
→ adaptive list/table
```

Mobile:

```text
compact navigation
→ filters
→ student cards
→ focused actions
```

Do not maintain separate business logic for each viewport.

---

# 26. Tests

## Directory

- [ ] loads student list
- [ ] loading state
- [ ] empty state
- [ ] error state
- [ ] supported search
- [ ] supported filters
- [ ] pagination where supported

## Detail

- [ ] loads student detail
- [ ] 404 state
- [ ] 403 state
- [ ] supported profile data
- [ ] enrollment state

## Mutations

- [ ] create student where supported
- [ ] update student where supported
- [ ] enrollment action where supported
- [ ] parent/guardian link where supported
- [ ] validation errors
- [ ] duplicate submission prevention

## Tenant safety

- [ ] academy-scoped query keys
- [ ] Academy A → Academy B switch
- [ ] no stale Academy A students under Academy B
- [ ] student detail respects academy scope

---

# 27. E2E Journey

Where Playwright is configured, verify:

```text
login
→ active academy
→ student directory
→ student detail
→ create/add student where supported
→ enrollment state
```

Multi-academy:

```text
Academy A
→ open students
→ switch to Academy B
→ verify B students only
```

The critical SSoT journey is:

```text
Admin adds/imports student
→ student appears in correct tenant
```

Do not claim import coverage unless the import API flow is actually implemented.

---

# 28. Definition of Ready

Phase 16 is ready when:

1. Phase 15 Teacher/Staff is confirmed complete.
2. Student-related OpenAPI endpoints have been audited.
3. Student vs user vs parent vs enrollment concepts are understood.
4. Academy tenant boundaries are defined.
5. Supported create/update/enrollment operations are identified.
6. Unsupported areas are explicitly marked `OPEN` or deferred.

---

# 29. Definition of Done

Phase 16 is complete only when:

1. `/app/students` works.
2. Student search/filter works where supported.
3. Student detail works where supported.
4. Supported creation/update flows work.
5. Supported enrollment/linking works.
6. Parent/guardian relationship behavior is correctly represented where supported.
7. Academy-aware query keys are used.
8. Academy switching cannot leak student data.
9. Role-aware actions are correct.
10. Loading/empty/error/forbidden states are complete.
11. Responsive behavior is verified.
12. Accessibility behavior is verified.
13. Unit/component tests pass.
14. Lint/typecheck passes.
15. Production build passes.
16. E2E critical journey passes where configured.
17. Verification evidence is recorded in:
    `spec/verification/phase-16-student-management.md`
18. `progress.md` and `spec/CURRENT_PHASE.md` are updated only after actual verification.

---

# 30. Explicit Non-Goals

Do not implement in Phase 16:

- teacher scheduling
- availability management
- class booking
- attendance
- assessments
- progress dashboards
- teacher payouts
- pricing agreements
- notifications
- audit-log management
- full bulk-import platform unless this phase explicitly adopts the import contract

Those belong to later domain phases.

---

# 31. Next Phase Handoff

At completion, the expected product handoff is:

```text
Academy
   ↓
Teachers / Staff
   ↓
Students / Enrollment
   ↓
Curriculum / Placement
   ↓
Scheduling
   ↓
Teaching
   ↓
Assessment / Progress
```

The student phase should therefore leave a clean, backend-valid state that scheduling can consume without duplicating enrollment logic.

---

# 32. Governing Principle

> **A student is not just a row in a table. Student management must establish the correct academy relationship and enrollment state needed for the student's next learning action.**

The safe sequence is:

```text
authenticated user
→ active academy
→ authorized student-management action
→ student identity
→ academy relationship
→ enrollment state
→ next workflow
```

No client-side shortcut may bypass academy tenancy or backend authorization.
