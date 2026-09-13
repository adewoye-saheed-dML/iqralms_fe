# Quran Academy Frontend Repository Canonicalization & SSoT Alignment

**Repository:** `adewoye-saheed-dML/quran_fe`  
**Branch:** `main`  
**Document purpose:** Clean the frontend repository, remove conflicting documentation and structure, and establish one canonical implementation standard before further feature work.

> This document is a **repository cleanup and synchronization instruction**. It is not a new product specification.
>
> The authoritative product/UX/API decisions remain those in the approved **Quran Academy Frontend Master Specification** and the live backend/OpenAPI contract.

---

## 1. Objective

The current frontend repository contains a mixture of:

- old Phase 1 documentation,
- Phase 13.0 remediation documentation,
- partially implemented foundation code,
- inconsistent progress tracking,
- authentication assumptions that do not match the current API contract,
- academy-context logic that makes unsafe assumptions,
- role names that are not yet normalized,
- and a source tree that contains placeholder/core folders rather than domain-oriented organization.

Before continuing with later frontend phases, the repository must be brought back to one coherent state.

### Required outcome

After this cleanup:

1. There is **one frontend product/architecture SSoT**.
2. There is **one current phase tracker**.
3. Authentication follows the actual backend/OpenAPI contract.
4. Academy context follows the multi-tenant model.
5. Role terminology is derived from the backend contract.
6. The source tree has clear ownership for routes, UI, features, API, auth, tenant context, utilities, and tests.
7. Old/duplicate specifications no longer compete with the current SSoT.
8. No implementation is allowed to silently invent API behavior.
9. The repository clearly states what is complete, what is incomplete, and what comes next.
10. No new product feature work starts until this synchronization gate passes.

---

# 2. Authority Hierarchy

When documents or implementation disagree, use this exact order.

## Level 1 — Backend/API contract

Authoritative for:

- endpoint paths,
- HTTP methods,
- request bodies,
- response schemas,
- validation,
- status codes,
- authentication mechanism,
- permissions,
- role values,
- tenant scoping,
- pagination,
- field names,
- enums.

Primary sources:

```text
openapi/schema.yml
actual backend implementation/tests
```

Never invent API fields or behavior in the frontend.

---

## Level 2 — Frontend Master Specification

The approved **Quran Academy Frontend Master Specification — Phase 13** is authoritative for:

- product UX,
- information architecture,
- route intent,
- role-based UX,
- design system direction,
- frontend architecture,
- user journeys,
- responsive strategy,
- accessibility,
- RTL strategy,
- implementation sequence,
- frontend definition of ready/done.

Store the canonical copy in:

```text
spec/FRONTEND_MASTER_SSoT.md
```

This file becomes the single frontend product/architecture reference.

---

## Level 3 — Repository implementation

Existing source code is evidence of the current implementation state.

It is **not automatically authoritative** when it conflicts with Levels 1 or 2.

When code conflicts with the contract/specification:

```text
do not defend the existing code
do not create another interpretation
fix the implementation
```

---

## Level 4 — Tracking/documentation

`progress.md`, `decisions.md`, `learnings.md`, `CLAUDE.md`, and phase documents must describe the actual state of the repository.

They must not create alternative product rules.

---

# 3. Current Problems To Remove

The repository currently contains conflicting or obsolete planning artifacts including:

```text
spec/PHASE_01_FOUNDATION.md
spec/FRONTEND_PRODUCT_AND_DESIGN_SPEC.md
spec/PHASE_13_0_FOUNDATION_VERIFICATION.md
spec/PHASE_13_0_FRONTEND_FOUNDATION_REMEDIATION.md
progress.md
CLAUDE.md
```

The repository also contains implementation that is partially ahead of the progress tracker.

Examples include:

- existing application shell,
- dashboard and academy routes,
- shared UI primitives,
- API client,
- OpenAPI-generated TypeScript types,
- auth provider,
- academy provider,
- navigation configuration,
- TanStack Query setup.

Therefore the repository must no longer claim that the foundation is simply "not started".

---

# 4. Canonical Documentation Layout

The repository must use the following documentation structure.

```text
/
├── AGENTS.md
├── CLAUDE.md
├── decisions.md
├── learnings.md
├── progress.md
│
├── openapi/
│   └── schema.yml
│
└── spec/
    ├── FRONTEND_MASTER_SSoT.md
    ├── CURRENT_PHASE.md
    └── verification/
        └── PHASE_13_0_FOUNDATION_GATE.md
```

