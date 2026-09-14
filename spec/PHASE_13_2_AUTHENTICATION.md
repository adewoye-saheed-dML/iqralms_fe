# QURAN ACADEMY — FRONTEND PHASE 13.2
## Authentication Implementation

**Repository:** `adewoye-saheed-dML/quran_fe`  
**Branch:** `main`  
**Phase:** SaaS Phase 13.2  
**Phase name:** Authentication  
**Status:** READY TO START  
**Predecessor:** Phase 13.1 — Design System  
**Authority:** `spec/FRONTEND_MASTER_SSoT.md` + `openapi/schema.yml`

---

# 1. Purpose

Implement the real frontend authentication workflow on top of the completed foundation and design system.

This phase owns:

- login
- registration
- session bootstrap
- logout
- protected route enforcement
- authentication error handling
- authenticated API request behavior
- authentication loading states
- safe redirect behavior

This phase does **not** implement academy selection as a complete product workflow, dashboards as feature workflows, scheduling, assessments, finance, imports, notifications, or audit workflows.

---

# 2. Authority

Use this order:

1. Backend/OpenAPI contract — API facts and authentication endpoints.
2. `spec/FRONTEND_MASTER_SSoT.md` — frontend UX and architecture.
3. This phase document — Phase 13.2 execution rules.
4. Existing implementation — evidence to preserve where compatible.

Do not invent endpoint contracts that are not present in `openapi/schema.yml`. Mark undefined decisions `OPEN`.

---

# 3. Entry Gate

The repository currently records:

- Phase 13.0 — Frontend Foundation — COMPLETE.
- Phase 13.1 — Design System — COMPLETE.
- Phase 13.2 — Authentication — NOT STARTED.

`spec/CURRENT_PHASE.md` already identifies Phase 13.2 Authentication as the active phase.

Existing authentication infrastructure includes:

```text
src/app/(auth)/login/page.tsx
src/lib/auth/auth-provider.tsx
src/lib/api/client.ts
```

The login page is still a mock/foundation implementation and is therefore the primary remaining authentication work.

---

# 4. Current Repository Assessment

Current evidence:

- `src/app/(auth)/login/page.tsx` uses the Phase 13.1 UI primitives but still performs a mock sign-in.
- `src/lib/auth/auth-provider.tsx` loads the current user through `/api/accounts/me/`, treats 401/403 as unauthenticated, and exposes logout through `/api/accounts/logout/`.
- `src/lib/api/client.ts` includes credentials with requests but still contains a placeholder for the final authentication strategy.

Therefore Phase 13.2 must convert the existing foundation into a verified, real authentication workflow without bypassing the backend contract.

---

# 5. Phase Objective

The target flow is:

```text
open application
    ↓
restore session
    ↓
authenticated? ── yes ──→ protected application
    │
    no
    ↓
login / register
    ↓
successful authentication
    ↓
refresh current-user state
    ↓
protected application
```

The system must correctly handle:

- authenticated users
- unauthenticated users
- invalid credentials
- invalid/expired sessions
- network errors
- duplicate submissions
- logout
- protected-route access

---

# 6. Backend Contract Audit

Before implementing mutations, inspect:

```text
openapi/schema.yml
```

Confirm the exact schemas/endpoints for:

```text
login
registration
logout
current-user/session
password-related flows
```

Confirm whether authentication uses:

```text
cookie/session
bearer token
CSRF-protected cookie/session
other backend-defined mechanism
```

Use the exact backend request/response shapes. Do not rely on old comments or guessed endpoint names.

---

# 7. API Client Authentication

Keep authentication behavior centralized in:

```text
src/lib/api/client.ts
```

Required behavior:

- credentials handling according to the backend contract
- auth headers when required
- normalized authentication failures
- predictable API errors
- no duplicated auth plumbing in route components
- no direct ad-hoc authenticated `fetch()` calls in auth pages

Do not introduce an insecure token-storage strategy merely for convenience.

---

# 8. Authentication Context

Keep the auth context boundary in:

```text
src/lib/auth/auth-provider.tsx
```

It should expose at least:

```text
user
isLoading
isAuthenticated
error
logout
```

Use TanStack Query for server-backed current-user state.

Do not duplicate session state across unrelated contexts.

---

# 9. Session Bootstrap

On application startup:

1. restore/inspect the backend session when required.
2. request the current-user endpoint.
3. represent 401/403 as unauthenticated where the backend contract supports that interpretation.
4. distinguish transient/server failures from unauthenticated state.
5. prevent protected routes from rendering incorrect content while auth state is unresolved.

Do not treat every API failure as “logged out.”

---

# 10. Login

Complete:

```text
src/app/(auth)/login/page.tsx
```

The login form must provide:

```text
identifier
password
submit
loading state
field-level errors where supported
general auth error
```

Submit behavior:

1. validate required fields.
2. prevent duplicate submission.
3. call the confirmed backend login endpoint.
4. handle backend validation/authentication errors.
5. refresh current-user state after successful authentication.
6. redirect only after authentication actually succeeds.

Do not navigate to `/app/dashboard` simply because the button was clicked.

---

# 11. Registration

Implement registration strictly from `openapi/schema.yml`.

Requirements:

- use Phase 13.1 form primitives
- required fields are clear
- duplicate submission is blocked
- field-level validation is shown where available
- safe general failure message
- contract-defined post-registration behavior

Do not invent registration requirements or flows.

---

# 12. Protected Route Enforcement

The authenticated application is under:

```text
src/app/app/
```

Use one clear route/layout-level protection strategy rather than scattered checks in every page.

Required behavior:

```text
authenticated user
    → protected route

unauthenticated user
    → authentication entry route

auth still loading
    → stable loading state

unexpected auth failure
    → safe error/recovery state
```

Do not create redirect loops or leak protected resource details.

---

# 13. Redirect Rules

Canonical behavior:

```text
unauthenticated → /login
authenticated + visits /login → protected application entry
successful login → intended safe protected destination when applicable
```

Any return URL must be validated to prevent open redirects.

Never blindly redirect to an arbitrary query-string URL.

---

# 14. Logout

Logout must:

1. call the backend logout endpoint when required.
2. clear/invalidate current-user state.
3. invalidate relevant authenticated cache data.
4. prevent stale authenticated UI.
5. return the user to the authentication entry route.

Logout should remain safe if the server session is already invalid.

---

# 15. Error Model

Authentication errors must be understandable without exposing implementation details.

Distinguish where supported:

```text
invalid credentials
validation failure
session expired
network failure
server failure
```

Do not expose stack traces, tokens, secrets, internal URLs, database details, or hidden tenant/resource information.

Use the Phase 13.1 alert/error patterns.

---

# 16. Loading and Form States

Login and registration must support:

```text
initial session loading
form idle
form submitting
success transition
validation failure
authentication failure
network failure
```

Submitting a form must not allow multiple identical requests.

Use the established loading primitives rather than ad-hoc page text when suitable.

---

# 17. Validation

Use the validation approach supported by the repository and backend contract.

Rules:

- client validation may handle obvious required-field constraints.
- backend validation remains authoritative.
- server validation should map to fields where possible.
- unknown validation should map to a safe general error.

Do not create contradictory client-only business rules.

---

# 18. Password and Credential Handling

Password fields must:

- use correct password semantics
- never be logged
- never be sent in URLs
- never be persisted insecurely
- clear sensitive form state after successful authentication where appropriate

A show/hide-password control is optional if it is accessible and fits the design system.

---

# 19. Security Boundaries

Do not introduce:

- credentials in URLs
- plaintext credential logging
- client-side secret exposure
- insecure token persistence
- arbitrary redirects
- duplicated authentication logic in feature pages

All security decisions must follow the backend contract and deployment architecture.

---

# 20. Route/File Boundaries

Keep the existing structure unless evidence requires a change:

```text
src/app/(auth)/
src/app/app/
src/lib/auth/
src/lib/api/
src/components/ui/
```

Do not move files just for cosmetic symmetry.

---

# 21. Design System Compliance

Authentication UI must consume Phase 13.1 primitives, including:

```text
Button
Input
Label
Card
Alert
Loading
Error
```

Do not create authentication-specific replacements for generic shared primitives unless a genuinely reusable primitive is missing.

---

# 22. Accessibility

Authentication must support:

- keyboard navigation
- visible focus
- associated labels
- correct input types
- accessible error messaging
- usable submit states
- screen-reader-compatible form feedback
- accessible loading feedback
- accessible password visibility controls if implemented

The forms must remain understandable without visual-only cues.

---

# 23. Responsive Behavior

Authentication must work on:

```text
mobile
tablet
desktop
```

Use one responsive implementation. Do not create separate mobile/desktop auth apps.

---

# 24. Testing

Add or update tests for:

```text
login rendering
login validation
successful login
invalid credentials
registration rendering
registration validation
successful registration
auth bootstrap
logout
protected route behavior
authenticated redirect
unauthenticated redirect
loading states
error states
duplicate submission prevention
```

Use the existing Vitest/Testing Library stack.

Where Playwright is configured, cover:

```text
unauthenticated → login → authenticated
unauthenticated → protected route → login
invalid login → error
authenticated → logout → unauthenticated
registration → expected post-registration state
```

Do not make production auth behavior depend on E2E-only shortcuts.

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

Finally:

```bash
git status --short
```

