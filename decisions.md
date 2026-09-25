# Frontend Architecture Decisions

Record decisions that materially affect architecture or product behavior.

## D-001 — Separate frontend repository

Status: Accepted

The frontend is maintained separately from the Django backend.

Reason:

- independent lifecycle
- frontend-specific CI/CD
- cleaner separation
- safer AI-assisted iteration

## D-002 — Backend remains source of truth

Status: Accepted

Frontend logic consumes the backend contract and does not become a second domain-authority layer.

## D-003 — Recommended frontend stack

Status: Accepted

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui + Radix primitives
- TanStack Query
- React Hook Form
- Zod
- OpenAPI-generated TypeScript types/client
- TanStack Table
- Vitest + Testing Library
- Playwright
- pnpm

## D-004 — No Redux initially

Status: Accepted unless evidence changes

Use TanStack Query for server state and local React state for UI state. Add a global client store only when a concrete cross-feature requirement exists.

## D-005 — Feature-oriented structure

Status: Accepted

Feature/domain modules own domain behavior while shared UI remains small and reusable.

## Change policy

Do not silently replace important decisions. Add a new decision entry with the reason and impact.
\n## [2026-09-13] Phase 13.0 - Frontend Foundation
- Used `apiClient` wrapper for fetch to centralize configuration, authentication headers, error handling.
- Chose not to introduce global state for server data (relied on TanStack React Query).
- Stored academy context in a dedicated provider decoupled from auth to reflect 1 user -> many academies model.
- Configured navigation using `navigationConfig` object with allowed roles, instead of messy conditional JSX.

## D-006 — Token Storage

Status: Accepted

Auth token is stored in `localStorage`. The backend uses DRF TokenAuthentication (returning a token key in the response payload instead of an HTTP-only cookie). Therefore, the token must be stored client-side to be appended to the `Authorization` header of subsequent API requests. Since Next.js is primarily acting as a static SPA for the dashboard rendering, `localStorage` is the optimal approach without complicating SSR passing.

## D-007 — Resync `spec/FRONTEND_MASTER_SSoT.md` with the canonical v1.0 spec

Status: Accepted

Reason: the committed `spec/FRONTEND_MASTER_SSoT.md` was a pre-Phase-13 draft (34 loosely-numbered sections, no route map, no Phase 13.0–13.11 sequence, no D/O decision ledger) that no longer matched the owner's actual v1.0 "Frontend Master Specification" (13 Sep 2026). Any agent following `CLAUDE.md`'s instruction to treat that file as the SoT was building against an outdated plan. Replaced the file's content with the v1.0 spec verbatim; no application code was changed by this decision. `IQRA_LMS_FRONTEND_BACKEND_SSoT_REMEDIATION_AUDIT.md` is now explicitly named in `CLAUDE.md` as a subordinate, closeable punch-list rather than a competing source of truth.
