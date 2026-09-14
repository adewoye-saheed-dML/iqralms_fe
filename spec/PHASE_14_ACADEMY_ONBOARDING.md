# QURAN ACADEMY — FRONTEND PHASE 14
## Academy Onboarding & Initial Setup

**Repository:** `adewoye-saheed-dML/quran_fe`  
**Branch:** `main`  
**Phase:** SaaS Phase 14  
**Phase name:** Academy Onboarding & Initial Setup  
**Status:** READY TO START  
**Predecessor:** Phase 13.3 — Academy Context  
**Authority:** `spec/FRONTEND_MASTER_SSoT.md` + `openapi/schema.yml`

> **Roadmap note:** `spec/CURRENT_PHASE.md` currently marks Phase 14 as “Pending specification”. This document establishes the next implementation scope from the Master SSoT's documented academy onboarding journey. It should not override a later, explicitly approved product roadmap decision.

---

# 1. Purpose

Phase 14 turns the verified academy context into the first meaningful academy setup workflow.

The Master SSoT defines the preferred academy onboarding journey as:

```text
Create academy
→ academy details
→ timezone/contact configuration
→ curriculum choice
→ teachers/staff
→ students/import
→ class configuration
→ notification preferences
→ ready
```

Phase 14 should implement the **academy onboarding foundation and setup journey** without prematurely building the full teacher, student, curriculum, scheduling, notification, or import products.

The objective is to give a newly created or not-yet-configured academy a clear, guided path toward readiness.

---

# 2. Authority

Use this order:

1. `openapi/schema.yml` — backend facts, endpoints, validation, tenancy, authorization.
2. `spec/FRONTEND_MASTER_SSoT.md` — product UX and intended onboarding journey.
3. This phase document — Phase 14 execution scope.
4. Existing implementation — reuse compatible infrastructure.

Do not invent backend workflows that are not represented in the API contract.

Where backend capability is missing, mark the item `OPEN` rather than faking completion in the UI.

---

# 3. Entry Gate

Phase 13.3 is complete.

The repository now has:

```text
authenticated user
        ↓
academy memberships
        ↓
active academy
        ↓
active membership
        ↓
active role
        ↓
tenant-scoped application
```

The active academy context is therefore available to Phase 14.

Do not rebuild authentication or academy selection as part of this phase.

---

# 4. Phase Objective

Create a coherent first-time academy setup experience.

The user should understand:

```text
Where am I?
What academy am I configuring?
What has been completed?
What remains?
What should I do next?
When is this academy ready?
```

The workflow should emphasize progress and next actions rather than decorative dashboard metrics.

---

# 5. Scope Boundary

Phase 14 owns the **orchestration and presentation of academy setup**.

It may consume capabilities from later domains, but it must not silently implement those domains in depth.

Examples:

```text
Allowed:
- onboarding progress
- academy setup shell
- academy details form
- timezone/contact configuration
- setup checklist
- next-step guidance
- lightweight curriculum choice if backend already supports it

Not allowed:
- full curriculum administration
- full teacher management
- full student management
- production scheduling workflows
- full import center
- notification center
- assessment workflows
- finance/payout workflows
```

Later phases should own their complete domain workflows.

---

# 6. Backend Contract Audit

Before implementing UI, inspect `openapi/schema.yml` for the exact endpoints and schemas needed for:

```text
organization/academy creation
organization/academy detail
organization/academy update
organization membership
organization configuration
timezone/contact fields
curriculum selection or setup
```

Confirm:

- request shapes
- response shapes
- required fields
- validation rules
- role restrictions
- organization scoping
- error semantics

Do not infer writable fields from the read model alone.

---

# 7. Eligible Roles

Use backend authorization rules as the authority.

The frontend may present setup actions according to the active membership role, but must not become a second authorization system.

If only certain membership roles may configure the academy:

```text
show setup controls only to those roles
```

but still rely on backend authorization for enforcement.

Do not invent role privileges.

---

# 8. Onboarding State

Establish a clear onboarding state model.

At minimum:

```text
not_started
in_progress
ready
```

If the backend does not expose a formal onboarding status, derive UI progress only from confirmed configuration facts.

Do not persist a frontend-only claim such as:

```text
academy_is_ready = true
```

unless the backend contract supports it.

---

# 9. Setup Checklist

Present a clear checklist based on actual supported setup steps.

Suggested structure:

```text
Academy setup
────────────────────────

✓ Academy details
✓ Timezone & contact
○ Curriculum
○ Teachers / staff
○ Students
○ Class configuration
○ Notification preferences

[Continue setup]
```

Only show steps that are actually supported and actionable.

Unsupported future-domain steps may be shown as pending only when product language makes that clear.

---

# 10. Academy Details

Build the academy details form using Phase 13.1 form primitives.

