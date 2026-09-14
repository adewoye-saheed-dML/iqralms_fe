# QURAN ACADEMY — FRONTEND PHASE 15
## Teacher & Staff Management

**Repository:** `adewoye-saheed-dML/quran_fe`  
**Branch:** `main`  
**Phase:** SaaS Phase 15  
**Phase name:** Teacher & Staff Management  
**Status:** READY TO START  
**Predecessor:** Phase 14 — Academy Onboarding & Initial Setup  
**Authority:** `openapi/schema.yml` + `spec/FRONTEND_MASTER_SSoT.md`

> **Roadmap decision:** Phase 14 is implemented and has a verification record in the repository, but the phase tracker/current-phase document still needs reconciliation. This document defines the next concrete product domain without claiming that the repository has already completed Phase 15.

---

# 1. Purpose

Phase 15 introduces the teacher/staff management foundation for the active academy.

The goal is to allow an authorized academy user to understand and manage the people who operate the academy, using the backend's real organization/membership contract.

The phase should establish:

```text
active academy
    ↓
authorized manager
    ↓
teacher/staff directory
    ↓
member details
    ↓
role-aware management
    ↓
invitation/onboarding where supported
```

This phase must remain tenant-safe and must not introduce scheduling, payroll, assessment, or unrelated staff-domain features.

---

# 2. Authority

Use this order:

1. `openapi/schema.yml` — authoritative API contract.
2. `spec/FRONTEND_MASTER_SSoT.md` — product and UX authority.
3. This document — Phase 15 execution scope.
4. Existing code — reuse compatible infrastructure.

Do not invent:

- endpoints
- fields
- roles
- permissions
- invitation states
- teacher attributes

If the backend does not expose a capability, mark it `OPEN` rather than faking it.

---

# 3. Entry Gate

Before implementation, confirm:

```text
Phase 13.0 Foundation       COMPLETE
Phase 13.1 Design System    COMPLETE
Phase 13.2 Authentication   COMPLETE
Phase 13.3 Academy Context  COMPLETE
Phase 14 Onboarding         IMPLEMENTED / VERIFIED
Phase 15 Teacher & Staff    READY TO START
```

The active academy context from Phase 13.3 is mandatory.

Do not rebuild academy selection or authentication.

---

# 4. Backend Contract Audit

Inspect `openapi/schema.yml` for the actual APIs covering:

```text
organization memberships
organization members
staff/teacher profiles
member roles
member invitations
member activation/deactivation
member detail/update
```

Determine:

- exact endpoint paths
- HTTP methods
- request schemas
- response schemas
- pagination
- filtering/search support
- writable fields
- role values
- permission restrictions
- invitation lifecycle
- organization scoping

Record anything unsupported as:

```text
OPEN — backend contract required
```

Do not proceed from assumptions.

---

# 5. Core Domain Model

Keep these concepts distinct:

```text
User
Membership
Teacher/Staff profile
Role
Active academy
Invitation
```

Do not assume every membership is a teacher.

Do not assume every teacher has identical permissions.

Use the backend's membership/role model as the source of truth.

---

# 6. Tenant Boundary

Every teacher/staff request must operate inside:

```text
active academy
```

The frontend must not accept arbitrary academy IDs from user input and treat them as trusted.

All requests must flow through:

```text
src/lib/api/client.ts
```

and the teacher/staff feature layer.

Suggested feature boundary:

```text
src/features/staff/
```

or the repository's established equivalent.

---

# 7. Directory

Build an academy-scoped teacher/staff directory.

The directory should communicate:

```text
Who works here?
What is their role?
What is their current status?
What can I manage?
```

Use the existing design-system primitives.

Potential columns/fields must come from the backend contract.

Do not invent profile information.

---

# 8. Directory States

Support:

```text
loading
loaded
empty
error
searching/filtering
```

The empty state should distinguish:

```text
no staff yet
```

from:

```text
no staff matching the current filter
```

when the backend data permits that distinction.

---

# 9. Search and Filtering

Implement only filters supported by the backend contract.

Possible examples:

```text
name
email
role
status
```

Do not add client-side filtering for large datasets when the backend provides server-side filtering.

If pagination exists, use it rather than downloading an unbounded membership list.

---

# 10. Staff Detail