## Documentation rules

### `spec/FRONTEND_MASTER_SSoT.md`

This is the only frontend product/architecture SSoT.

It contains:

- product principles,
- information architecture,
- roles,
- route map,
- UX rules,
- design system,
- frontend stack,
- API integration rules,
- auth architecture,
- academy-context architecture,
- accessibility,
- responsive behavior,
- RTL,
- user journeys,
- testing,
- phase sequence,
- definition of ready/done,
- decision/open-question ledger.

Do not create another file that redefines these.

---

### `spec/CURRENT_PHASE.md`

This contains only the current implementation phase.

For example:

```text
Current phase: SaaS Phase 13.0
Phase name: Frontend Foundation
Status: IN PROGRESS
```

It must contain:

- current objective,
- accepted prerequisites,
- current tasks,
- blockers,
- verification commands,
- exit criteria.

When Phase 13.0 is complete, update this file to Phase 13.1.

Do not keep old phase trackers active indefinitely.

---

### `spec/verification/PHASE_13_0_FOUNDATION_GATE.md`

This contains only the verification checklist and evidence for Phase 13.0.

It should record:

```text
date
commit
lint
test
build
e2e
CI
known failures
resolved failures
```

---

# 5. Remove Documentation Duplication

The following legacy files must no longer act as independent specifications:

```text
spec/PHASE_01_FOUNDATION.md
spec/FRONTEND_PRODUCT_AND_DESIGN_SPEC.md
spec/PHASE_13_0_FOUNDATION_VERIFICATION.md
spec/PHASE_13_0_FRONTEND_FOUNDATION_REMEDIATION.md
```

Do not simply leave all of them active.

### Required treatment

- Migrate any still-valid information into `spec/FRONTEND_MASTER_SSoT.md`.
- Migrate current phase tasks into `spec/CURRENT_PHASE.md`.
- Migrate verification criteria into `spec/verification/PHASE_13_0_FOUNDATION_GATE.md`.
- Then remove or clearly archive the obsolete documents.
- Do not retain multiple files that engineers must cross-check to understand the current frontend phase.

If historical preservation is required, use:

```text
spec/archive/
```

and mark archived files:

```text
ARCHIVED — NOT AUTHORITATIVE
```

---

# 6. Canonical Source Tree

The frontend source tree must be organized by responsibility.

Use this target structure:

```text
src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   ├── about/
│   │   ├── features/
│   │   ├── pricing/
│   │   └── contact/
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── accept-invitation/
│   │
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── academy/
│   │   ├── students/
│   │   ├── teachers/
│   │   ├── curriculum/
│   │   ├── scheduling/
│   │   ├── assessments/
│   │   ├── pricing/
│   │   ├── payouts/
│   │   ├── notifications/
│   │   ├── audit/
│   │   ├── settings/
│   │   └── profile/
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── favicon.ico
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
│
├── features/
│   ├── auth/
│   ├── academy/
│   ├── students/
│   ├── teachers/
│   ├── curriculum/
│   ├── scheduling/
│   ├── assessments/
│   ├── progress/
│   ├── pricing/
│   ├── payouts/
│   ├── notifications/
│   ├── imports/
│   └── audit/
│
└── lib/
    ├── api/
    │   ├── client.ts
    │   ├── errors.ts
    │   ├── schema.d.ts
    │   └── generated/
    │
    ├── auth/
    ├── academy/
    ├── navigation/
    ├── permissions/
    ├── providers/
    ├── dates/
    └── utils.ts
```

---

# 7. Source Organization Rules

## `src/app`

Only Next.js route/page/layout concerns belong here.

Allowed:

```text
page.tsx
layout.tsx
loading.tsx
error.tsx
not-found.tsx
route.ts
```

Do not place large business-domain implementations directly inside route pages.

A page should compose feature components.

---

## `src/components/ui`

Only reusable visual primitives belong here.

Examples:

```text
button.tsx
input.tsx
label.tsx
select.tsx
textarea.tsx
badge.tsx
card.tsx
alert.tsx
dialog.tsx
sheet.tsx
tabs.tsx
tooltip.tsx
loading.tsx
empty-state.tsx
error-state.tsx
page-header.tsx
```

