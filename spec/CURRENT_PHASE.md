Current phase: SaaS Phase 13.0
Phase name: Frontend Foundation
Status: COMPLETE

## Objective
Establish the frontend foundational architecture, API boundaries, authentication, and multi-tenant context.

## Verification Commands
```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
```

## Exit criteria
- One frontend master SSoT exists.
- Central API client exists.
- Authentication matches backend contract.
- Academy context supports multi-tenancy.
- Role model aligns with OpenAPI.
- Verification passes.
