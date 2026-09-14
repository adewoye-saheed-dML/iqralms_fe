# Phase 19 — Assessment & Learning Progress

**Repository:** `adewoye-saheed-dML/quran_fe`  
**Branch:** `main`  
**Status:** READY TO IMPLEMENT  
**Scope:** Frontend assessment, rubric, review, and progress workflows strictly against the live backend contract.

---

## 1. Phase readiness

Phase 18 is implemented in the frontend and has a verification receipt documenting scheduling endpoints, generated schemas, tenant-scoped query keys, booking/routing/waitlist behavior, tests, and build verification.

The live frontend currently identifies Phase 18 as active, so repository bookkeeping has not yet advanced even though the Phase 18 implementation receipt is complete. Do not use `CURRENT_PHASE.md` or the progress tracker alone as evidence of implementation status; verify code and receipts.

The next backend-supported domain is assessment and learning progress. The backend already exposes a substantial assessment surface, including rubric configuration, teacher assessment submission, student/parent assessment history, lead review, teacher-quality reporting, progress endpoints, and progress snapshots.

The frontend currently has no established assessment implementation comparable to the completed student, curriculum, and scheduling features. Therefore Phase 19 should establish the assessment/progress foundation before any later notification, financial, or bulk-import work.

---

## 2. Source-of-truth hierarchy

Use:

1. `spec/FRONTEND_MASTER_SSoT.md`
2. current `openapi/schema.yml`
3. generated frontend OpenAPI TypeScript types
4. backend assessment permissions/business rules

Never invent:

- assessment fields
- rubric rules
- score ranges
- review states
- progress calculations
- permissions
- snapshot semantics
- endpoints

The backend remains authoritative for assessment legality, historical data, review behavior, visibility, and tenant isolation.

---

## 3. Live backend assessment surface

The backend currently mounts assessment under:

```text
/api/assessment/organizations/{organization_pk}/
```

Confirmed endpoint families include:

```text
GET/POST /rubrics/
GET/PATCH /rubrics/{id}/

POST /bookings/{booking_id}/

GET /mine/
GET /child/
GET /teacher/mine/

GET /review/queue/
GET /reports/teachers/
GET /{id}/review/
GET /{id}/

GET /progress/mine/
GET /progress/child/

POST /snapshots/
GET /snapshots/all/
GET /snapshots/mine/
GET /snapshots/child/
```

Before implementation, inspect the live schema for the exact request/response schemas, parameters, and permission descriptions for every endpoint used.

Do not assume that every endpoint belongs in the first frontend workflow.

---

## 4. Phase 19 goal

Build a clear learning-quality workflow that connects:

```text
completed booking
→ teacher assessment
→ assessment history
→ lead review where applicable
→ learning progress
→ progress snapshot/history
```

The frontend should help users understand the student's learning journey rather than reduce assessment to one mutable score.

The SSoT explicitly prioritizes:

- assessment history
- placement/current level
- progress trends
- teacher observations
- completed learning areas
- next focus

Only display fields actually provided by the backend.

---

## 5. Roles and visibility

Follow backend permissions exactly.

### Student

May see their own assessment history and own progress where the backend allows it.

### Parent

May see linked-child assessment/progress resources where the backend allows it.

Do not expose another child's data through client-side filtering.

### Teacher

May submit assessments for sessions they taught and view the teacher-scoped assessment resources that the backend permits.

### Lead/admin

May configure rubrics, review flagged assessments, and access teacher-quality reporting where the backend permits it.

Do not create client-only permissions.

---

## 6. Recommended frontend information architecture

Add:

```text
/app/assessments
/app/assessments/my-history        # only if supported by role routing
/app/assessments/review            # lead/reviewer workflow where supported
/app/progress                       # role-specific progress view
```

Do not create every route solely because the backend has an endpoint.

Prefer role-aware workflows and progressive disclosure.

Keep route names aligned with user journeys rather than endpoint names.

---

## 7. Teacher assessment submission

The backend assessment submission is tied to a completed booking:

```text
POST /api/assessment/organizations/{organization_pk}/bookings/{booking_id}/
```

The teacher who taught the booking is the authorized assessor.

The frontend must:

1. present only an eligible/completed session when the existing UI can establish that state;
2. load the exact rubric required by the selected track/level or assessment contract;
3. render exactly the criteria and score representation supplied by the backend;
4. submit exactly the backend request shape;
5. preserve the backend's historical assessment semantics.

Do not permit a teacher to assess another teacher's booking through client-side controls.

Do not mark a booking completed as a side effect unless the backend endpoint explicitly does so.

---

## 8. Rubric configuration

If the current contract permits lead/admin rubric configuration, build the supported workflow.

Support only actual operations exposed by the API.

Potential workflow:

```text
Select track
→ inspect active rubric
→ create/update supported rubric data
→ manage criteria if exposed
→ save
```

Do not invent criterion management endpoints if the schema does not expose them.

Do not duplicate score validation rules in a way that can diverge from backend behavior.

---

## 9. Assessment history

The UI should emphasize that assessments are historical records.

Show, where the response provides them:

- date/time
- student
- teacher
- track/level
- rubric/criterion results
- summary/comments
- flag/review information where visible to that role

Do not flatten multiple historical assessments into one mutable "current score".

---

## 10. Lead review workflow

The backend exposes:

```text
GET /review/queue/
GET /{id}/
POST /{id}/review/
```

The frontend should represent the review process as:


```text
flagged assessment
→ inspect assessment
→ add review annotation where supported
→ mark reviewed
→ assessment leaves pending review queue
```

The backend contract indicates that reading an assessment does not mark it reviewed.

Do not auto-review on page load or on opening the detail screen.

The teacher's historical assessment fields must not be rewritten by the lead review workflow unless the backend explicitly exposes such editable fields.

---

## 11. Teacher quality reporting

The backend exposes:

```text
GET /reports/teachers/
```

If implemented in this phase, treat it as operational quality visibility, not a leaderboard.

Use only the backend's returned aggregates and ordering.

Do not invent rankings, targets, or comparative metrics.

The SSoT requires useful operational dashboards rather than decorative metrics.

---

## 12. Student and parent progress

Use the backend progress endpoints:

```text
GET /progress/mine/
GET /progress/child/
```

Respect the visibility boundary:

- students see themselves;
- parents see only linked children supported by the backend;
- unrelated users must not become visible through query manipulation.

Progress should be displayed as a learning journey.

Prefer sections such as:

```text
Current focus
Progress over time
Completed learning areas
Teacher observations
Next focus
```

Only render sections when backed by actual response fields.

---

## 13. Progress snapshots

The backend exposes:

```text
POST /snapshots/
GET /snapshots/all/
GET /snapshots/mine/
GET /snapshots/child/
```

Before implementing snapshot creation, inspect the exact backend permissions and request schema.

If the snapshot is a historical record, present it as historical data rather than an editable dashboard value.

Do not create a client-side snapshot engine.

---

## 14. Placement relationship

Phase 17 explicitly deferred the placement UI because the complete testing journey required separate context.

Do not silently fold placement testing into Phase 19.

Phase 19 may consume an already-exposed placement/current-level field only if the current response schema provides it and the workflow is clear.

A full placement-test workflow should be treated as a separate bounded sub-phase unless the live contract and existing product specification clearly support implementing it here.

---

## 15. Tenant-safe query keys

Every organization-scoped assessment/progress query must include the active academy identifier.

Use patterns such as:

```ts
['academy', academyId, 'assessment', ...]
['academy', academyId, 'progress', ...]
```

Examples:

```ts
['academy', academyId, 'assessment', 'mine']
['academy', academyId, 'assessment', 'review-queue']
['academy', academyId, 'assessment', 'teacher']
['academy', academyId, 'assessment', 'detail', assessmentId]
['academy', academyId, 'assessment', 'rubric', trackId]
['academy', academyId, 'progress', 'mine']
['academy', academyId, 'progress', 'child', studentId]
['academy', academyId, 'progress', 'snapshots', ...]
```

When switching academy context, stale assessment/progress state must be invalidated/refetched.

Never use global keys such as `['progress']` for academy-scoped server state.

---

## 16. API architecture

Use:

```text
Page
→ feature hook/component
→ TanStack Query
→ typed API client
→ Django REST API
```

Expected structure:

```text
src/features/assessment/
├── api/
├── components/
├── hooks/
├── __tests__/
└── types/

src/features/progress/
├── api/
├── components/
├── hooks/
├── __tests__/
└── types/
```

Keep direct API calls out of presentation components.

Prefer generated types from `src/lib/api/schema`.

---

## 17. UI states

Every major workflow must support its applicable states:

```text
loading
empty
error
forbidden
not-found
400 validation/business error
409 conflict where exposed
submitting
success
```

Assessment-specific examples:

- no completed sessions available to assess;
- no active rubric;
- assessment already exists;
- teacher does not own the booking;
- review item no longer pending;
- linked child not visible;
- progress history empty;
- snapshot creation rejected.

Do not convert forbidden into empty.

Do not convert business conflicts into generic network failures.

---

## 18. Accessibility

Follow the SSoT baseline:

- keyboard-complete assessment workflow
- labelled rubric controls
- programmatic validation messages
- visible focus
- accessible review dialogs/forms
- no score/status communication by color alone
- readable historical timelines
- accessible loading and success announcements where appropriate

---

## 19. Testing requirements

### Component/unit

Test:

- assessment history loading/rendering
- progress loading/rendering
- empty states
- forbidden states
- not-found states
- rubric rendering
- score/form validation where applicable
- successful assessment submission
- validation/business failure
- successful review action
- review conflict/failure
- progress rendering
- academy-scoped query keys

### API boundary

Verify exact endpoint and payload for every implemented mutation/query.

### E2E

Implement a critical assessment journey when fixtures permit it:

```text
login as teacher
→ select academy
→ open an eligible completed booking
→ submit assessment
→ verify assessment result/history
```

Then, if the test environment supports the necessary lead account:

```text
login as lead
→ open review queue
→ inspect flagged assessment
→ submit review
→ verify queue state
```

Do not fake backend assessment success by bypassing the API.

---

## 20. Navigation

Add role-appropriate assessment/progress navigation only where the existing navigation architecture expects it.

Do not expose lead-only review/report functionality as student/parent navigation.

Do not add unrelated pricing, payouts, imports, or notification navigation as part of this phase.

---

## 21. Out of scope

Do not implement in Phase 19 unless the live contract requires it:

- full placement testing workflow
- scheduling changes
- teacher availability editing
- Jitsi/video infrastructure
- pricing
- teacher payouts
- bulk import
- notification center
- accounting
- client-side assessment scoring rules
- client-side progress calculation that duplicates backend logic

---

## 22. Completion gate

Phase 19 is complete only after:

```text
contract audit
→ implementation
→ generated types verified
→ lint
→ typecheck
→ unit/component tests
→ build
→ E2E critical assessment workflow
→ academy-switch/tenant review
→ verification receipt
→ tracker update
```

The verification receipt must record:

- exact assessment/progress endpoints used
- exact generated schemas
- routes created/changed
- permissions observed
- historical-data semantics preserved
- tests and results
- build result
- explicit placement or other deferred work

Do not mark Phase 19 complete because an assessment page renders.

---

## 23. Required implementation discipline

Before completion:

1. Re-read `spec/FRONTEND_MASTER_SSoT.md`.
2. Inspect the current backend `openapi/schema.yml`.
3. Verify generated frontend types.
4. Inspect backend assessment permissions and model/view behavior.
5. Implement only supported workflows.
6. Run the full relevant verification suite.
7. Create/update `spec/verification/phase-19-assessment-and-progress.md`.
8. Only then advance `spec/CURRENT_PHASE.md` and the progress tracker.

Do not edit phase bookkeeping first and work backward from it.

---

## 24. Deliverables

Expected:

```text
src/app/app/assessments/
src/app/app/progress/
src/features/assessment/
src/features/progress/
spec/verification/phase-19-assessment-and-progress.md
```

Plus:

- role-aware navigation updates
- regenerated API types if the backend contract changed
- tests
- any necessary reusable assessment/progress UI components

---

## 25. Definition of Done

Phase 19 is done when the supported assessment and progress workflows operate against the real backend API, role visibility and academy tenancy are preserved, historical assessment semantics remain intact, meaningful UI states are covered, tests/build/E2E pass, and the verification receipt documents exactly what was implemented and what remains outside scope.