Potential fields must come from the backend schema.

Requirements:

- accessible labels
- required-field clarity
- validation
- submitting state
- backend error mapping
- success feedback
- safe retry behavior

Do not add fields merely because they seem useful.

---

# 11. Timezone and Contact Configuration

Timezone is important because scheduling later depends on it.

The frontend should:

- read the existing backend value when present
- present a clear timezone selector where supported
- avoid guessing a permanent academy timezone from the browser
- distinguish academy configuration from the user's personal device timezone

Use backend-supported contact fields only.

---

# 12. Curriculum Setup Boundary

The Master SSoT places curriculum choice early in onboarding.

Determine whether the backend currently exposes a supported curriculum setup endpoint.

If yes:

- expose the appropriate selection workflow
- use actual backend options
- save through the API
- show validation/errors

If not:

```text
Do not fake curriculum setup.
```

Record the dependency as `OPEN` and keep the step pending.

---

# 13. Teachers / Staff Boundary

The onboarding flow may communicate that teacher/staff setup is a later step.

Do not build full teacher management here.

Only implement lightweight invitation/setup behavior if the backend contract explicitly supports it and the phase remains within onboarding orchestration.

Full teacher profiles, availability, configurations, and scheduling belong to later phases.

---

# 14. Students / Import Boundary

The onboarding flow may present the student setup step without implementing the complete student domain.

Do not duplicate future student management or bulk import interfaces inside onboarding.

---

# 15. Class Configuration Boundary

Do not implement the full scheduling engine here.

Only implement minimal backend-supported configuration required to make academy setup ready for later scheduling.

Do not recreate booking, availability, or conflict logic.

---

# 16. Notification Preferences Boundary

Do not implement the notification center in Phase 14.

Only add onboarding notification preferences if a narrow backend-supported configuration endpoint already exists.

Otherwise keep the step pending.

---

# 17. Onboarding Layout

Use the existing application shell and design system.

Recommended structure:

```text
PageHeader
Progress / setup summary
Current step content
Primary action
Secondary/back action
Setup checklist
```

The page should answer:

```text
What step am I on?
Why does it matter?
What happens next?
```

---

# 18. Progress Representation

Use a clear progress indicator such as:

```text
Step 2 of 7
```

or:

```text
2 / 7 completed
```

Do not report a step as complete until its underlying backend state confirms completion.

---

# 19. Resume Behavior

A user returning to onboarding should resume from actual backend state.

Do not rely only on local storage for progress.

Backend state remains authoritative.

---

# 20. Completion State

When the supported setup foundation is complete, show a clear ready state.

Example:

```text
Academy ready

Your academy setup foundation is complete.

Next:
Continue to your academy dashboard.
```

Do not claim that the entire product is operationally configured if later domains remain.

---

# 21. Context Safety

All onboarding mutations must operate against:

```text
active academy
```

Never submit an arbitrary organization ID without validating it against the current academy context.

If academy switching is possible while a mutation is in flight, disable or safely handle switching until the mutation completes.

---

# 22. Query and Mutation Architecture

Use:

```text
UI
→ feature hook
→ TanStack Query
→ typed API client
→ backend
```

Keep domain logic out of generic UI components.

Suggested boundary:

```text
src/features/onboarding/
├── api/
├── hooks/
├── components/
├── types/
└── utils/
```

Follow the repository's existing conventions where they differ.

---

# 23. Role-Aware Presentation

Setup actions must reflect active academy context and role.

Do not implement client-only authorization.

A hidden or disabled button is UX behavior; the backend remains the security boundary.

---

# 24. Loading / Empty / Error / Conflict

Support:

```text
initial loading
saving
save success
validation failure
server error
network failure
conflict
forbidden
missing academy context
```

Use the Phase 13.1 shared states and form primitives.

---

# 25. Accessibility

The onboarding workflow must support:

- keyboard navigation
- visible focus
- associated labels
- programmatic validation errors
- accessible progress indication
- clear step headings
- screen-reader-friendly action states
- no color-only completion indicators

---

# 26. Responsive Behavior

Onboarding must work across:

```text
desktop
tablet
mobile
```

On mobile:

- prioritize the current step
- keep the primary action visible
- avoid excessively wide forms
- keep progress understandable
- preserve touch-friendly controls

---

# 27. Testing Requirements

Add tests for:

## State resolution

- [ ] not-started academy
- [ ] partially configured academy
- [ ] completed setup foundation
- [ ] missing academy context

## Forms

- [ ] required validation
- [ ] successful save
- [ ] backend validation error
- [ ] server/network failure
- [ ] duplicate submission prevention

## Progress

- [ ] correct completed-step calculation
- [ ] no premature completion
- [ ] resume behavior

## Tenant safety