Provide a staff/member detail view where the backend supports it.

The detail view should separate:

```text
identity
membership
role
status
academy context
```

Do not expose backend-only fields unnecessarily.

Do not display secrets, authentication tokens, or internal identifiers unless explicitly required by product design.

---

# 11. Role Management

If role management is supported:

- display the current role
- expose only backend-supported role choices
- require an appropriate confirmation for privileged changes
- handle forbidden responses
- refresh the membership after a successful change

Do not create frontend-only roles.

Do not let a client-side role selector become the authorization boundary.

---

# 12. Invitation Boundary

If the backend supports staff/teacher invitations, implement the invitation workflow only to the extent supported.

Expected conceptual flow:

```text
authorized manager
    ↓
invite staff member
    ↓
backend invitation
    ↓
pending state
    ↓
accepted/expired/revoked state where supported
```

Do not invent invitation lifecycle states.

If invitations are not available in the current API contract, mark this section `OPEN`.

---

# 13. Teacher Profile Boundary

If the backend exposes a teacher-specific profile model, implement the supported profile fields.

Do not add:

- availability
- class schedule
- payroll
- performance metrics
- assessment assignments

unless explicitly supported and approved for this phase.

Those are separate domains.

---

# 14. Staff Status

If membership status is available from the backend, represent it clearly.

Examples of UI states may include:

```text
active
pending
inactive
```

Only use values actually returned/defined by the backend.

Do not allow a visual status badge to imply authorization that the backend has not granted.

---

# 15. Create / Edit Flow

Where supported by the API:

```text
create/invite
→ success
→ directory refresh
```

and:

```text
edit
→ validate
→ save
→ refresh detail/directory
```

Prevent duplicate submissions.

Map backend validation errors to the appropriate fields.

---

# 16. Destructive Actions

If the backend supports removing/deactivating a member:

- use the shared destructive-action confirmation pattern
- explain the consequence
- require deliberate confirmation
- handle failure safely
- refresh the affected membership state

Do not permanently delete a user when the API only supports membership removal/deactivation.

---

# 17. Cache Strategy

Teacher/staff queries must be academy-aware.

Use query keys that explicitly include the active academy, for example:

```text
['academy', academyId, 'staff', ...]
```

or an equivalent repository convention.

When academy context changes:

```text
Academy A
    ↓
switch
    ↓
Academy B
    ↓
staff queries update
```

Academy A staff must never remain visible under Academy B.

Reuse the cache-safety pattern established in Phase 13.3.

---

# 18. Authorization

The frontend may hide or disable controls based on active membership role.

However:

```text
frontend presentation ≠ security
```

The backend remains authoritative.

Handle:

```text
401
403
404
409
422
```

according to the actual API error contract.

Do not convert forbidden actions into silent failures.

---

# 19. Routing

Use the authenticated application boundary.

A reasonable structure is:

```text
/app/staff
/app/staff/[memberId]
```

only if consistent with the existing route architecture.

Do not create routes merely because they are conventional.

If the product SSoT defines a different route, follow it.

---

# 20. UI Architecture

Use:

```text
page
→ feature component
→ feature hook
→ API function
→ shared API client
```

Do not place organization/member API calls directly into generic UI components.

Keep reusable visual primitives in:

```text
src/components/ui/
```

and staff-specific behavior in:

```text
src/features/staff/
```

---

# 21. Responsive Design

The staff directory and detail views must work on:

```text
desktop
tablet
mobile
```

For mobile, a table may become:

```text
stacked member cards
```

or another accessible responsive representation.

Do not create separate desktop/mobile data models.

---

# 22. Accessibility

Ensure:

- keyboard-accessible actions
- visible focus
- semantic headings
- labeled form controls
- accessible dialogs
- accessible status indicators
- confirmation before destructive actions
- useful error announcements
- no color-only role/status meaning

---

# 23. Testing Requirements

Add tests for:

## Directory

- [ ] staff loads
- [ ] loading state
- [ ] empty state
- [ ] API error
- [ ] pagination where supported
- [ ] search/filter where supported

## Detail

- [ ] member loads
- [ ] member not found
- [ ] role displayed
- [ ] status displayed

## Mutations