No academy/student/scheduling business logic belongs here.

---

## `src/components/layout`

Only global application shell components belong here.

Examples:

```text
app-shell.tsx
app-sidebar.tsx
app-topbar.tsx
mobile-navigation.tsx
academy-switcher.tsx
account-menu.tsx
```

---

## `src/components/shared`

Cross-domain components that are more meaningful than a primitive but are not owned by one feature.

Examples:

```text
status-badge.tsx
data-table.tsx
confirm-dialog.tsx
empty-page.tsx
error-page.tsx
```

Only add these when they are genuinely shared.

---

## `src/features`

This becomes the home of actual product domain code.

Example:

```text
src/features/students/
├── components/
├── hooks/
├── queries/
├── mutations/
├── schemas/
├── types/
└── index.ts
```

Do not create meaningless placeholder folders such as:

```text
features/core/
```

unless `core` is a real product domain.

The existing `src/features/core` placeholder should be removed or converted into a genuine shared feature only if there is a demonstrated need.

---

# 8. Route vs Feature Rule

Use this rule:

```text
Route = URL boundary
Feature = business/domain implementation
Component = reusable visual behavior
Lib = infrastructure
```

Example:

```text
src/app/app/students/page.tsx
```

should primarily compose:

```text
src/features/students/
```

and reusable components from:

```text
src/components/
```

It should not contain a large API client, serializer definitions, authorization logic, or complex business rules.

---

# 9. API Layer Rule

There must be exactly one frontend API boundary.

Canonical location:

```text
src/lib/api/
```

Required:

```text
client.ts
errors.ts
schema.d.ts
```

Generated API types must continue to come from:

```text
openapi/schema.yml
```

using:

```text
pnpm generate:api
```

Do not manually recreate backend response interfaces when OpenAPI already defines them.

Do not introduce Axios if the existing fetch-based client is sufficient.

Do not create another API client in:

```text
features/
components/
app/
```

---

# 10. Authentication Correction

The current implementation contains an unsafe assumption about cookie authentication and an endpoint mismatch.

This must be corrected before authentication is considered complete.

The canonical contract currently documented by the frontend SSoT is:

```text
POST /api/auth/login/
POST /api/auth/logout/
POST /api/auth/register/
GET  /api/accounts/me/
```

Authentication implementation must be derived from the actual backend/OpenAPI contract.

### Forbidden

Do not assume:

```text
cookie authentication
refresh tokens
JWT
localStorage tokens
session cookies
```

unless the backend contract actually confirms the mechanism.

Do not leave comments such as:

```text
Assuming backend clears cookie...
```

inside production authentication code.

Replace assumptions with verified implementation.

---

# 11. Academy Context Correction

The frontend must support:

```text
one global user
        ↓
multiple academy memberships
        ↓
one selected academy
        ↓
role within selected academy
```

The implementation must not automatically treat:

```text
memberships[0]
```

as the selected academy merely because it exists first.

The selected academy must have an explicit, deterministic rule.

The frontend must also verify that the selected academy belongs to the authenticated user's memberships.

The frontend must never treat browser state as authorization.

Backend authorization remains authoritative.

---

# 12. Role Normalization

Do not invent a second role system.

First inspect the backend/OpenAPI schema and identify the exact role values.

Then create one canonical frontend mapping based on those backend values.

The UI may display friendly labels such as:

```text
Owner
Admin
Lead Teacher
Teacher
Parent/Guardian
Student
```

but the internal values must remain tied to the backend contract.

Do not independently create:

```text
lead
sub
staff
teacher
parent
```

unless those values are confirmed by the backend.

---

# 13. Navigation Rule

Navigation must be centralized.

Canonical location:

```text
src/lib/navigation/config.ts
```

Use backend-supported role information.

Example:

```ts
type NavItem = {
  label: string
  href: string
  roles: BackendRole[]
}
```

Navigation visibility is UX only.

It is never authorization.

Do not create navigation permission constants that do not exist in the backend.

---

# 14. TanStack Query Rule

TanStack Query owns remote/server state.

Use:

```text
query
mutation
cache
invalidation
```

for server data.

React local state owns:

```text
dialogs
menus
tabs
temporary input state
visual toggles
```

Do not add Redux for ordinary API/server state.

