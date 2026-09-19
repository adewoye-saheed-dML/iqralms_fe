# IQRA LMS Frontend — Direct Antigravity Correction Playbook

Repository: `adewoye-saheed-dML/iqralms_fe`
Frontend: Next.js + React + TypeScript
Backend contract: `adewoye-saheed-dML/iqralms` OpenAPI
Frontend role: user experience layer; **never the security boundary**

## 0. PURPOSE

This is an execution document for Antigravity CLI.

The frontend is currently suffering from contract drift because some code was changed to “look finished” while the actual backend contract still differs.

This document fixes that by imposing one rule:

```text
BACKEND IMPLEMENTATION
        ↓
OPENAPI
        ↓
GENERATED FRONTEND TYPES/CLIENT
        ↓
FEATURE API HOOKS
        ↓
UI
```

The frontend must not create an API contract that the backend does not expose.

Source basis:
- Supplied frontend master specification: OpenAPI-generated client/types are canonical; backend permissions/business rules are authoritative; TanStack Query owns server state; academy context is tenant-aware; workflow-first UX; no unauthorized actions; critical E2E journeys.
- Supplied SaaS roadmap: onboard academy, configure curriculum, invite staff, enroll students, schedule, teach, assess, progress, pricing/payouts.

---

# 1. NON-NEGOTIABLE ANTIGRAVITY RULES

1. Work only in `~/projects/iqralms_fe` for this repository.
2. Do not implement all phases in one pass.
3. Start with F00 and move in order.
4. Inspect actual backend OpenAPI before changing API code.
5. Never invent an endpoint.
6. Never use an endpoint that does not appear in current OpenAPI.
7. Never use `any` for an API request or response type.
8. Do not use `as unknown as SomeHandwrittenType` to hide an API mismatch.
9. Do not add `@ts-expect-error` merely because the backend schema is incomplete.
10. If OpenAPI is incomplete, stop and fix the backend contract first.
11. Do not duplicate backend transport interfaces by hand.
12. Generated OpenAPI types are canonical for transport data.
13. `User.role` and academy membership role are different concepts.
14. The current academy is an explicit tenant context.
15. Every tenant-scoped query key must include academy/organization identity in a consistent position.
16. Academy switching must remove/refetch stale tenant-scoped server state.
17. UI capability checks are convenience only; backend authorization remains authoritative.
18. Never show an action that the backend will reject for the current academy role, unless it is intentionally displayed as unavailable with an explicit reason.
19. Do not use local storage names inconsistently.
20. Do not assume an auth behavior that is not verified against the backend.
21. Do not build fake forgot-password or refresh-token behavior.
22. Do not build a fake invitation flow using membership creation.
23. The teacher invitation UI must consume the invitation API.
24. The student workflow must use `StudentEnrollment` data, not a generic “attach user” mental model.
25. Onboarding readiness must not be guessed from arbitrary counts like `staff.length > 1`.
26. Do not call a page “complete” because it renders; its critical workflow must work.
27. Every phase must pass its exact checks before it is marked DONE.
28. If a command fails, status is BLOCKED.

---

# 2. ANTIGRAVITY MASTER PROMPT

Paste this before F00.

```text
You are working on the Next.js frontend repository:
  ~/projects/iqralms_fe

Backend repository:
  adewoye-saheed-dML/iqralms

Goal:
Bring the frontend into exact alignment with the corrected backend and the frontend master specification.

STRICT RULES:
1. Work one phase at a time from F00 through F12.
2. Before every phase, inspect the current code and current backend OpenAPI.
3. Do not invent endpoints, fields, statuses, roles or auth behavior.
4. OpenAPI-generated types are canonical for API transport.
5. No `any` for API payloads/responses.
6. No `as unknown as` transport casts to hide mismatches.
7. No `@ts-expect-error` for API drift.
8. If the backend contract is missing something needed by the workflow, STOP and report the exact missing backend contract. Do not fake it in the frontend.
9. `User.role` is global account role.
10. Academy membership role is organization authority.
11. The selected academy is tenant context.
12. Every tenant-scoped server query key must include the academy id.
13. Academy switch must remove stale tenant-scoped cache and load the new tenant data.
14. Do not show backend-forbidden actions as active UI controls.
15. Teacher invitations use the invitation endpoint, not direct membership creation.
16. Student management is based on StudentEnrollment.
17. Onboarding readiness must come from explicit supported backend facts, not guessed counts.
18. Do not mark phases complete from file existence or commit messages.
19. Use implementation_plan.md before edits.
20. After each phase run exact lint/type/test/build checks.
21. Update progress only after checks pass.

FIRST ACTION:
Do not edit code.
Inspect git status, current HEAD, package.json, Next config, tsconfig, src tree, OpenAPI schema, API client, auth, academy provider, query keys, capabilities, navigation, onboarding, staff/teachers, students, scheduling, finance/payouts, and tests.
Compare the frontend API calls against `openapi/schema.yml`.
Then create `implementation_plan.md` for F00 only.
```