- [ ] create/invite where supported
- [ ] edit where supported
- [ ] role change where supported
- [ ] deactivate/remove where supported
- [ ] duplicate submission prevention
- [ ] validation errors
- [ ] forbidden responses

## Tenant safety

- [ ] academy-scoped query keys
- [ ] Academy A → Academy B switch
- [ ] stale staff data does not cross tenants

---

# 24. End-to-End Verification

Where Playwright is configured, verify:

```text
login
→ active academy
→ staff directory
→ staff member detail
```

For multi-academy accounts:

```text
Academy A
→ staff directory shows A
→ switch to Academy B
→ staff directory shows B
```

If invitations are supported:

```text
staff directory
→ invite
→ pending member
→ directory refresh
```

Do not claim invitation E2E coverage if the backend does not support it.

---

# 25. Verification Commands

Run:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
```

Then, where configured:

```bash
pnpm test:e2e
```

Also:

```bash
git status --short
```

Verify that no unrelated feature work was introduced.

---

# 26. Phase Task Checklist

## 15-A — Contract

- [ ] Audit organization membership endpoints.
- [ ] Audit staff/teacher profile endpoints.
- [ ] Audit role values.
- [ ] Audit invitation capability.
- [ ] Audit member status capability.
- [ ] Record unsupported items as `OPEN`.

## 15-B — Directory

- [ ] Create staff feature boundary.
- [ ] Implement academy-scoped directory.
- [ ] Implement supported search/filter.
- [ ] Implement supported pagination.
- [ ] Add loading/empty/error states.

## 15-C — Detail

- [ ] Implement member detail.
- [ ] Display supported identity fields.
- [ ] Display membership/role/status.
- [ ] Handle not-found/forbidden states.

## 15-D — Mutations

- [ ] Implement supported invite/create flow.
- [ ] Implement supported edit flow.
- [ ] Implement supported role management.
- [ ] Implement supported deactivation/removal.
- [ ] Add validation and confirmation.

## 15-E — Cache and tenancy

- [ ] Academy-aware query keys.
- [ ] Correct invalidation after mutations.
- [ ] Correct behavior after academy switch.
- [ ] Verify no cross-tenant stale data.

## 15-F — Verification

- [ ] Tests pass.
- [ ] Lint/typecheck passes.
- [ ] Build passes.
- [ ] E2E passes where configured.
- [ ] Verification document created.

---

# 27. Definition of Ready

Phase 15 is ready when:

1. Phase 13.3 academy context is complete.
2. Phase 14 onboarding implementation is verified.
3. Backend membership/staff contract has been audited.
4. Role and permission semantics are known.
5. Unsupported backend capabilities are explicitly identified.

---

# 28. Definition of Done

Phase 15 is complete only when:

1. Academy-scoped teacher/staff directory works.
2. Supported staff/member details work.
3. Supported role management works.
4. Supported invitation flow works, or is explicitly deferred because the backend does not support it.
5. Tenant-safe query keys are used.
6. Academy switching cannot leak staff data.
7. Authorization errors are handled correctly.
8. Loading/empty/error states are complete.
9. Responsive and accessible behavior is verified.
10. Tests pass.
11. Lint/typecheck passes.
12. Production build passes.
13. E2E passes where configured.
14. Verification evidence is recorded.

---

# 29. Explicit Non-Goals

Do not implement in Phase 15:

- teacher scheduling
- teacher availability management
- classroom scheduling
- payroll
- payouts
- assessments
- teacher performance analytics
- student management
- curriculum administration
- notification center
- audit history

These belong to later domain phases.

---

# 30. Documentation Gate

After Phase 15 is actually complete:

Update:

```text
progress.md
```

to mark:

```text
Phase 15 — Teacher & Staff Management
Status: COMPLETE
```

Update:

```text
spec/CURRENT_PHASE.md
```

to the next approved phase.

Create:

```text
spec/verification/phase-15-teacher-staff.md
```

with actual verification commands and results.

Never mark a phase complete based only on code existence.

---

# 31. Governing Principle

> **Teacher and staff management must operate strictly inside the active academy and the backend's membership contract.**

The safe sequence is:

```text
authenticated user
→ active academy
→ authorized membership
→ staff directory
→ staff detail
→ supported management action
→ verified backend result
```

No client-side shortcut may bypass tenant boundaries or backend authorization.
