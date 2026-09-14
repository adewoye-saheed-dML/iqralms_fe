# QURAN ACADEMY — FRONTEND PHASE 13.3
## Academy Context & Tenant Routing

**Repository:** `adewoye-saheed-dML/quran_fe`  
**Branch:** `main`  
**Phase:** SaaS Phase 13.3  
**Phase name:** Academy Context  
**Status:** READY TO START  
**Predecessor:** Phase 13.2 — Authentication  
**Authority:** `spec/FRONTEND_MASTER_SSoT.md` + `openapi/schema.yml`

---

# 1. Purpose

Phase 13.3 builds the authenticated academy/tenant context layer on top of the verified authentication system.

The goal is to make the frontend explicitly understand:

- which academy the authenticated user is operating in
- which memberships the user has
- which organization/academy is currently selected
- which role the user has inside the selected academy
- how academy context is loaded
- how academy context changes
- how cached tenant-scoped data is invalidated
- how protected academy routes are resolved

This phase creates the multi-tenant frontend context required by later feature phases.

This phase does **not** implement the full academy product.

---

# 2. Authority

Use this order:

1. Backend/OpenAPI contract — organization, membership, and role facts.
2. `spec/FRONTEND_MASTER_SSoT.md` — UX, architecture, and route intent.
3. This phase document — Phase 13.3 implementation instructions.
4. Existing implementation — evidence to preserve where compatible.

Do not invent organization endpoints, membership fields, or role values.

If a required academy-context behavior is not defined by the backend contract, mark it `OPEN`.

---

# 3. Entry Gate

The repository currently records:

```text
Phase 13.0 — Frontend Foundation — COMPLETE
Phase 13.1 — Design System — COMPLETE
Phase 13.2 — Authentication — COMPLETE
Phase 13.3 — Academy Context — NOT STARTED
```

Authentication remediation has established the token/session flow required before academy context is resolved.

The frontend already contains:

```text
src/lib/academy/
src/app/app/
src/lib/auth/
src/lib/api/
```

and the repository has an existing academy provider foundation.

---

# 4. Phase Objective

Establish one canonical academy context:

```text
authenticated user
        ↓
load accessible academies
        ↓
select active academy
        ↓
resolve active membership
        ↓
resolve role in that academy
        ↓
provide academy context
        ↓
render tenant-scoped application
```

The active academy must be explicit.

The application must never silently guess a tenant from unrelated user data.

---

# 5. Tenant Model

Treat academy/organization context as tenant context.

The frontend must distinguish:

```text
User identity
    ≠
Academy membership
    ≠
Active academy context
    ≠
Role inside active academy
```

A user may potentially belong to more than one academy.

Therefore:

```text
user
→ memberships
→ selected academy
→ selected membership
→ selected role
```

must remain separate concepts.

---

# 6. Backend Contract Audit

Before implementing academy selection, inspect:

```text
openapi/schema.yml
```

Identify the exact organization/academy endpoints and schemas relevant to:

```text
current user's organizations
organization list
organization membership
organization role
organization detail
```

Search the schema for terms including:

```text
organization
membership
organizations
role
memberships
academy
```

Use the actual backend contract.

Do not assume an endpoint exists merely because the frontend needs it.

If the backend exposes academy access through memberships rather than a direct organization list, use that contract.

---

# 7. Existing Academy Provider

Inspect:

```text
src/lib/academy/academy-provider.tsx
```

before changing it.

Determine whether it already provides:

```text
active academy
academy list
membership
role
loading
error
switch academy
refresh
```

Preserve compatible functionality.

Do not create a second academy context provider if the existing provider can become canonical.

There must be one authoritative active-academy context.

---

# 8. Academy Context State

The academy context should expose, at minimum:

```text
academies
activeAcademy
activeMembership
activeRole
isLoading
error
setActiveAcademy
refreshAcademies
```

Additional state is permitted only when justified by implementation needs.

Prefer server-backed state through TanStack Query rather than duplicating server data in uncontrolled local state.

---

# 9. Active Academy Persistence

The selected academy must survive normal navigation.

Use the least complicated persistence mechanism that matches the application architecture.

A reasonable initial strategy is:

```text
authenticated session
+
selected organization identifier
+
academy provider
```

The selected academy must be validated against the academies the authenticated user actually belongs to.

Never trust an arbitrary organization ID supplied from the URL or local storage without membership validation.

---

# 10. Initial Academy Resolution

When an authenticated user enters the application:

1. load accessible academies/memberships.
2. determine whether a valid stored academy exists.
3. verify that the stored academy remains accessible.
4. restore it when valid.
5. otherwise select according to the product-defined rule.
6. if there is no valid academy, render the appropriate empty/onboarding state rather than inventing tenant access.

Do not silently select an academy the user is not an active member of.

---

# 11. Multiple-Academy Users

A user with multiple accessible academies must be able to switch context.

The UI must clearly communicate:

```text
current academy
available academies
switch action
```

The switch must not require a page reload unless the architecture genuinely requires one.

After switching:

```text
new academy selected
        ↓
active context updated
        ↓
tenant-scoped queries invalidated
        ↓
tenant-scoped queries refetch
        ↓
new academy content renders
```