---

# 3. F00 — BASELINE BEFORE CODING

Run:

```bash
cd ~/projects/iqralms_fe

git status --short
git branch --show-current
git log -10 --oneline --decorate

find src -maxdepth 5 -type f | sort | sed -n '1,320p'

cat package.json

rg -n "apiClient|openapi-fetch|fetch\(|axios|@ts-expect-error|as unknown as|\bany\b" src
rg -n "localStorage|auth_token|quran_fe_token|selected_academy|ACADEMY_STORAGE" src
rg -n "UserRole|OrgRole|allowedOrgRoles|allowedUserRoles|activeRole|userRole|can\(" src
rg -n "memberships/|invitations/|students/|teacher-configurations|payouts|finance|scheduling" src

pnpm lint
pnpm typecheck
pnpm test -- --run
pnpm build
```

Use the actual script names from `package.json`; if one does not exist, inspect the scripts before substituting the repository's supported command.

## F00 acceptance gate

Do not change application behavior yet.

Create:

```text
implementation_plan.md
```

The plan must list every current mismatch found, grouped by phase.

---

# 4. F01 — OPENAPI SCHEMA IS THE ONLY API TRANSPORT AUTHORITY

## Objective

Every frontend API module must use the generated OpenAPI client/types.

## Inspect

```text
src/lib/api/
openapi/schema.yml
src/features/*/api/
```

Search:

```bash
rg -n "interface .*Response|interface .*Payload|type .*Payload|type .*Response|as unknown as|fetch\(|@ts-expect-error|\bany\b" src/features src/lib
```

## Required result

Transport layer:

```text
apiClient
  ↓
OpenAPI-generated request/response types
```

Feature API modules may expose feature-specific helper functions, but must not redefine server schemas.

## Known current defects to remove

### Student API

Remove the handwritten transport interface equivalent to:

```ts
interface StudentEnrollmentView {
  id: number;
  user: number;
  username?: string;
  ...
}
```

Do not replace it with another handwritten interface.

First ensure the backend GET student endpoints expose concrete response schemas. Then regenerate types.

### Staff API

Remove:

```ts
type AddMemberPayload = any
```

Do not use the membership POST merely to make the frontend work.

Use the backend invitation contract after F07.

## Stop condition

If the backend schema does not describe a response/payload needed here, STOP and write:

```text
BLOCKED BY BACKEND CONTRACT:
endpoint:
missing request/response schema:
frontend file affected:
backend phase required:
```

---

# 5. F02 — REBUILD THE API CLIENT BOUNDARY

## Objective

There must be one typed API transport boundary.

## Required layering

```text
Page/component
    ↓
feature hook/service
    ↓
TanStack Query
    ↓
feature API function
    ↓
apiClient
    ↓
OpenAPI
```

Do not make raw requests directly from visual components.

## Search

```bash
rg -n "fetch\(|XMLHttpRequest|axios|apiClient\." src/components src/app
```

Presentation components should not contain direct API calls.

## API error behavior

Create one predictable error normalization path.

At minimum support:

```text
401 → auth/session handling
403 → forbidden state
404 → not found state
400 → validation state
409 → conflict state
5xx → safe retry/error state where appropriate
```

Do not leak raw Django HTML errors into the UI.

---

# 6. F03 — AUTHENTICATION CONTRACT

## Objective

Use the actual DRF token contract and one consistent storage key/mechanism.

## Backend contract must be verified first

Check the backend settings and login/logout/me endpoints.

Current backend configuration uses token authentication and `dj-rest-auth` style token behavior.

Do not invent:

```text
refresh token
JWT rotation
cookie clearing
silent refresh
```

unless the backend actually supports it.

## Search frontend

```bash
rg -n "localStorage|sessionStorage|auth_token|quran_fe_token|Token |Bearer |logout|login" src
```

The current test suite uses `quran_fe_token`, while application code has used `auth_token` in prior implementation. This inconsistency must be removed.

Choose exactly one key and update application code/tests/docs together.

## Auth acceptance tests

```text
valid login → token stored once
/me → authenticated user loaded
logout → token cleared
invalid token → auth state cleared
401 protected endpoint → predictable unauthenticated state
no fake refresh flow
```

