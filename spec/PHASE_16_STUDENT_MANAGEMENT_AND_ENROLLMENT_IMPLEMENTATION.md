# QURAN ACADEMY — FRONTEND PHASE 16
## Student Management & Enrollment — Contract-Enabled Implementation

**Repository:** `adewoye-saheed-dML/quran_fe`  
**Branch:** `main`  
**Phase:** SaaS Phase 16  
**Status:** READY TO IMPLEMENT  
**Backend dependency:** `adewoye-saheed-dML/quran_acad` `main`  
**Backend contract:** updated `schema.yml`  
**Primary frontend source of truth:** `spec/FRONTEND_MASTER_SSoT.md`

---

# 1. Phase Reset

Phase 16 was previously deferred because the frontend contract did not expose academy-wide student-management APIs.

That condition has changed.

The current backend OpenAPI contract now exposes:

```text
GET  /api/organizations/{organization_pk}/students/
POST /api/organizations/{organization_pk}/students/

GET   /api/organizations/{organization_pk}/students/{id}/
PATCH /api/organizations/{organization_pk}/students/{id}/
```

The contract describes the collection endpoint as listing the academy's students and attaching an existing student, and the detail endpoint as retrieving an enrollment record and updating its enrollment status.

The supported write contract is:

```json
{
  "user": 123
}
```

for enrollment creation, and:

```json
{
  "status": "active"
}
```

or:

```json
{
  "status": "inactive"
}
```

for enrollment status updates.

The backend documents the create operation as rejecting unknown users, non-student users, and already-enrolled students, and restricting management to academy owners/administrators.

**Therefore Phase 16 must now implement the real contract. Do not keep the placeholder UI.**

---

# 2. What Must Be Removed

The current frontend contains:

```text
src/features/students/components/students-placeholder.tsx
```

and:

```text
src/features/students/__tests__/students-placeholder.test.tsx
```

The `/app/students` page currently renders `StudentsPlaceholder`.

Phase 16 must replace that placeholder implementation with the real student-management workflow.

Do not retain the "Backend Contract Required" warning after the real API integration is working.

A temporary development fallback may be used while coding, but it must not remain in the completed phase.

---

# 3. Existing Frontend Work to Reuse

The current frontend already provides:

```text
src/lib/api/client.ts
src/lib/academy/academy-provider.tsx
src/lib/auth/
src/components/ui/
src/lib/navigation/
src/features/staff/
```

Reuse these boundaries.

Do not create:

- a second API client
- a second academy context
- a second permission system
- a second UI primitive library
- a Redux store for student server state

Student data belongs in TanStack Query.

---

# 4. Backend Contract — Exact Scope

## 4.1 List Students

```text
GET /api/organizations/{organization_pk}/students/
```

Purpose:

```text
return the active academy's student enrollment records
```

Required frontend behavior:

```text
load
→ render
→ refresh after enrollment/status mutation
```

Do not invent search/filter/pagination until the OpenAPI operation confirms those parameters.

---

# 5. Add Existing Student

```text
POST /api/organizations/{organization_pk}/students/
```

Request:

```json
{
  "user": 123
}
```

This operation attaches an existing user account whose global role is `student`.

The backend contract explicitly covers:

```text
unknown user
not a student
already enrolled
```

as validation failures.

Therefore the frontend must NOT provide a fake:

```text
create username
create password
create email
```

student-account form in this phase.

Instead provide an academy action for:

```text
Add existing student
```

with a User ID input or the exact lookup mechanism supported by the current API.

Do not pretend that the backend supports searching users if it does not.

---

# 6. Important UX Decision

Because the current POST contract accepts:

```text
user: integer
```

the first implementation must use the backend-supported input honestly.

Build:

```text
Add Student
    ↓
Student User ID
    ↓
Validate
    ↓
Add to Academy
```

The UI should explain that this attaches an existing student account.

Do not add an email/username search box unless a backend lookup endpoint exists.

A nicer user lookup can be added later as a separate backend-supported capability.

---

# 7. Student Directory

Replace the placeholder with a real directory at:

```text
/app/students
```

The page should answer:

```text
Who are the students enrolled in this academy?
What is each student's enrollment status?
What can I do with the enrollment?
```

At minimum render the real fields supplied by the API contract.

Do not invent display fields.

The UI should be designed so additional fields can be added after the generated OpenAPI types are regenerated.

---

# 8. Student Detail

Add:

```text
/app/students/[studentId]
```

The detail request is:

```text
GET /api/organizations/{organization_pk}/students/{id}/
```

The page should show the actual enrollment record.

At minimum:

```text
student identity data returned by API
enrollment status
```

Only render additional profile information if it is actually present in the response schema.

Do not make extra assumptions about parent relationships, curriculum, track, level, or schedule.

Those remain separate domains unless the API response explicitly includes them.

---

# 9. Enrollment Status Management

