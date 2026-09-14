# QURAN ACADEMY — AUTHENTICATION REMEDIATION
## Phase 13.2R — Resolve Token/Session Contract Gap Before Phase 13.3

**Repository:** `adewoye-saheed-dML/quran_fe`  
**Branch:** `main`  
**Related phase:** SaaS Phase 13.2 — Authentication  
**Purpose:** Remediate the authentication contract gap discovered during the Phase 13.2 re-check  
**Next phase remains blocked until this gate passes:** SaaS Phase 13.3 — Academy Context

---

# 1. Why This Remediation Exists

The repository currently marks Phase 13.2 Authentication as complete and has a Phase 13.2 verification record.

However, the live frontend implementation does not fully demonstrate the authentication contract declared by the backend OpenAPI specification.

The backend contract defines:

```text
POST /api/auth/login/
```

as returning a REST Token.

The frontend login implementation currently:

1. posts credentials to `/api/auth/login/`
2. receives the response
3. calls `refreshAuth()`

but the shared API client does not currently persist the returned token or attach an `Authorization` header to subsequent requests.

The frontend must therefore be corrected and verified before Phase 13.3 begins.

---

# 2. Authority

Use this order:

1. `openapi/schema.yml` — authoritative API authentication contract.
2. `spec/FRONTEND_MASTER_SSoT.md` — frontend architecture and UX authority.
3. `spec/PHASE_13_2_AUTHENTICATION.md` — authentication phase rules.
4. This remediation document — the explicit fix and verification gate.
5. Existing implementation — evidence only.

Do not invent a new authentication mechanism.

---

# 3. Confirmed Contract

The OpenAPI specification defines:

```text
POST /api/auth/login/
```

and returns:

```text
Token
```

where the token schema contains:

```text
key: string
```

The OpenAPI specification also declares authenticated API security using:

```text
tokenAuth
cookieAuth
```

The current frontend therefore needs one verified authentication path that works with the actual backend behavior.

---

# 4. Primary Objective

Establish and prove this flow:

```text
Login form
    ↓
POST /api/auth/login/
    ↓
backend returns authentication result
    ↓
frontend establishes authenticated session
    ↓
GET /api/accounts/me/
    ↓
current user is restored
    ↓
protected /app route renders
    ↓
authenticated API requests remain authenticated
```

The implementation must not rely on a mock redirect or an assumed cookie unless the backend explicitly establishes that cookie.

---

# 5. First Task — Verify the Backend Runtime Behavior

Before changing production code, inspect the backend contract and, where the development environment permits, verify the actual response from:

```text
POST /api/auth/login/
```

Determine exactly whether the runtime response is:

### Case A — Token only

```json
{
  "key": "..."
}
```

Then the frontend must establish token-based authentication for all subsequent API requests.

### Case B — Token plus cookie/session

If the backend returns the token but also establishes a valid authentication cookie/session, document and verify that behavior.

### Case C — Cookie/session only in runtime

If runtime behavior differs from the current OpenAPI contract, do not silently code around it.

Record the discrepancy and update the backend contract/source of truth through the proper project process.

---

# 6. Required Frontend Fix

The authentication implementation must support the backend's actual authentication mechanism.

## Preferred path when REST Token is authoritative

The frontend must establish a centralized token strategy.

The implementation must:

```text
login
  ↓
receive token
  ↓
persist according to project security requirements
  ↓
authenticated API client attaches token
  ↓
/api/accounts/me/ succeeds
```

All authenticated API calls must continue through:

```text
src/lib/api/client.ts
```

Do not add token logic independently to login, dashboard, academy, or feature pages.

---

# 7. Token Storage Rules

Choose the safest storage strategy supported by the backend/deployment model.

Do not introduce insecure persistent storage merely because it is convenient.

Do not:

- put tokens in URLs
- log tokens
- print tokens during debugging
- store tokens in source code
- expose tokens in rendered page content
- duplicate tokens across multiple React contexts

If the backend can support an HttpOnly cookie-based session safely, prefer the backend-defined secure cookie/session flow.

If token-based authentication is required directly from the browser, keep the storage strategy explicit and document its tradeoffs.

If project architecture requires a different secure mechanism, mark it as a reviewed decision rather than inventing one silently.

---

# 8. API Client Requirements

Update:

```text
src/lib/api/client.ts
```

so that authenticated requests behave consistently.

The client must:

- know whether an authenticated session exists
- attach the required authentication credential
- preserve `Content-Type` and `Accept`
- keep existing parameter handling
- continue normalizing `ApiError`
- handle unauthenticated responses consistently
- remain generic and domain-neutral

Do not duplicate this logic inside route components.

---

# 9. Auth Provider Requirements

Update:

```text
src/lib/auth/auth-provider.tsx
```

only as needed to support the verified authentication mechanism.

The provider must expose:

```text
user
isLoading
isAuthenticated
error
logout
refreshAuth
```

The current-user query must be the canonical source of server-backed user state.

After successful login:

```text
login succeeds
    ↓
credential/session is established
    ↓
current-user query is refreshed
    ↓
user becomes authenticated
```

Do not consider login successful merely because the POST request returned without throwing.

---

# 10. Login Requirements

Update:

```text
src/app/(auth)/login/page.tsx
```

so that:

1. credentials are submitted to the confirmed backend endpoint.
2. the authentication result is actually established.
3. the current-user query is refreshed.
4. `/api/accounts/me/` confirms authentication.
5. redirect occurs only after the user is confirmed authenticated.
6. invalid credentials show a safe error.
7. duplicate submissions remain blocked.