Query keys involving academy data must become tenant-aware.

Example pattern:

```text
['academy', academyId, 'students']
```

Do not allow data from one academy to remain visible after switching to another academy.

---

# 15. The Current `features/core` Folder

The repository currently contains:

```text
src/features/core/
```

with a test-only placeholder structure.

This is not an appropriate product domain.

Do one of the following:

### Preferred

Delete it after relocating any useful test/utility to the correct location.

### Alternative

Convert it into a real cross-feature infrastructure module only if there is a demonstrated architectural need.

Do not keep it simply because "core" sounds architectural.

---

# 16. Tests Must Follow Ownership

Use:

```text
src/features/<domain>/__tests__/
```

for feature/domain tests where appropriate.

Use:

```text
src/components/ui/__tests__/
```

for component primitive tests when useful.

Keep browser E2E tests in:

```text
e2e/
```

Do not create random test directories throughout the repository.

---

# 17. Root-Level File Rule

Keep only true repository-level files at the root.

Expected examples:

```text
AGENTS.md
CLAUDE.md
README.md
decisions.md
learnings.md
progress.md
package.json
pnpm-lock.yaml
pnpm-workspace.yaml
next.config.ts
eslint.config.mjs
playwright.config.ts
postcss.config.mjs
tsconfig.json
```

Do not put feature specifications, random implementation notes, or temporary debugging files at the root.

---

# 18. `public/`

Keep only actual static assets required by the application.

Remove unused starter assets left by the default Next.js template.

Do not keep:

```text
next.svg
vercel.svg
globe.svg
window.svg
file.svg
```

unless the application actually uses them.

---

# 19. `README.md`

The current README is insufficient.

Replace it with a concise repository guide containing:

```text
What Quran Academy Frontend is
Tech stack
Repository structure
How to install
How to run
How to test
How to generate API types
Current phase
Source-of-truth hierarchy
Environment variables
Contribution rules
```

Do not repeat the complete product specification inside README.

---

# 20. `CLAUDE.md`

`CLAUDE.md` must become a concise engineering instruction file.

It should reference:

```text
spec/FRONTEND_MASTER_SSoT.md
spec/CURRENT_PHASE.md
openapi/schema.yml
progress.md
decisions.md
learnings.md
```

It must state:

```text
Inspect before changing.
Use the OpenAPI/backend contract as API authority.
Use the Frontend Master SSoT as UX/architecture authority.
Do not invent API fields.
Do not invent permissions.
Do not invent authentication behavior.
Do not create duplicate API clients.
Do not create duplicate UI primitives.
Do not introduce Redux for ordinary server state.
Do not weaken tests.
```

It must not contain a second product roadmap.

---

# 21. `progress.md`

`progress.md` must be rewritten.

The current state:

```text
Phase 1 — Product, UX & Frontend Foundation
Status: NOT STARTED
```

is no longer acceptable.

The new tracker must distinguish:

```text
NOT STARTED
IN PROGRESS
BLOCKED
COMPLETE
```

Every completed claim must have evidence.

Example:

```text
- [x] Next.js scaffold
- [x] TypeScript/lint
- [x] OpenAPI schema present
- [x] API client boundary
- [x] Shared UI primitives
- [x] App route boundary
- [ ] Authentication contract corrected
- [ ] Academy selection corrected
- [ ] Role model verified against backend
- [ ] Repository structure canonicalized
- [ ] Foundation verification gate passed
```

Never place a completion note below a checklist that still says the phase is NOT STARTED.

---

# 22. `decisions.md`

Only architectural decisions belong here.

Examples:

```text
ADR-001 — Next.js App Router
ADR-002 — TanStack Query for server state
ADR-003 — OpenAPI-generated frontend types
ADR-004 — Multi-academy tenant context
ADR-005 — No Redux by default
```

Do not store temporary debugging notes here.

---

# 23. `learnings.md`

Use this for evidence from implementation and debugging.

Examples:

```text
Finding
Cause
Correction
Verification
```

Do not use `learnings.md` as another roadmap.

---

# 24. Repository Cleanup Procedure

Perform cleanup in this order.

## Step 1 — Inspect

Inspect:

```bash
find . -maxdepth 4 -type f | sort
find src -maxdepth 6 -type f | sort
```

Then search:

```bash
grep -R "fetch(" src || true
grep -R "axios" src package.json || true
grep -R "localStorage" src || true
grep -R "sessionStorage" src || true
grep -R "token" src || true
grep -R "role" src || true
grep -R "academy" src || true
grep -R "API" src || true
```

Do not create files before understanding the current implementation.

---

## Step 2 — Canonicalize documentation

Create:

```text
spec/FRONTEND_MASTER_SSoT.md
spec/CURRENT_PHASE.md
spec/verification/PHASE_13_0_FOUNDATION_GATE.md
```

Migrate valid content.

Archive/remove conflicting documents.

---

## Step 3 — Canonicalize the source tree

Move code according to responsibility.

Preferred end state:

```text
app
components
features
lib
```

with clear boundaries.

---

## Step 4 — Fix authentication

Verify the backend contract.

Fix:

```text
logout endpoint
authentication mechanism
credentials handling
401/403 handling
```

Remove assumptions.

---

## Step 5 — Fix academy context

Verify:

```text
membership schema
selected academy
role resolution
invalid academy handling
tenant-aware query keys
```

Do not default blindly to the first membership.

---

## Step 6 — Normalize roles

Read the backend/OpenAPI values.

Create one typed frontend role model.

Remove duplicate role concepts that cannot be justified by the backend.

---

## Step 7 — Normalize navigation

Update:

```text
src/lib/navigation/config.ts
```

so it uses the canonical backend roles.

Do not make the navigation file an authorization system.

---

## Step 8 — Remove starter/placeholder clutter

Remove unused:

```text
Next starter SVG assets
placeholder feature/core code
duplicate phase documents
unused temporary modules
```

Do not remove files merely because they look small. Verify their imports first.

---

## Step 9 — Update tests

Tests must follow the final structure.

Add tests for:

```text
auth contract behavior
academy selection
role mapping
navigation filtering
tenant-aware query keys
UI primitives
```

Do not weaken existing tests.

---

## Step 10 — Run verification

Required:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
```

Then, when Playwright is correctly configured:

```bash
pnpm test:e2e
```

Finally:

```bash
git status --short
```

No unexpected files may remain.

---

# 25. Completion Gate

This synchronization task is complete only when:

## Documentation

- [ ] One frontend master SSoT exists.
- [ ] One current phase document exists.
- [ ] One foundation verification document exists.
- [ ] Old competing phase/product documents are archived or removed.
- [ ] `progress.md` reflects reality.
- [ ] `CLAUDE.md` is not a competing roadmap.

## Repository structure

- [ ] Routes live under `src/app`.
- [ ] UI primitives live under `src/components/ui`.
- [ ] Shell components live under `src/components/layout`.
- [ ] Shared components live under `src/components/shared`.
- [ ] Product domains live under `src/features`.
- [ ] Infrastructure lives under `src/lib`.
- [ ] API remains centralized under `src/lib/api`.
- [ ] Placeholder `features/core` is removed unless justified.
- [ ] Starter assets are removed when unused.

## API

- [ ] OpenAPI is the source of API types.
- [ ] Only one API client exists.
- [ ] No duplicated serializer interfaces.
- [ ] No scattered raw fetch logic in presentation components.
- [ ] Authentication matches the backend contract.

## Multi-tenancy

- [ ] Multiple academy memberships are supported.
- [ ] Selected academy is explicit and validated.
- [ ] Role comes from the selected academy membership/backend contract.
- [ ] Tenant-aware query keys are used where required.
- [ ] Switching academy clears/invalidate stale tenant data.

## Quality

- [ ] Lint passes.
- [ ] Unit/component tests pass.
- [ ] Production build passes.
- [ ] E2E passes when configured.
- [ ] CI passes.
- [ ] No tokens/secrets committed.
- [ ] No invented API behavior remains.

---

# 26. Stop Condition

After this document is applied, **do not start another product phase simply because files exist**.

The next phase may begin only after:

```text
DOCUMENTATION
        ↓
REPOSITORY STRUCTURE
        ↓
API CONTRACT
        ↓
AUTH
        ↓
ACADEMY CONTEXT
        ↓
ROLE MODEL
        ↓
TESTS
        ↓
BUILD / CI
        ↓
FOUNDATION GATE
```

all agree.

The principle is:

> **One contract. One SSoT. One repository structure. One current phase. No silent assumptions.**

