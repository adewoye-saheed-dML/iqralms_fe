# SaaS Phase 13.0 — Foundation Verification Checklist

## Repository

- [ ] Current branch and commit recorded.
- [ ] `git status --short` reviewed.
- [ ] Existing implementation inspected before creating files.

## Routes

- [ ] Public route boundary exists.
- [ ] Auth route boundary exists.
- [ ] App route boundary exists.
- [ ] App layout exists.
- [ ] Dashboard route exists.
- [ ] Academy foundation route exists.

## Shared UI

- [ ] Button
- [ ] Input
- [ ] Label
- [ ] Select
- [ ] Badge
- [ ] Card
- [ ] Dialog/Sheet
- [ ] Tabs
- [ ] Tooltip
- [ ] Loading
- [ ] Empty
- [ ] Error
- [ ] Page header

All primitives:

- [ ] typed
- [ ] keyboard accessible
- [ ] reusable
- [ ] responsive
- [ ] token-based

## Shell

- [ ] Desktop sidebar
- [ ] Mobile navigation
- [ ] Top bar
- [ ] Academy selector placeholder/boundary
- [ ] Account menu boundary
- [ ] Main content region
- [ ] Page header region
- [ ] Feedback region

## Navigation

- [ ] Roles come from backend contract.
- [ ] Navigation configuration is centralized.
- [ ] Owner/Admin experience represented.
- [ ] Lead Teacher experience represented.
- [ ] Teacher experience represented.
- [ ] Parent/Guardian experience represented.
- [ ] Student experience represented.
- [ ] UI hiding is not treated as authorization.

## API

- [ ] Single API client boundary.
- [ ] OpenAPI types are used.
- [ ] Error normalization exists.
- [ ] No scattered raw fetch calls.
- [ ] No manually duplicated API response types.

## Authentication

- [ ] Backend authentication mechanism verified.
- [ ] Current-user boundary exists.
- [ ] Login boundary exists.
- [ ] Logout boundary exists.
- [ ] Protected route boundary exists.
- [ ] Unauthorized state exists.
- [ ] No tokens/secrets committed.
- [ ] No unsafe credential storage added.

## Academy context

- [ ] Multiple memberships are representable.
- [ ] Selected academy is separate from user identity.
- [ ] Selected academy is represented centrally.
- [ ] Role is resolved in academy context.
- [ ] Invalid academy context is handled safely.
- [ ] Browser academy IDs are not trusted by themselves.

## Server state

- [ ] TanStack Query configured.
- [ ] Query provider integrated.
- [ ] Query keys follow one convention.
- [ ] No unnecessary global state library.

## Responsive / RTL

- [ ] Desktop shell tested.
- [ ] Tablet shell tested.
- [ ] Mobile shell tested.
- [ ] RTL direction tested.
- [ ] No left/right-only layout assumptions where logical properties are appropriate.

## Accessibility

- [ ] Keyboard navigation
- [ ] visible focus
- [ ] semantic landmarks
- [ ] accessible names
- [ ] form labels
- [ ] accessible dialog
- [ ] heading hierarchy
- [ ] reduced-motion consideration

## CI

- [ ] GitHub Actions workflow exists.
- [ ] Frozen-lockfile install works.
- [ ] lint runs in CI.
- [ ] tests run in CI.
- [ ] build runs in CI.
- [ ] Playwright CI setup is valid before enabling it as a required gate.

## Commands

```bash
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

Record:

```text
Date:
Commit:
Lint:
Tests:
Build:
E2E:
CI:
Failures:
Fixes:
```

## Final gate

Do not proceed to SaaS Phase 13.2+ until this checklist and the remediation specification both pass.