- [ ] onboarding reads active academy only
- [ ] mutation uses active academy context
- [ ] academy switching does not leak state

## Role presentation

- [ ] role-aware controls
- [ ] forbidden actions are handled safely

---

# 28. End-to-End Verification

Where Playwright is configured, cover the critical journey:

```text
authenticated user
    ↓
select active academy
    ↓
open onboarding
    ↓
complete academy details
    ↓
save
    ↓
setup progress updates
    ↓
resume later
    ↓
continue remaining setup
```

Where the backend does not support the complete downstream workflow yet, verify that onboarding stops at the supported boundary instead of faking completion.

---

# 29. Verification Commands

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

Also run:

```bash
git status --short
```

Do not leave secrets, debug output, temporary artifacts, or unrelated feature work.

---

# 30. Phase Task Checklist

## 14-A — Contract audit

- [ ] Inspect organization setup endpoints.
- [ ] Inspect academy configuration schemas.
- [ ] Inspect membership/role permissions.
- [ ] Inspect timezone/contact fields.
- [ ] Determine curriculum setup support.
- [ ] Determine whether onboarding state is backend-defined.
- [ ] Record unresolved items as `OPEN`.

## 14-B — Onboarding foundation

- [ ] Create `src/features/onboarding/` if consistent with repository architecture.
- [ ] Establish onboarding state/query layer.
- [ ] Integrate active academy context.
- [ ] Establish progress/checklist presentation.

## 14-C — Academy details

- [ ] Implement contract-defined academy details form.
- [ ] Implement timezone/contact configuration where supported.
- [ ] Add validation and error handling.
- [ ] Add success handling.

## 14-D — Curriculum boundary

- [ ] Implement only backend-supported curriculum setup.
- [ ] Otherwise mark curriculum step pending.

## 14-E — Later-step orchestration

- [ ] Represent teacher/staff setup state appropriately.
- [ ] Represent student/import state appropriately.
- [ ] Represent class configuration state appropriately.
- [ ] Represent notification preference state appropriately.
- [ ] Do not duplicate future feature domains.

## 14-F — Resume/completion

- [ ] Resume from actual backend configuration state.
- [ ] Prevent false completion.
- [ ] Provide clear next-action state.

## 14-G — Testing

- [ ] Component tests.
- [ ] Integration tests.
- [ ] Tenant-safety tests.
- [ ] Role-presentation tests.
- [ ] E2E onboarding path where configured.

## 14-H — Verification

- [ ] Typecheck/lint passes.
- [ ] Tests pass.
- [ ] Build passes.
- [ ] E2E passes where configured.
- [ ] No unrelated changes.

---

# 31. Definition of Ready

Phase 14 is ready because:

1. Foundation is complete.
2. Design system is complete.
3. Authentication is complete and verified.
4. Academy context is complete and verified.
5. The Master SSoT explicitly defines academy onboarding as the preferred first operating journey.
6. Phase 13.3 provides the active academy context required by onboarding.

---

# 32. Definition of Done

Phase 14 is complete only when:

1. Academy onboarding has a coherent progress model.
2. Active academy context is respected throughout.
3. Contract-supported academy details can be configured.
4. Timezone/contact configuration works where supported.
5. Curriculum setup is either implemented from a real backend contract or explicitly deferred.
6. Later setup domains are represented without duplicating future feature implementations.
7. Resume behavior works from actual backend state.
8. Completion messaging is accurate.
9. Role-aware presentation is correct.
10. Tenant safety is verified.
11. Tests pass.
12. Lint/typecheck passes.
13. Production build passes.
14. E2E onboarding path passes where configured.
15. No unrelated domain feature work is mixed into Phase 14.

---

# 33. Required Documentation Updates

When Phase 14 is complete:

Update:

```text
spec/CURRENT_PHASE.md
```

to the next approved phase.

Update:

```text
progress.md
```

to record:

```text
Phase 14 — Academy Onboarding & Initial Setup
Status: COMPLETE
```

and the next phase as:

```text
NOT STARTED
```

Add:

```text
spec/verification/phase-14-academy-onboarding.md
```

with actual commands, actual test results, and actual build results.

Do not claim verification without running the commands.

---

# 34. Explicit Non-Goals

Do not implement as complete product domains in Phase 14:

- full curriculum administration
- teacher management
- teacher availability
- student management
- student bulk import center
- scheduling engine
- assessments
- progress analytics
- pricing
- payouts
- notification center
- audit history

These remain later feature phases.

---

# 35. Governing Principle

> **Onboarding should guide the academy toward readiness without pretending that future product domains are already implemented.**

The safe sequence is:

```text
verified identity
→ verified academy context
→ guided academy setup
→ real backend configuration
→ clear next action
→ later domain workflows
```

Never mark a setup step complete when the underlying backend state has not actually been established.
