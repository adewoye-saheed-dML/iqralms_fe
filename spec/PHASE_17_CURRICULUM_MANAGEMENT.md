# Phase 17 — Curriculum & Placement Management

**Repository:** `adewoye-saheed-dML/quran_fe`  
**Branch:** `main`  
**Status:** READY TO IMPLEMENT  
**Scope:** Frontend curriculum/placement foundation, strictly against the live backend OpenAPI contract.

---

## 1. Why Phase 17

Phase 16 (Student Management & Enrollment) is now implemented in the frontend:

- `/app/students` uses the live `StudentDirectory`.
- Students can be added by attaching an existing student user.
- Enrollment detail is available.
- Enrollment status can be changed between `active` and `inactive`.
- The Phase 16 verification receipt records the implementation as complete.
- The old student placeholder is no longer used.

The product SSoT defines the core journey as:

```text
Onboard
→ configure academy
→ establish curriculum
→ invite staff
→ add students
→ enroll students
→ schedule learning
→ teach
→ assess
→ monitor progress
→ reconcile pricing/payout information
```

The SSoT also places `curriculum` before `scheduling` in the authenticated application information architecture.

The repository currently has feature folders for onboarding, staff, and students, but no `src/features/curriculum` feature yet. Phase 17 therefore establishes the frontend curriculum workflow before scheduling work begins.

---

## 2. Source-of-truth rules

Follow these rules exactly:

1. `spec/FRONTEND_MASTER_SSoT.md` is the frontend product/UX source of truth.
2. `openapi/schema.yml` and the generated TypeScript API types are the exact API contract.
3. Backend authorization, tenancy, validation, and business rules are authoritative.
4. Do not invent endpoints, request fields, response fields, permissions, or workflow rules.
5. TanStack Query owns server state.
6. Presentation components must not contain direct API calls.
7. Academy/organization context must be part of all organization-scoped query keys.
8. Do not introduce Redux or another global state layer for this phase.

The SSoT explicitly says the frontend should help users establish curriculum before scheduling and that routes should represent user journeys rather than database tables.

---

## 3. Phase 17 goal

Build a usable, tenant-safe **Curriculum Management** experience for academy owners/admins, using only the curriculum capabilities actually exposed by the current backend contract.

The phase must establish the foundation needed for later scheduling and student learning workflows.

The phase is successful when an authorized academy administrator can:

1. Open the curriculum area for the active academy.
2. See curriculum data exposed by the backend.
3. Understand the curriculum hierarchy represented by the contract.
4. Create/update only the curriculum records and fields the backend actually allows.
5. See loading, empty, validation, forbidden, not-found, conflict, and success states wherever applicable.
6. Switch academies without leaking or reusing curriculum state from another academy.

---

## 4. First task: contract audit before coding

Before implementing UI, inspect the current `openapi/schema.yml` and generated TypeScript API types.

Specifically identify:

- curriculum-related paths
- track endpoints
- level endpoints
- placement-related endpoints
- create/update/delete capabilities
- exact request schemas
- exact response schemas
- organization/tenant parameters
- required roles/permissions
- pagination/filter/sort parameters, if any
- error responses
- relationships between tracks, levels, and placement data

**Do not guess endpoint names from this document.**

If the backend exposes fewer capabilities than this phase describes, implement only what is actually supported and document the unsupported remainder in the verification receipt.

If a required capability is absent from the backend contract, stop that sub-scope rather than creating a frontend mock or invented API.

---

## 5. Expected information architecture

Add:

```text
/app/curriculum
```

Recommended flow:

```text
Curriculum
→ tracks
→ levels/details
→ placement information where supported
```

Use the existing application shell and academy switcher.

Do not add unrelated curriculum routes until the backend contract proves they are needed.

---

## 6. Roles and permissions

The SSoT defines owner/admin experiences as including curriculum.

The backend remains authoritative for permissions.

Therefore:

- Owner/admin UI may expose curriculum administration only where the backend permits it.
- Staff/teacher/student/parent UI must not gain client-only authority.
- A forbidden backend response must produce an explicit forbidden state rather than a misleading empty state.
- Do not hard-code role checks as a substitute for backend authorization.

Where the backend contract does not state a frontend-visible role rule, do not invent one.

---

## 7. API architecture

Use the existing architecture:

```text
Page
→ feature component / hook
→ TanStack Query
→ typed API client
→ Django REST API
```

Create a feature area such as:

```text
src/features/curriculum/
├── api/
├── components/
├── hooks/
├── __tests__/
└── types/            # only when not already covered by generated types
```

Keep request logic out of presentation components.

Prefer generated OpenAPI types over handwritten API payload definitions.

If the current generated API types do not include the required curriculum schemas, regenerate them from the current backend contract before implementing the feature.

---

## 8. Tenant-safe query keys

All organization-scoped curriculum server state must include the active academy identifier.

Use a stable pattern such as:

```ts
['academy', academyId, 'curriculum', ...]
```

Do not use global keys like:

```ts
['curriculum']
```

When the academy changes:

- stale academy-specific curriculum data must not remain visible;
- the relevant queries must be invalidated/refetched using the existing academy-context pattern.

---

## 9. Curriculum directory experience

Build a primary curriculum page that reflects the real backend resources.

The page should include:

- clear page title and description
- primary contextual action only when supported
- loading state
- empty state
- error state
- forbidden state
- useful response data in a readable structure
- responsive behavior

Avoid decorative metric cards that do not answer a real operational question.

Prefer a structure that helps an academy administrator answer:

> What curriculum does this academy use, and what are the available learning levels/tracks?

---

## 10. Track experience

If the backend exposes organization-scoped track management:

Build the track list using the actual contract.

Support only the operations present in the API, for example:

- list
- retrieve
- create
- update
- delete

Do not assume all four exist.

Use the exact backend field names and validation rules.

If the backend includes a track status/active field, render it according to its real enum/boolean contract.

If the backend provides ordering, display the actual ordering; do not invent client-side semantics that imply a different business rule.

---

## 11. Level experience

If the backend exposes level management:

Provide a clear level view within the correct curriculum/track context.

Maintain tenant safety and the exact parent-child relationship defined by the API.

Do not create a custom hierarchy in client state that differs from backend relationships.

If levels are read-only in the contract, keep them read-only.

If levels are editable, mirror the exact editable fields and server validation.

---

## 12. Placement support

The SSoT identifies curriculum and placement as part of the learning journey.

If the live backend exposes placement review/data in this phase:

- show placement information using the exact response shape;
- make it clear whether the record is historical, current, pending, or editable;
- preserve backend-defined permissions;
- do not invent placement scoring rules;
- do not create a client-only placement algorithm.

If placement endpoints are not yet exposed for the required workflow, document that limitation and leave the unsupported operation unimplemented.

---

## 13. UX requirements

Follow the master SSoT:

- clarity over density
- workflow over CRUD
- progressive disclosure
- consistent interaction patterns
- calm and credible visual language
- accessible states
- responsive administration UI

For every major curriculum interaction provide the states actually applicable to the API:

```text
loading
empty
error
forbidden
not-found
conflict
submitting/saving
success
```

Do not display a generic empty state when the real problem is permission denial.

---

## 14. Forms

For create/update flows supported by the backend:

- show required fields clearly;
- show field-level validation where possible;
- show server-side validation messages;
- disable/relabel the submit action while saving;
- do not silently discard server errors;
- show a clear success result;
- keep the user in the logical workflow after success.

Never duplicate backend validation logic in a way that can diverge from the API.

Client validation may improve usability, but the backend remains authoritative.

---

## 15. Error handling

Map backend failures carefully.

At minimum, account for contract-supported versions of:

- `400` validation/business-rule failure
- `401` unauthenticated
- `403` forbidden
- `404` not found
- `409` conflict, when actually exposed by the contract
- network/unexpected failures

Do not convert a backend `403` into "No curriculum found."

Do not claim success until the mutation request succeeds.

---

## 16. Accessibility

Meet the frontend SSoT accessibility baseline:

- keyboard-complete primary workflows
- visible focus
- associated labels
- programmatic form errors
- sufficient contrast
- no color-only status communication
- accessible dialogs/focus management where dialogs are used
- reduced-motion consideration where relevant

---

## 17. Testing requirements

Implement real tests for the curriculum feature.

### Unit/component

Cover at least:

- initial loading
- successful data rendering
- empty state
- API error state
- forbidden state where applicable
- create/update form validation where applicable
- successful mutation
- mutation failure
- query invalidation after mutation
- academy-scoped query keys

### Integration/API boundary

Verify the feature calls the exact generated/typed API path and payload.

### E2E

Add a critical curriculum workflow when the test environment can support it, such as:

```text
login
→ select academy
→ open curriculum
→ perform one supported curriculum action
→ verify the resulting state
```

Do not fabricate backend fixtures or unsupported workflows.

---

## 18. Navigation

Add `/app/curriculum` to the authenticated navigation only where the existing navigation architecture expects it.

The navigation entry must respect the real role/permission model.

Do not add scheduling to the navigation as part of this phase unless scheduling already exists and merely needs linking.

---

## 19. Out of scope

Do **not** build these in Phase 17 unless the live backend contract explicitly requires them:

- scheduling
- teacher availability
- bookings
- Jitsi/session joining
- assessment entry
- progress dashboards
- pricing
- payouts
- notifications
- bulk import
- parent invitation flows
- student account creation
- a second authorization system
- client-side curriculum rules that duplicate backend business logic

Phase 17 establishes curriculum. Scheduling follows only after this phase passes its verification gate.

---

## 20. Completion gate

Phase 17 is complete only when all applicable checks pass:

```text
contract audit
→ implementation
→ lint
→ typecheck
→ unit/component tests
→ build
→ E2E critical workflow
→ academy-switch/tenant review
→ verification receipt
```

The verification receipt must record:

- exact backend endpoints used
- exact generated schemas used
- routes created/changed
- permissions observed
- tests run and results
- build result
- any contract limitations
- any explicitly deferred curriculum capability

Do not mark Phase 17 complete because the UI renders.

---

## 21. Required implementation discipline

Before finishing:

1. Re-read `spec/FRONTEND_MASTER_SSoT.md`.
2. Re-read the current `openapi/schema.yml`.
3. Re-check generated API types.
4. Inspect actual backend-supported curriculum operations.
5. Implement only supported workflows.
6. Run the full relevant verification suite.
7. Update the phase receipt.
8. Only then update the tracker from NOT STARTED to COMPLETE.

Do not edit the tracker first and work backward from it.

---

## 22. Deliverables

Expected frontend deliverables:

```text
src/app/app/curriculum/
src/features/curriculum/
spec/verification/phase-17-curriculum.md
```

Plus:

- updated navigation where appropriate
- regenerated API types if the contract changed
- tests for the implemented curriculum workflows
- any necessary shared UI additions

---

## 23. Definition of Done

Phase 17 is done when the active academy can use the supported curriculum workflow end-to-end from the frontend, the implementation uses the exact backend contract, tenant boundaries are preserved, the important UI states are covered, tests/build pass, and the verification receipt documents exactly what was delivered and what remains unsupported.