---

# 7. F04 — ROLE MODEL: GLOBAL ROLE VS ACADEMY ROLE

## Objective

Never mix:

```text
User.role
```

with:

```text
OrganizationMembership.role
```

Backend meaning:

```text
User.role:
  lead
  sub
  student
  parent

OrganizationMembership.role:
  owner
  admin
  staff
  teacher
```

## Inspect

```bash
rg -n "UserRole|OrgRole|userRole|activeRole|role.*lead|role.*admin|allowedOrgRoles|allowedUserRoles" src
```

## Required design

Use a clear capability model such as:

```text
current user account type
        +
current academy membership authority
        ↓
current capabilities
```

Do not let an academy membership `teacher` role make a globally-student account a teacher unless the backend explicitly allows that concept.

Do not let a global `lead` role automatically grant owner/admin capabilities inside every academy.

The current academy membership is the authority for academy actions.

---

# 8. F05 — CAPABILITY MATRIX MUST MATCH BACKEND PERMISSIONS

## Objective

Create one frontend capability table and align it to actual backend permissions.

Build a table during implementation:

```text
Capability                 Backend permission          Frontend roles
manage academy             ...                          ...
manage curriculum          ...                          ...
manage staff               ...                          ...
manage students            ...                          ...
view own teaching          ...                          ...
manage scheduling          ...                          ...
view own payouts           ...                          ...
manage academy payouts     ...                          ...
view audit                 ...                          ...
```

Do not guess from route names.

## Important current mismatch

Backend membership and student management endpoints are currently owner/admin restricted.

Do not grant those capabilities to generic staff/teacher merely because the UI used to show them.

If backend authorization is intentionally widened later, make that an explicit backend phase and regenerate OpenAPI.

## Acceptance

For every capability, point to:

```text
backend permission class / queryset / endpoint
```

and test at least one allowed and one denied case.

---

# 9. F06 — ACADEMY CONTEXT AND TENANT QUERY KEYS

## Objective

The selected academy is the tenant context for the entire app.

## Required query-key shape

Use centralized factories, for example:

```text
organizationKeys...
studentKeys...
teacherKeys...
schedulingKeys...
financeKeys...
```

Tenant-owned feature keys must include the organization id.

Examples:

```text
['students', organizationId]
['teachers', organizationId]
['scheduling', organizationId, ...]
```

Keep the actual naming convention centralized; do not manually repeat key arrays everywhere.

## Search

```bash
rg -n "queryKey:\s*\[|invalidateQueries|removeQueries|setQueryData" src
```

## Academy switch behavior

On switch:

1. update selected academy
2. remove stale tenant-scoped cache
3. refetch/load current academy data
4. never display Academy A data while Academy B is active

Do not depend on arbitrary key conventions such as only checking `key[0] === 'academy'` unless every tenant key is guaranteed by one factory.

## Test

Two mocked academies:

```text
A → students A
B → students B
```

Switch A → B using the real UI control.
Do not fake switching by directly manipulating localStorage inside the test.

---

# 10. F07 — CORRECT TEACHER/STAFF INVITATION WORKFLOW

## Current defect

The current frontend has a staff form that asks for:

```text
User ID
Role
```

and attempts a membership POST.

That is not the corrected invitation lifecycle.

## Required workflow

Frontend must call the backend invitation endpoint:

```text
POST /api/organizations/{organization_pk}/invitations/
```

with only fields present in the generated OpenAPI request schema.

The UI should collect the actual supported invitation information, expected to include:

```text
email
role
```

Do not require User ID for the invitation unless OpenAPI explicitly requires it.

## Required acceptance UX

Invitation acceptance is a separate flow.

It must not create a membership directly from the admin UI.

## Tests

```text
owner/admin opens invite screen
invalid email → validation error
valid teacher invitation → API called
pending invitation → visible with pending state
non-manager cannot use invite action
accept invitation → membership becomes available after backend acceptance
```

## Stop condition

If the backend OpenAPI does not expose the invitation request/response schema correctly, STOP and fix B03/B09 first.

---

# 11. F08 — STUDENT ENROLLMENT WORKFLOW

## Objective

Change the UI mental model from:

```text
“attach a user ID”
```

to:

```text
“enroll a student in this academy”
```

The backend `StudentEnrollment` supports academy-specific academic fields including:

```text
organization
student user
track
level
status
```

The actual writable fields must come from generated OpenAPI schemas.

## Required UI

The student flow should make clear:

```text
Student account
→ Academy enrollment
→ Track/programme
→ Level/placement
→ Status
```

