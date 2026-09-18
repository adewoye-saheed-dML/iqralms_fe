# F07 — Authentication Contract and Token Storage

Goal: make auth match the real DRF backend and resolve the open token-storage decision.

Known contract:
- `POST /api/auth/login/`
- `POST /api/auth/logout/`
- `POST /api/auth/register/`
- `GET /api/accounts/me/`

The SSoT notes DRF TokenAuthentication and no refresh-token flow. Verify this against the current backend/OpenAPI before coding.

Audit finding:
- `src/lib/auth/token.ts` uses localStorage for `auth_token`
- AuthProvider contains a misleading cookie comment

Instructions:
1. Inspect live login response and auth configuration.
2. Confirm Authorization header format.
3. Confirm logout behavior.
4. Confirm current-user bootstrap.
5. Decide token storage based on the actual architecture and document it.
6. Update the SSoT O-01 decision only when evidence supports it.
7. Remove misleading cookie/refresh comments.
8. Do not invent JWT refresh behavior.

AuthProvider owns login/logout/register/current user/init/protected-route/401/403 UX.

Tests:
- successful login
- invalid login
- bootstrap
- invalid auth
- logout
- protected route
- 401 and 403 mapping

Forgot-password remains OPEN unless a backend contract exists.

Acceptance:
- auth follows actual backend
- no fake refresh flow
- token decision documented
- misleading auth comments removed
- tests pass

STOP.
