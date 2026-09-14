Current phase: SaaS Phase 13.3
Phase name: Academy Context
Status: NOT STARTED

## Objective
Build authenticated academy/tenant selection and context behavior on top of the verified session.

## Verification Commands
```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
```

## Exit criteria
- Academy selection UI implemented.
- Role-based tenant routing implemented.
- Context invalidation on switch works.
- Lint passes.
- Tests pass.
- Production build passes.