The login page must never perform:

```text
submit → unconditional router.push(...)
```

---

# 11. Authentication Proof Test

Add an explicit automated test proving:

```text
POST /api/auth/login/
        ↓
credential/session established
        ↓
GET /api/accounts/me/
        ↓
authenticated user returned
```

This is the most important missing proof from the previous Phase 13.2 gate.

A login test that only checks:

```text
button click
```

or:

```text
router push
```

is insufficient.

---

# 12. Protected Route Proof

Prove:

## Unauthenticated

```text
GET /app
    ↓
auth unresolved
    ↓
loading
    ↓
unauthenticated
    ↓
/login
```

## Authenticated

```text
valid authentication
    ↓
GET /app
    ↓
current user exists
    ↓
protected UI renders
```

## Invalid session

```text
expired/invalid authentication
    ↓
current-user request rejected
    ↓
auth state becomes unauthenticated
    ↓
protected route redirects safely
```

---

# 13. Logout Proof

Prove:

```text
authenticated
    ↓
logout
    ↓
backend session/token invalidated as required
    ↓
current-user state cleared
    ↓
protected route blocked
    ↓
login entry available
```

Also confirm that stale authenticated cache does not recreate the previous session on navigation.

---

# 14. CSRF Handling

The existing API client includes CSRF handling for mutating requests.

Do not remove this blindly.

First establish which authentication mechanism actually requires CSRF protection.

If cookie/session authentication is the final backend mechanism:

```text
credentials: include
+
CSRF contract
```

must remain coherent.

If pure token authentication is used:

- keep only CSRF behavior that is required by the backend/runtime
- do not send misleading or unnecessary authentication assumptions
- document the final decision

---

# 15. Registration Verification

Registration currently posts to:

```text
/api/auth/register/
```

and redirects to:

```text
/login?registered=true
```

Do not change this behavior unless it conflicts with the actual OpenAPI/runtime contract.

Verify:

```text
registration succeeds
    ↓
expected post-registration state
    ↓
login
    ↓
authenticated /api/accounts/me/
```

Do not mark registration complete merely because `/api/auth/register/` returned a success response.

---

# 16. Security Checks

Before closing remediation, verify:

- [ ] no credentials are logged
- [ ] no tokens are logged
- [ ] no token is placed in a URL
- [ ] no secret is committed
- [ ] no arbitrary redirect is accepted
- [ ] returnUrl remains path-safe
- [ ] protected content is not rendered before authentication is resolved
- [ ] logout clears authenticated client state
- [ ] invalid sessions cannot silently render protected content

---

# 17. Testing Checklist

Add/update tests for:

## API authentication

- [ ] successful login establishes usable authentication
- [ ] `/api/accounts/me/` succeeds after login
- [ ] unauthenticated `/api/accounts/me/` is handled correctly
- [ ] logout invalidates the authenticated state

## Login UI

- [ ] required fields
- [ ] duplicate submission prevention
- [ ] invalid credentials
- [ ] server error
- [ ] successful authentication
- [ ] safe redirect

## Registration

- [ ] successful registration
- [ ] validation error
- [ ] duplicate submission
- [ ] expected post-registration behavior

## Route protection

- [ ] unauthenticated user redirected
- [ ] authenticated user allowed
- [ ] auth-loading state stable
- [ ] invalid session handled

---

# 18. Verification Commands

Run exactly:

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

The final tree must contain no:

- secrets
- token dumps
- debug files
- temporary test artifacts
- unrelated feature changes

---

# 19. Required Verification Record

Replace/update:

```text
spec/verification/phase-13-2-authentication.md
```

so it no longer claims completion based only on implementation existence.

It must explicitly record the verified authentication chain:

```text
login endpoint
→ auth credential/session established
→ current-user endpoint succeeds
→ protected route succeeds
→ logout clears auth
```

Include the actual verification commands used.

Do not write "all tests passing" unless the commands were actually run and passed.

---

# 20. Completion Criteria

Phase 13.2 remediation is COMPLETE only when all are true:

1. The runtime authentication mechanism matches the backend contract.
2. Login establishes a usable authenticated state.
3. `/api/accounts/me/` succeeds after login.
4. The API client carries authentication correctly.
5. Protected routes work for authenticated users.
6. Protected routes reject unauthenticated users.
7. Logout invalidates authenticated state.
8. Registration follows the real backend contract.
9. Automated tests prove the authentication chain.
10. Lint passes.
11. Tests pass.
12. Production build passes.
13. No secrets/tokens are committed.
14. The verification document contains real verification evidence.

---

# 21. Phase Transition Gate

Do **not** advance to:

```text
SaaS Phase 13.3 — Academy Context
```

until this remediation passes.

Once complete:

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

Keep:

```text
progress.md
```

showing:

```text
Phase 13.2 — Authentication
Status: COMPLETE
```

and:

```text
Phase 13.3 — Academy Context
Status: NOT STARTED
```

---

# 22. What Not To Do

Do not use this remediation as a reason to:

- redesign the application shell
- rebuild the design system
- add academy switching
- add role dashboards
- implement tenant features
- introduce unrelated dependencies
- rewrite the entire auth architecture without evidence
- bypass the OpenAPI contract

This is a focused authentication correctness fix.

---

# 23. Governing Principle

> **A successful login request is not proof of authentication.**
>
> Authentication is complete only when the credential/session established by login is actually accepted by the authenticated API and protected application boundary.

Only after that proof exists should the repository proceed to Academy Context.
