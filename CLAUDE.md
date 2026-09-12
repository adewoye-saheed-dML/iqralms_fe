# Quran Academy Frontend Development Rules — Phase 1

Project: Quran Academy SaaS Frontend
Repository: Separate frontend repository
Backend source of truth: `adewoye-saheed-dML/quran_acad`
Current frontend phase: **Phase 1 — Product, UX & Frontend Foundation**

## Purpose

This repository contains the web frontend for the Quran Academy SaaS.

The frontend must consume the existing Django/DRF backend contract rather than recreate business rules in the browser.

The goal is to provide a modern, trustworthy, responsive Quran/Islamic education SaaS experience for:

- OWNER
- ADMIN
- STAFF
- TEACHER
- STUDENT
- PARENT

The frontend must support role-aware experiences while preserving backend authorization and tenant isolation.

## Source-of-truth hierarchy

Use this order when making implementation decisions:

1. Actual backend behavior and API contract.
2. `FRONTEND_PRODUCT_AND_DESIGN_SPEC.md`.
3. The current phase document.
4. `decisions.md`.
5. Tests and existing implementation.
6. `learnings.md`.
7. `tech-debt.md`.

Do not invent API behavior merely because it is convenient for the UI.

## Core engineering rules

1. Backend authorization is authoritative.
2. Frontend permission checks improve UX but are not a security boundary.
3. Never hard-code tenant-specific business rules in components.
4. Never duplicate backend validation logic unless needed for immediate UX feedback.
5. Do not invent JWT refresh flows when the backend does not provide them.
6. Do not introduce a second state-management architecture without documenting the reason.
7. Prefer feature/domain organization over giant shared component files.
8. Keep UI components reusable and business logic in feature modules/hooks/services.
9. Keep API access out of presentational components.
10. Prefer generated API types from the backend OpenAPI schema over handwritten duplicate models.
11. Preserve explicit loading, empty, error, forbidden, not-found, conflict, submitting, and success states.
12. Never silently swallow API errors.
13. Surface `X-Request-ID` in useful frontend error diagnostics.
14. Keep date/time handling timezone-aware.
15. Keep Arabic content and RTL behavior first-class in the design.
16. Do not expose private media or signed URLs outside their intended usage.
17. Do not store secrets in browser code.
18. Do not weaken production CORS or authentication to make the frontend work.
19. Do not bypass failing tests by deleting or weakening assertions.
20. Every completed phase must update tracking documents.

## AI coding agent rules

AI-assisted development is expected.

Every coding agent must:

1. Read `CLAUDE.md`.
2. Read the current phase document.
3. Read `FRONTEND_PRODUCT_AND_DESIGN_SPEC.md` for relevant product/design decisions.
4. Read `decisions.md` before changing architecture.
5. Read relevant entries in `learnings.md` and `tech-debt.md`.
6. Inspect existing implementation before creating new abstractions.
7. Make the smallest coherent change that satisfies the phase objective.
8. Run the relevant verification commands.
9. Record important discoveries and architectural decisions.
10. Stop and document uncertainty rather than inventing backend behavior.

### When an agent goes wrong

Do not patch symptoms repeatedly.

```text
STOP
→ identify the broken assumption
→ inspect the source-of-truth document/API/test
→ record the finding in learnings.md or decisions.md
→ correct the smallest root cause
→ run focused tests
→ run the broader verification gate
→ update the phase tracker
```

If a previous AI change is clearly incorrect, revert/rework it instead of building more code on top of an invalid assumption.

## Architecture principles

Recommended stack:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui + Radix primitives
- Lucide icons
- TanStack Query
- React Hook Form
- Zod
- OpenAPI-generated TypeScript types/client
- TanStack Table
- Recharts where dashboards need charts
- date-fns
- Vitest + Testing Library
- Playwright
- pnpm

Do not add Redux initially.

The frontend should use a feature-oriented architecture with a small, stable shared UI layer.

## API integration architecture

Preferred flow:

```text
Page / feature UI
→ feature hook
→ TanStack Query
→ typed API client
→ Django REST API
```

Do not scatter `fetch()` calls through components.

Centralize:

- base URL
- authentication headers
- request IDs
- common error normalization
- response handling

Respect the backend's actual authentication, organization isolation, role permissions, pagination, filters, status codes, enums, timestamps, uploads, signed URLs, and concurrency semantics.

## Product/UI rules

The authenticated product should live under an application shell such as `/app`.

Build user journeys, not database-shaped CRUD screens.

Visual direction:

- deep academy/Quranic green primary
- warm off-white and soft neutral surfaces
- restrained gold/brass accent
- strong contrast
- modern readable typography
- first-class Arabic and RTL support
- subtle Islamic identity, not decorative overload

Responsive priorities:

- desktop: admin, finance, reports, dense tables
- tablet: teachers, classroom, scheduling
- mobile: parents, students, teacher daily workflows, notifications

## Security

The frontend is not a security boundary.

Never trust hidden buttons, disabled controls, route protection alone, local role values, or client-side tenant IDs.

The backend must decide whether an action is permitted.

## Accessibility

Accessibility is a release requirement:

- semantic HTML
- keyboard navigation
- visible focus
- accessible labels
- proper form errors
- sufficient contrast
- usable dialogs
- screen-reader-compatible status messaging
- reduced-motion support where applicable

## Internationalization and RTL

Architecture must be ready for English and Arabic and for RTL layouts.

Full multilingual rollout may be staged, but RTL should not require a rewrite.

## Required project tracking files

Keep these current:

```text
CLAUDE.md
FRONTEND_PRODUCT_AND_DESIGN_SPEC.md
PHASE_01_FOUNDATION.md
decisions.md
learnings.md
tech-debt.md
progress.md
```

## Definition of done

A task is not complete merely because the UI renders.

Verify as applicable:

- TypeScript passes
- lint passes
- unit/component tests pass
- affected integration tests pass
- accessibility-critical states are covered
- loading/empty/error states work
- responsive behavior is checked
- API errors are handled
- no secrets are introduced
- no backend contract is invented
- tracking documents are updated when decisions/findings changed

## Phase 1 gate

Phase 1 is complete only when:

- project bootstrap and scripts exist
- architecture is documented
- full product UX/design direction is documented
- route/information architecture is documented
- role-aware UX matrix is documented
- design tokens are established
- typography is established
- responsive rules are established
- accessibility rules are established
- RTL rules are established
- API integration architecture is established
- authentication approach aligns with backend
- initial shared UI primitives exist
- initial application shell strategy exists
- testing strategy exists
- CI strategy exists
- deployment strategy exists
- observability/error strategy exists
- tracking documents exist
- there are no unresolved architecture blockers that are being hidden

## Explicit non-goals for Phase 1

Do not implement the entire product.

Do not invent new backend APIs.

Do not add payment gateways, accounting platforms, analytics warehouses, AI features, or native mobile apps.

Do not create a second authorization system.

Do not over-engineer global state.

## Next phase

**Phase 2 — Application Shell, Authentication & Academy Context**