---

# 12. Single-Academy Users

If the user belongs to exactly one academy:

- resolve it automatically
- avoid forcing an unnecessary selection screen
- keep the active academy available to the application context
- still maintain the same canonical context model used for multi-academy users

Do not create a separate architecture for single-academy users.

---

# 13. No-Academy Users

If an authenticated user has no active academy membership:

- do not fabricate an academy
- do not enter the tenant-scoped application
- render a clear empty/onboarding state appropriate to the backend contract
- avoid leaking details about academies the user cannot access

The exact onboarding behavior must follow the product specification and backend contract.

---

# 14. Role Resolution

Role must be resolved from the selected academy membership.

Do not assume:

```text
User.role
```

is always equivalent to:

```text
activeMembership.role
```

where the organization model defines membership-scoped roles.

The application must use the role associated with the active academy context for tenant-scoped authorization decisions.

Possible role values must come from the backend contract.

Do not invent additional role strings.

---

# 15. Route Architecture

Keep the authenticated boundary:

```text
src/app/app/
```

Academy context should be available before tenant-scoped pages render.

The route architecture should support:

```text
/app
    ↓
active academy resolved
    ↓
tenant-scoped application
```

A missing or invalid academy context must not produce a partially rendered tenant UI.

---

# 16. Academy Switcher UI

Use the Phase 13.1 design system.

The academy switcher should:

- show the active academy
- show available academies
- provide accessible keyboard interaction
- clearly indicate the selected academy
- prevent duplicate selection requests
- show loading during context change when required
- handle failure safely

Do not build a visually heavy administration widget.

The switcher is application context infrastructure.

---

# 17. Context Invalidation

This is one of the most important Phase 13.3 requirements.

When the active academy changes, invalidate tenant-scoped data.

The implementation must prevent data belonging to Academy A from remaining visible after switching to Academy B.

At minimum, tenant-scoped query keys should include the academy identifier, for example:

```text
['academy', academyId, ...]
```

or another consistent equivalent.

Do not rely only on:

```text
queryClient.invalidateQueries()
```

if that causes unnecessary global refetches and does not clearly isolate tenant data.

Prefer query-key design that makes tenant boundaries explicit.

---

# 18. Tenant Cache Safety

The implementation must guarantee:

```text
Academy A data
    ↓
switch to Academy B
    ↓
Academy A tenant queries are no longer presented as Academy B
```

Where appropriate:

- invalidate
- remove
- refetch
- reset

tenant-scoped query state.

Do not display stale Academy A information under an Academy B header or route.

---

# 19. URL and Deep-Link Handling

If the application uses organization identifiers in routes or query parameters:

- validate the identifier against accessible academies
- never assume URL context implies membership
- reject or redirect invalid tenant contexts safely
- prevent open redirects

The active academy context must remain consistent with the authenticated user's actual memberships.

---

# 20. Academy Context Provider

Keep the provider at:

```text
src/lib/academy/
```

The provider should become the canonical consumer-facing API for:

```text
useAcademy()
```

or the repository's equivalent.

Do not make individual product pages independently fetch and infer the active academy.

Feature pages should consume context rather than recreate tenant resolution.

---

# 21. API Boundary

Academy context API calls must go through:

```text
src/lib/api/client.ts
```

Do not add direct authenticated fetch calls into:

```text
page.tsx
components
```

The API client remains responsible for authentication transport.

The academy layer remains responsible for academy context.

---

# 22. Loading / Error / Empty States

Use Phase 13.1 primitives.

Required states:

```text
loading academies
academy list empty
academy load failure
switching academy
invalid active academy
```

Do not show raw API response objects.

Do not expose hidden tenant existence.

---

# 23. Accessibility

The academy switcher and context UI must support:

- keyboard navigation
- visible focus
- accessible labels
- clear selected state
- screen-reader-friendly names
- usable loading state
- sufficient contrast

Do not rely only on color to indicate the active academy.

---

# 24. Responsive Behavior

Academy context must work on:

```text
desktop
tablet
mobile
```

The switcher may adapt its placement:

```text
desktop → topbar/sidebar context
mobile → compact header/menu/context control
```

Keep one logical implementation.

---

# 25. Testing Requirements

Add/update tests for:

## Academy loading

- [ ] accessible academies load
- [ ] loading state
- [ ] failure state
- [ ] empty state

## Selection

- [ ] single-academy auto-selection
- [ ] multiple-academy selection
- [ ] persisted selection restored
- [ ] invalid persisted selection rejected

## Role

- [ ] active membership role resolved correctly
- [ ] role changes with active academy

## Switching

- [ ] academy A → academy B
- [ ] active context updates
- [ ] tenant query cache is invalidated/reset correctly
- [ ] stale Academy A data is not rendered for Academy B

## Routing

- [ ] authenticated user with valid academy enters tenant app
- [ ] authenticated user without academy receives correct empty/onboarding state
- [ ] inaccessible academy URL is rejected safely

---

# 26. End-to-End Verification

Where Playwright is configured, cover at least:

```text
login
  ↓
academy resolution
  ↓
academy displayed
```

and:

```text
user with Academy A + Academy B
  ↓
select Academy A
  ↓
tenant content appears
  ↓
switch to Academy B
  ↓
Academy A tenant content disappears
  ↓
Academy B tenant content appears
```

The E2E test should verify the tenant context, not merely that a button changed.

---

# 27. Verification Commands

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

Finally:

```bash
git status --short
```

No secrets, debugging artifacts, or unrelated feature work may remain.

---

# 28. Phase Task Checklist

## 13.3-A — Backend contract

- [ ] Inspect organization/academy endpoints.
- [ ] Inspect membership schemas.
- [ ] Inspect organization role values.
- [ ] Identify the authoritative academy access endpoint.
- [ ] Record unresolved contract questions as `OPEN`.

## 13.3-B — Academy provider

- [ ] Audit existing `src/lib/academy/academy-provider.tsx`.
- [ ] Make it the canonical active-academy provider.
- [ ] Expose academy list.
- [ ] Expose active academy.
- [ ] Expose active membership.
- [ ] Expose active role.
- [ ] Expose loading/error state.
- [ ] Expose switch/refresh operations.

## 13.3-C — Initial context resolution

- [ ] Load accessible academies.
- [ ] Restore valid previous selection.
- [ ] Reject inaccessible stored selection.
- [ ] Auto-select single academy.
- [ ] Handle multiple academies.
- [ ] Handle no academies.

## 13.3-D — Academy switcher

- [ ] Build using existing design system.
- [ ] Show active academy.
- [ ] Show available academies.
- [ ] Keyboard accessible.
- [ ] Responsive.
- [ ] Loading/switching state.
- [ ] Safe error handling.

## 13.3-E — Role context

- [ ] Resolve role from active membership.
- [ ] Update role on academy switch.
- [ ] Do not infer tenant role from global identity when membership-scoped role exists.

## 13.3-F — Cache safety

- [ ] Introduce consistent tenant-aware query keys.
- [ ] Invalidate/remove tenant-scoped data on switch.
- [ ] Prevent stale cross-academy data.
- [ ] Verify switching with tests.

## 13.3-G — Routing

- [ ] Integrate academy context with `/app`.
- [ ] Block tenant UI until valid context exists.
- [ ] Handle invalid academy routes.
- [ ] Handle users with no academy.

## 13.3-H — Verification

- [ ] Unit/component tests pass.
- [ ] Tenant switching tests pass.
- [ ] Lint passes.
- [ ] Build passes.
- [ ] E2E passes where configured.
- [ ] No cross-tenant stale data observed.

---

# 29. Definition of Ready

Phase 13.3 is ready because:

1. Frontend foundation is complete.
2. Design system is complete.
3. Authentication is complete.
4. Authentication remediation established usable token-based requests.
5. The repository identifies Phase 13.3 as the active next phase.
6. Academy provider infrastructure already exists.

---

# 30. Definition of Done

Phase 13.3 is complete only when:

1. Accessible academies are loaded from the backend contract.
2. A canonical active academy exists.
3. Membership context is resolved.
4. Active academy role is resolved.
5. Single-academy users are handled automatically.
6. Multiple-academy users can switch safely.
7. No-academy users receive a safe empty/onboarding state.
8. Academy selection persists appropriately.
9. Invalid selections are rejected.
10. Tenant-aware query keys/context prevent stale cross-academy data.
11. Switching academies invalidates or resets tenant-scoped data correctly.
12. Protected application routes respect academy context.
13. Tests pass.
14. Lint passes.
15. Production build passes.
16. E2E context-switching tests pass where configured.
17. No unrelated product features are implemented.

---

# 31. Required Documentation Updates

When Phase 13.3 is complete:

Update:

```text
spec/CURRENT_PHASE.md
```

to the next approved phase.

Update:

```text
progress.md
```

so Phase 13.3 is marked:

```text
COMPLETE
```

and the next phase is:

```text
NOT STARTED
```

Add:

```text
spec/verification/phase-13-3-academy-context.md
```

using the repository's existing verification-document pattern.

The verification document must include actual commands run and actual results.

Do not claim tests/build/lint passed without running them.

---

# 32. Explicit Non-Goals

Do not implement in Phase 13.3:

- student management
- teacher management
- classroom workflows
- scheduling
- assessment workflows
- finance
- payouts
- notification center
- audit workflows
- academy administration CRUD
- organization membership administration

Phase 13.3 establishes the tenant context used by those later phases.

---

# 33. Transition to Next Phase

After successful completion:

```text
SaaS Phase 13.4
```

should consume the verified active-academy and role context.

Do not define Phase 13.4 product behavior inside this document unless the project roadmap explicitly establishes it.

---

# 34. Governing Principle

> **The frontend must always know which academy it is operating in before it renders tenant-scoped data.**

A user's global identity is not enough.

The safe chain is:

```text
authenticated user
→ accessible memberships
→ selected academy
→ selected membership
→ selected role
→ tenant-scoped queries
→ tenant-scoped UI
```

Never allow Academy A data to masquerade as Academy B data.