Do not leave secrets, debugging files, generated junk, or unrelated changes.

---

# 26. Phase Task Checklist

## 13.2-A — Contract audit

- [ ] Inspect auth endpoints in `openapi/schema.yml`.
- [ ] Confirm login schema.
- [ ] Confirm registration schema.
- [ ] Confirm logout behavior.
- [ ] Confirm current-user/session behavior.
- [ ] Confirm token vs cookie authentication.
- [ ] Confirm CSRF requirements if applicable.
- [ ] Record unresolved questions as `OPEN`.

## 13.2-B — API authentication

- [ ] Centralize auth behavior in `src/lib/api/client.ts`.
- [ ] Implement the backend-required mechanism.
- [ ] Normalize auth errors.
- [ ] Test authenticated and unauthenticated requests.

## 13.2-C — Auth provider

- [ ] Complete `src/lib/auth/auth-provider.tsx`.
- [ ] Expose `user`.
- [ ] Expose `isLoading`.
- [ ] Expose authenticated state.
- [ ] Expose logout.
- [ ] Handle session bootstrap.
- [ ] Separate unauthenticated from unexpected API errors.

## 13.2-D — Login

- [ ] Replace mock sign-in.
- [ ] Implement real login mutation.
- [ ] Add validation.
- [ ] Add submission state.
- [ ] Add backend error handling.
- [ ] Refresh current-user state after success.
- [ ] Redirect only after successful authentication.

## 13.2-E — Registration

- [ ] Implement contract-defined registration.
- [ ] Add validation.
- [ ] Add submission state.
- [ ] Map backend validation errors.
- [ ] Implement contract-defined post-registration behavior.

## 13.2-F — Route protection

- [ ] Protect `/app`.
- [ ] Enforce protection at the route/layout boundary.
- [ ] Prevent redirect loops.
- [ ] Preserve safe intended destinations where required.
- [ ] Reject unsafe redirect targets.

## 13.2-G — Logout

- [ ] Connect logout to backend.
- [ ] Clear current-user state.
- [ ] Invalidate relevant authenticated cache data.
- [ ] Redirect to authentication entry.
- [ ] Verify stale auth UI does not remain.

## 13.2-H — Testing and verification

- [ ] Unit/component tests pass.
- [ ] Route/auth state tests pass.
- [ ] E2E auth paths pass where configured.
- [ ] Accessibility review passes.
- [ ] Lint passes.
- [ ] Production build passes.
- [ ] No mock authentication remains.
- [ ] No secrets or unrelated changes are committed.

---

# 27. Definition of Ready

Phase 13.2 is ready because:

1. Phase 13.0 is recorded complete.
2. Phase 13.1 is recorded complete.
3. `spec/CURRENT_PHASE.md` identifies Phase 13.2.
4. The design-system primitives are available.
5. Authentication foundation files already exist.
6. The remaining work is implementation rather than restructuring.

The first implementation action is the OpenAPI authentication contract audit.

---

# 28. Definition of Done

Phase 13.2 is complete only when:

1. Login uses the real backend authentication workflow.
2. Registration uses the real backend registration workflow where defined.
3. Session bootstrap is reliable.
4. Authentication state is centralized.
5. Protected routes block unauthenticated access.
6. Authenticated users do not loop back to login.
7. Logout clears authenticated state correctly.
8. API authentication behavior is centralized and contract-aligned.
9. Authentication errors are safe and understandable.
10. Forms use the Phase 13.1 design system.
11. Unit/component tests pass.
12. E2E authentication tests pass where configured.
13. Lint passes.
14. Production build passes.
15. No mock authentication remains.
16. No unrelated product features are implemented in this phase.

---

# 29. Required Documentation Updates

When Phase 13.2 is complete:

Update:

```text
spec/CURRENT_PHASE.md
```

to:

```text
Current phase: SaaS Phase 13.3
Phase name: Academy Context
Status: NOT STARTED
```

Update:

```text
progress.md
```

so Phase 13.2 is `COMPLETE` and Phase 13.3 is `NOT STARTED`.

Add a Phase 13.2 verification record under:

```text
spec/verification/
```

following the repository's existing verification pattern.

---

# 30. Explicit Non-Goals

Do not implement in 13.2:

- academy switcher as a full feature
- tenant-aware dashboard behavior
- role-specific workflows
- student/teacher management
- classroom management
- scheduling
- assessments
- finance
- imports
- notification center
- audit center

---

# 31. Transition to Phase 13.3

After authentication is complete and verified:

```text
SaaS Phase 13.3 — Academy Context
```

will build authenticated academy/tenant selection and context behavior on top of the verified session.

---

# 32. Governing Principle

> **Authentication must be real, centralized, contract-aligned, secure, testable, and invisible as infrastructure to later product features.**