Do not invent search endpoints if the backend does not provide them.
If only an existing student user id is currently supported, keep that capability explicit while making the wording enrollment-focused.

## API typing

No handwritten `StudentEnrollmentView` transport type.
No `unknown as` cast.

## Acceptance

After successful enrollment:

- selected academy is retained
- query invalidation uses the selected academy id
- student appears in the correct tenant
- student does not appear in another academy
- invalid cross-tenant track/level response is displayed safely

---

# 12. F09 — ONBOARDING MUST STOP GUESSING

## Current defects to remove

Do not use rules equivalent to:

```ts
const isCurriculumSetup = tracks.length > 0;
const isStaffSetup = staff.length > 1;
const isStudentsSetup = students.length > 0;
```

The most problematic rule is:

```text
staff.length > 1 = staff setup complete
```

That is not a backend business rule.

## Required approach

Represent onboarding as explicit steps backed by supported data/actions.

At minimum:

```text
academy details
curriculum
teachers/staff
students
class configuration
notifications
ready
```

For every step, record:

```text
What backend fact proves completion?
Which endpoint supplies it?
Which role may perform the action?
```

If no backend fact exists for a step, mark the step as:

```text
OPEN / NOT YET CONTRACTED
```

Do not turn an unsupported assumption into readiness.

## Future-phase UI

Do not label unsupported features “Open” in a way that implies implementation exists.
Use clear copy such as:

```text
Not yet configured
Not available in the current academy setup
```

only where truthful.

## Acceptance

No onboarding state is based solely on arbitrary collection counts.

---

# 13. F10 — TEACHERS VS STAFF ROUTE ARCHITECTURE

## Objective

Keep the user-facing route aligned with the master specification.

The current repository has:

```text
/app/teachers
```

which is the desired route name from the frontend master specification.

Do not reintroduce:

```text
/app/staff
```

as the main teacher management route unless the master specification is explicitly changed.

Feature folders may still be:

```text
src/features/staff
src/features/teachers
```

but route meaning must be clear.

Use:

```text
/app/teachers
/app/teachers/add
/app/teachers/[memberId]
```

and distinguish:

```text
teacher management
organization staff management
```

in the UI rather than treating every organization member as a teacher.

---

# 14. F11 — SCHEDULING, FINANCE AND PAYOUT ALIGNMENT

## Scheduling

Every request must include the selected academy id through the correct OpenAPI path.

Never call old global scheduling endpoints.

Search:

```bash
rg -n "scheduling/" src/features src/app
```

Cross-check every path against `openapi/schema.yml`.

## Finance vs payout

The master specification requires separation between:

```text
academy/admin financial management
```

and:

```text
teacher own earnings/statements
```

Current intended route pattern:

```text
/app/finance       → academy/admin finance surface
/app/payouts       → own teacher earnings surface
```

But capabilities must follow actual backend permissions.

Do not expose academy-wide payout data to ordinary staff or teachers merely because the page exists.

## Payout data

Do not compute money in the frontend from booking durations/rates if the backend already supplies authoritative payout records/statements.

The frontend displays backend financial facts.

---

# 15. F12 — TESTS, BUILD, ACCESSIBILITY AND DOCUMENTATION

## Unit tests

Cover:

```text
capabilities
role separation
academy context
query key factories
auth state transitions
error mapping
```

## Component tests

Use Testing Library for:

```text
forms
validation
loading states
error states
forbidden actions
empty states
accessible labels
```

## E2E tests

The current `e2e/critical-journeys.spec.ts` contains stale assumptions and recorded failures. Replace it with tests against the actual implementation.

### Mandatory E2E journeys

1. Login → current user → academy selection
2. Owner/admin academy setup
3. Admin invites teacher using invitation endpoint
4. Admin enrolls student
5. Student/parent sees only permitted academy data
6. Teacher opens today’s class / scheduling
7. Teacher submits supported assessment/class data
8. Lead reviews assessment
9. Parent/student sees progress
10. Admin views audit without edit controls
11. Academy switch changes tenant data cleanly

### Critical rule

Do not write tests that “prove” something by manipulating implementation internals.

Bad:

```text
write selected academy directly to localStorage
reload
```

Good:

```text
click the actual academy switcher
observe network/UI behavior
verify tenant data changes
```

### Do not use invalid mock roles

Do not mock:

```text
User.role = admin
```

because `admin` is an academy membership role, not one of the documented global account roles.

Build mocks from the actual backend schema.

## Accessibility

Verify:

```text
keyboard navigation
labels
focus states
button names
table semantics
form errors
aria-live for dynamic errors where appropriate
responsive layout
```

## Commands

Use the actual package scripts, then run:

```bash
pnpm lint
pnpm typecheck
pnpm test -- --run
pnpm build
pnpm exec playwright test
```

If the repository uses different script names, inspect `package.json` first and use the repository's real commands.

A phase is not complete when Playwright has failures.

---

# 16. REMOVE DUPLICATE/DEAD IMPLEMENTATIONS

Search repeatedly:

```bash
rg -n "@ts-expect-error|as unknown as|\bany\b|auth_token|quran_fe_token|/app/staff|memberships/.+POST|AddMemberPayload|StudentEnrollmentView" src e2e
```

Expected final outcome:

```text
no API `any`
no API transport `unknown as`
no undocumented membership POST
no stale /app/staff primary route
no inconsistent token key
no fake invitation workflow
no fake student transport type
```

Be careful with `any` in non-API places. The target is not “zero characters `any`”; the target is zero unsafe API contract escapes and no avoidable type holes.

---

# 17. OPENAPI REGENERATION / UPDATE RULE

Backend schema is the source.

When the backend changes:

```text
backend implementation
→ backend tests
→ schema regeneration
→ frontend schema update
→ generated types update
→ frontend API code
→ frontend tests
```

Never change frontend API calls first and hope the backend will be updated later.

---

# 18. FRONTEND PROGRESS LEDGER

Create:

```text
CORRECTION_PROGRESS.md
```

Use:

```markdown
# IQRA LMS Frontend Correction Progress

| Phase | Status | Evidence |
|---|---|---|
| F00 | DONE/BLOCKED | exact command results |
| F01 | DONE/BLOCKED | exact command results |
| F02 | DONE/BLOCKED | exact command results |
| F03 | DONE/BLOCKED | exact command results |
| F04 | DONE/BLOCKED | exact command results |
| F05 | DONE/BLOCKED | exact command results |
| F06 | DONE/BLOCKED | exact command results |
| F07 | DONE/BLOCKED | exact command results |
| F08 | DONE/BLOCKED | exact command results |
| F09 | DONE/BLOCKED | exact command results |
| F10 | DONE/BLOCKED | exact command results |
| F11 | DONE/BLOCKED | exact command results |
| F12 | DONE/BLOCKED | exact command results |
```

Do not keep the old tracker claiming V01–V04 complete until the actual tests pass.

---

# 19. EXACT PHASE ORDER

Antigravity must execute in this order:

```text
F00 baseline
  ↓
F01 OpenAPI transport authority
  ↓
F02 typed API client boundary
  ↓
F03 authentication contract
  ↓
F04 role model
  ↓
F05 capability matrix
  ↓
F06 academy context + query keys
  ↓
F07 invitation workflow
  ↓
F08 student enrollment workflow
  ↓
F09 onboarding
  ↓
F10 teachers/staff routes
  ↓
F11 scheduling + finance + payouts
  ↓
F12 verification + docs
```

Do not skip directly to UI polish.

---

# 20. FINAL FRONTEND STOP CONDITIONS

Do not start new product features while any of these remains:

```text
❌ frontend calls endpoint absent from current OpenAPI
❌ API request/response uses `any`
❌ API data uses `unknown as` to bypass schema mismatch
❌ API call uses `@ts-expect-error` because backend schema is incomplete
❌ teacher invite still creates membership directly
❌ onboarding readiness uses guessed counts
❌ global role and academy role are mixed
❌ staff/teacher capabilities exceed backend permissions
❌ academy switch leaves stale tenant data visible
❌ student list uses a handwritten transport model
❌ auth token storage key differs between app/tests
❌ tests mock invalid backend roles
❌ E2E switches academy by directly mutating localStorage rather than exercising the UI
❌ Playwright has failures
❌ typecheck fails
❌ build fails
❌ lint fails
❌ progress tracker says COMPLETE without command evidence
```

When all stop conditions are clear, the FE is aligned with the corrected backend contract and is ready for subsequent product feature work.

---

# 21. FINAL CROSS-REPO CHECK

Run this only after the backend and frontend correction phases pass separately.

```text
BE schema
   ↓
FE schema copy/update
   ↓
FE generated types
   ↓
FE endpoint calls
```

For every frontend endpoint call, verify:

```text
path exists in backend OpenAPI
HTTP method matches
path params match
request body schema matches
response schema matches
auth requirement matches
tenant organization id is present where required
frontend capability does not contradict backend permission
```

Create a final table:

```markdown
| FE feature | Endpoint | Backend OpenAPI | FE type | Permission aligned | Test |
|---|---|---|---|---|---|
```

Do not declare synchronization complete without this table being reviewable.
