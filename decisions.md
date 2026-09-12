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

Status: Proposed; validate during bootstrap

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
