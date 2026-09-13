# Quran Academy Frontend

This is the frontend application for the Quran Academy Management System.

## Tech Stack
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- shadcn/ui (Radix Primitives)
- TanStack Query
- OpenAPI TypeScript

## Repository Structure
- `src/app`: Next.js route boundaries
- `src/components`: Reusable UI, layout, and shared components
- `src/features`: Business domain logic
- `src/lib`: Infrastructure, API client, and providers
- `spec`: Authoritative product and architecture specifications

## How to Install
```bash
pnpm install --frozen-lockfile
```

## How to Run
```bash
pnpm dev
```

## How to Test
```bash
pnpm test
pnpm lint
pnpm build
```

## How to Generate API Types
```bash
pnpm generate:api
```

## Current Phase
See `spec/CURRENT_PHASE.md`.

## Source-of-Truth Hierarchy
1. Backend OpenAPI Contract (`openapi/schema.yml`)
2. Frontend Master Specification (`spec/FRONTEND_MASTER_SSoT.md`)
3. Code implementation

## Contribution Rules
- Always inspect existing code before adding new logic.
- Do not invent API fields, permissions, or authentication behavior.
- Ensure the academy context respects multi-tenancy.
- Centralize all API calls in `src/lib/api`.
