Current phase: SaaS Phase 13.2
Phase name: Authentication
Status: NOT STARTED

## Objective
Implement authentication screens, registration workflow, and protected route enforcement aligned with the backend OpenAPI contract.

## Verification Commands
```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
```

## Exit criteria
- Login screen implementation completed.
- Registration workflow completed.
- Protected route enforcement correctly delegates unauthenticated users.
- API client handles token authentication and storage accurately.
- Forms use the design system components correctly.
- Authentication context manages session state correctly.
- Lint passes.
- Tests pass.
- Production build passes.