The detail endpoint supports:

```text
PATCH /api/organizations/{organization_pk}/students/{id}/
```

with:

```text
status = active | inactive
```

Implement a clear status control.

Recommended UX:

```text
Active
Inactive
```

and:

```text
Save
```

with:

```text
saving
success
validation error
forbidden
not found
```

states.

Do not introduce additional statuses.

Do not allow role changes from this screen.

---

# 10. Role Rules

The backend says student enrollment management is for:

```text
owner
admin
```

Do not assume:

```text
staff
teacher
parent
student
```

can manage enrollment.

The frontend may hide actions for non-managers, but backend authorization remains authoritative.

Handle a backend `403` even if the action was hidden.

---

# 11. Tenant Safety

Every query must include the active academy.

Recommended query-key convention:

```text
['academy', academyId, 'students']
['academy', academyId, 'student', studentId]
```

Use the repository's actual existing conventions if they differ.

Required behavior:

```text
Academy A
→ students list A
→ switch academy
→ students list B
```

No Academy A data may remain visible after the context changes to Academy B.

Reuse the academy cache invalidation behavior from Phase 13.3.

---

# 12. API Layer

Create a dedicated student API module, for example:

```text
src/features/students/api/students.ts
```

Suggested operations:

```text
getStudents(organizationId)
getStudent(organizationId, enrollmentId)
addStudent(organizationId, userId)
updateStudentStatus(organizationId, enrollmentId, status)
```

Use the shared:

```text
src/lib/api/client.ts
```

Do not call `fetch()` directly inside pages/components.

---

# 13. Type Safety

The frontend API types must come from the updated OpenAPI contract.

Regenerate the API schema/types using the repository's existing generation mechanism:

```bash
pnpm generate:api
```

Do not create a second hand-maintained TypeScript representation of the backend contract.

Where feature-specific view models are needed, derive them from the generated API types.

---

# 14. TanStack Query

Implement:

```text
useStudents()
useStudent()
useAddStudent()
useUpdateStudentStatus()
```

or the repository's established equivalent.

After adding a student:

```text
invalidate student list
```

After changing status:

```text
invalidate student detail
invalidate student list
```

On academy switch:

```text
previous academy student queries become invalid
```

---

# 15. Add Student Form

Create a real form at:

```text
/app/students/add
```

or use a dialog/sheet if that better matches the existing application IA.

The form must contain only supported inputs.

Current contract requires:

```text
student user ID
```

It should:

- validate the ID
- prevent duplicate submission
- show submitting state
- map backend validation errors
- navigate back to the student directory on success
- refresh the directory

Error examples from the backend contract include:

```text
unknown user
user is not a student
student already enrolled
```

Map those into human-readable UI messages without dumping raw JSON.

---

# 16. Directory Empty State

The empty state must now represent a real academy with no enrolled students.

Example meaning:

```text
No students enrolled yet.
Add an existing student to this academy to get started.
```

Provide the supported action:

```text
Add Student
```

Do not show:

```text
Backend Contract Required
```

after this phase is implemented.

---

# 17. Loading / Error States

Implement the Master SSoT state standard.

## Loading

Use skeleton/progressive loading.

## Empty

Explain the academy has no enrolled students.

## Error

Provide a useful retry path.

## Forbidden

Explain the user does not have permission.

## Not found

Do not leak cross-tenant resource existence.

## Saving

Disable duplicate mutation.

## Success

Confirm what changed and provide the next useful action.

---

# 18. Student List Interactions

Keep Phase 16 intentionally focused.

Supported interactions:

```text
view list
open detail
add existing student
change active/inactive status
```

Do not add unsupported:

```text
student search
student account creation
bulk import
parent invitation
curriculum assignment
track assignment
level assignment
schedule
teacher assignment
```

unless the current OpenAPI contract explicitly supports them and they are necessary for this phase.

---

# 19. Parent Links

Do not implement parent-link management as part of this phase unless the current student endpoints explicitly expose the relationship.

The backend already has separate parent-link/account endpoints.

Keep:

```text
student enrollment
```

and:

```text
parent relationship
```

as separate domain concepts.

---

# 20. Curriculum Boundary

Do not attach tracks or levels during student enrollment unless the existing student API explicitly supports it.

Curriculum remains its own feature boundary.

The Phase 16 handoff should be:

```text
student enrolled
→ ready for later curriculum/scheduling workflow
```

---

# 21. Navigation

The Students entry already exists in the main navigation.

Keep it visible only where the application's current navigation configuration permits it.

Do not create a second navigation system.

---

# 22. Responsive UI

Desktop:

```text
student directory
→ structured list/table
→ actions
```

Mobile:

```text
student cards
→ status
→ open detail
```

Add Student must work on both.

Do not maintain separate data-fetching logic for desktop/mobile.

---

# 23. Accessibility

Required:

- keyboard navigation
- labeled student ID field
- visible focus
- accessible form errors
- accessible status control
- confirmation where a status change is consequential
- semantic headings
- accessible table/card representation
- no color-only status meaning

---

# 24. Tests

Replace the placeholder test suite with real tests.

## Student API tests

- [ ] list request succeeds for allowed academy manager
- [ ] list handles loading
- [ ] list handles API error
- [ ] list handles empty academy
- [ ] detail request succeeds
- [ ] detail handles 404
- [ ] add student succeeds
- [ ] add unknown user shows validation error
- [ ] add non-student user shows validation error
- [ ] add already-enrolled student shows conflict/validation
- [ ] update status succeeds
- [ ] update invalid status is rejected
- [ ] forbidden mutation is handled

## Tenant tests

- [ ] Academy A list contains only Academy A enrollments
- [ ] Academy B list contains only Academy B enrollments
- [ ] switching academy invalidates previous student queries
- [ ] Academy A enrollment cannot be opened under Academy B

## UI tests

- [ ] real directory renders
- [ ] add form renders
- [ ] successful add refreshes list
- [ ] status change refreshes detail/list
- [ ] success/error states work
- [ ] no placeholder warning remains

---

# 25. E2E Journey

Where Playwright is configured:

```text
login
→ active academy
→ Students
→ see directory
→ Add Student
→ provide valid existing student user ID
→ submit
→ student appears in directory
→ open student
→ change status
→ verify updated status
```

Tenant journey:

```text
Academy A
→ student A visible
→ switch Academy B
→ student B visible
→ student A no longer visible
```

Do not require an invitation, account creation, or import E2E because those are not part of the current contract.

---

# 26. Verification Against Current Contract

Before implementing, regenerate API types:

```bash
pnpm generate:api
```

Then verify that the generated schema includes the student operations and `StudentEnrollmentCreate` / `PatchedStudentEnrollmentUpdate`.

Backend contract currently describes:

```text
StudentEnrollmentCreate
    user: integer

PatchedStudentEnrollmentUpdate
    status: active | inactive
```

Do not deviate from those shapes.

---

# 27. Verification Commands

Run:

```bash
pnpm install --frozen-lockfile
pnpm generate:api
pnpm lint
pnpm test
pnpm build
```

Then:

```bash
pnpm test:e2e
```

where Playwright is configured for the required journey.

Verify:

```bash
git status --short
```

and make sure only Phase 16 work is present.

---

# 28. Backend Compatibility Check

Before declaring Phase 16 complete, confirm these exact backend contract behaviors:

```text
GET list
POST attach
GET detail
PATCH status
```

and confirm:

```text
owner/admin access
cross-tenant protection
non-student rejection
duplicate enrollment rejection
active/inactive status
```

The frontend verification must use the actual backend contract, not mocks alone.

---

# 29. Definition of Ready

Phase 16 is ready because:

1. The backend contract now contains the required student enrollment operations.
2. The frontend already has academy context.
3. The frontend already has navigation and a student route.
4. The placeholder can be replaced without restructuring the application.
5. The API layer can be added under the existing feature boundary.

---

# 30. Definition of Done

Phase 16 is complete when:

1. Placeholder student UI is removed.
2. Real student list loads from the backend.
3. Real student detail loads from the backend.
4. Existing student can be attached to the academy.
5. Enrollment status can be changed between `active` and `inactive`.
6. Backend errors are mapped to useful UI.
7. Owner/admin restrictions are respected.
8. Academy-aware query keys are correct.
9. Academy switching cannot leak student data.
10. Responsive behavior works.
11. Accessibility baseline passes.
12. Placeholder tests are replaced by real student tests.
13. API integration tests pass.
14. E2E critical journey passes where configured.
15. `pnpm lint` passes.
16. `pnpm test` passes.
17. `pnpm build` passes.
18. `pnpm test:e2e` passes where configured.
19. Verification is recorded in:
    `spec/verification/phase-16-student-management.md`
20. `progress.md` is changed only after the current implementation is actually verified.

---

# 31. Explicit Non-Goals

Do not implement:

```text
student account signup
student invitation
bulk student import
student search endpoint
parent invitation
curriculum assignment
placement
teacher assignment
availability
booking
attendance
assessment
progress
finance
notifications
```

unless the current backend contract explicitly exposes the behavior and the phase scope is intentionally expanded.

---

# 32. Completion Handoff

After Phase 16:

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
```

The student phase must hand scheduling a real, backend-verified enrolled-student record without duplicating enrollment logic.

---

# 33. Governing Principle

> **Implement the contract that exists — no placeholders, no invented student workflows.**

The Phase 16 implementation boundary is:

```text
active academy
→ authorized owner/admin
→ student enrollment list
→ attach existing student
→ inspect enrollment
→ activate/deactivate enrollment
```

Everything outside that boundary remains a separate future capability.
