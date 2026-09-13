# SaaS Phase 13.0 — Frontend Foundation Remediation

Status: Ready for implementation
Repository: `adewoye-saheed-dML/quran_fe`
Purpose: Close the missing frontend-foundation implementation gaps before proceeding to later Phase 13 work.

## Why this phase exists

The repository already has the frontend scaffold, package tooling, OpenAPI schema, basic app files and test infrastructure.

However, the current implementation still lacks the real foundation needed for the product:

- shared UI primitives
- application shell
- route structure
- role-aware navigation
- API client layer
- authentication architecture
- academy-context architecture
- responsive foundation
- RTL foundation
- accessibility baseline
- CI verification
- production verification

Do not start the later product workflows until this gate passes.

## Governing product map

The frontend is part of SaaS Phase 13.

The implementation order is:

```text
13.0 Frontend Architecture/Foundation
        ↓
13.1 Design System
        ↓
13.2 Authentication
        ↓
13.3 Academy Context
        ↓
13.4 Admin Foundation
        ↓
13.5 Scheduling
        ↓
13.6 Teaching
        ↓
13.7 Parent & Student
        ↓
13.8 Finance
        ↓
13.9 Notifications & Audit
        ↓
13.10 Imports
        ↓
13.11 Production UX
```

This remediation phase covers only the foundation needed before the later stages.

## Source of truth

Use, in this order:

1. `openapi/schema.yml`
2. existing backend API implementation/contract
3. `FRONTEND_PRODUCT_AND_DESIGN_SPEC.md`
4. this file
5. existing frontend code

Do not invent API fields, roles, permissions or authentication behaviour.

## 1. Repository inspection

Before changing code:

```bash
find src -maxdepth 5 -type f | sort
find . -maxdepth 3 -type f | sort
```

Search before creating anything:

```bash
grep -R "fetch(" src || true
grep -R "axios" src package.json || true
grep -R "Auth" src || true
grep -R "role" src || true
grep -R "academy" src || true
grep -R "sidebar" src || true
grep -R "navigation" src || true
```

Reuse existing code when it already solves the requirement.

## 2. Dependencies required by the approved frontend architecture

The product map specifies:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui + Radix
- Lucide
- TanStack Query
- React Hook Form
- Zod
- OpenAPI-generated types/client
- TanStack Table
- Recharts
- date-fns
- Vitest
- Testing Library
- Playwright
- pnpm

Do not install every library merely because it is listed.

For this remediation phase, install only dependencies required by the foundation being implemented.

The minimum expected additions are:

- TanStack Query
- Radix/shadcn primitives required by actual components
- Lucide
- a maintained class-name utility if required by the chosen component setup

React Hook Form, Zod, TanStack Table, Recharts and date-fns can wait until the relevant workflows need them.

## 3. Design tokens

Create one consistent token system for:

- primary green
- supporting neutrals
- restrained accent
- background
- foreground
- muted text
- borders
- success
- warning
- destructive
- focus
- spacing
- radius
- shadows
- typography
- breakpoints

Do not scatter raw design values across components.

The tokens must work in both LTR and RTL layouts.

## 4. Shared UI primitives

Create only primitives required by the shell and foundation.

Minimum:

```text
Button
IconButton
Input
Label
Select
Textarea
Badge
Card
Alert
Dialog
Sheet
Tabs
Tooltip
Spinner/Loading
EmptyState
ErrorState
PageHeader
```

Requirements:

- keyboard accessible
- focus visible
- typed props
- responsive
- reusable
- no feature-specific business logic

Do not create domain components in this phase.

## 5. Application shell

Create the authenticated shell.

Desktop:

```text
Top bar
├── academy selector
├── global actions
└── account menu

Sidebar
├── Dashboard
├── role-relevant navigation
├── Settings
└── Profile

Main content
└── Page header + content + feedback region
```

Mobile:

- compact top bar
- accessible menu/sheet
- focused content area
- no unusable horizontal navigation

The shell must not require real business data to render.

Use realistic typed mock data only where needed for the shell prototype.

Do not fake API responses inside production API modules.

## 6. Route structure

Create the route hierarchy that matches the product map.

Minimum foundation:

```text
src/app/
├── (marketing)/
├── (auth)/
│   └── login/
└── app/
    ├── dashboard/
    ├── academy/
    └── layout.tsx
```

Do not build every future screen yet.

The purpose here is to establish route boundaries and the application shell.

## 7. Role-aware navigation

Define a typed role model based on the actual backend contract.

The product distinguishes:

- Owner/Admin
- Lead Teacher
- Teacher
- Parent/Guardian
- Student

Navigation should be represented as configuration rather than repeated conditional JSX.

Conceptually:

```ts
type NavItem = {
  label: string
  href: string
  roles: BackendRole[]
}
```

Do not use navigation visibility as authorization.

A hidden item only improves UX. The backend remains the security boundary.

Do not create guessed permissions such as `CAN_DELETE_STUDENTS` unless they exist in the actual API contract.

## 8. API client

Create one central API layer.

Target shape:

```text
src/lib/api/
├── client.ts
├── errors.ts
├── auth.ts
└── ...
```

Responsibilities:

- base URL
- request construction
- authentication headers according to the real backend contract
- normalized API errors
- request correlation metadata if supported
- typed responses

React components must not contain scattered raw API calls.

OpenAPI-generated types are the source of truth.

Do not manually duplicate serializer interfaces.

## 9. Server-state architecture

Introduce TanStack Query for server state.

Rules:

- API data belongs in query/mutation caches
- local UI state stays local
- do not introduce Redux
- do not create a global store simply to hold fetched API data
- query keys must be deterministic
- academy context must be part of query invalidation strategy once implemented

Do not build complex data fetching abstractions before the basic client works.

## 10. Authentication foundation

This phase establishes the architecture, not the complete authentication workflow.

Must exist:

```text
src/lib/auth/
```

and a clear boundary for:

- current authenticated user
- login state
- logout
- unauthorized state
- authenticated route protection

Do not choose JWT, cookies, local storage or another mechanism by guesswork.

Read the actual backend authentication contract first.

Never place a secret or token in source code.

Never add a browser persistence mechanism merely because it is convenient.

## 11. Academy-context foundation

The architecture must support:

```text
one user
   ↓
multiple academy memberships
   ↓
one selected academy context
```

Create a single context abstraction for:

- current user
- memberships
- selected academy
- role in selected academy
- active/inactive membership state

Do not assume one user = one academy.

Do not assume the first academy returned is always the selected academy.

Do not trust a browser-supplied academy ID without backend validation.

This phase only establishes the frontend boundary. Full academy onboarding is later.

## 12. Responsive foundation

Use mobile-first layout rules.

Required behaviour:

### Desktop

- persistent sidebar
- multi-column workspace where appropriate

### Tablet

- collapsible/sidebar-adaptive navigation
- adaptive content widths

### Mobile

- compact navigation
- readable cards/forms
- touch-friendly controls
- no forced desktop tables in the shell

Do not solve responsiveness by adding arbitrary one-off media queries to every component.

## 13. RTL foundation

The application must be RTL-ready from the beginning.

Rules:

- use logical CSS properties where possible
- avoid left/right-specific layout assumptions
- use direction-aware spacing/alignment
- do not assume Arabic means the entire product is permanently RTL

The shell must render correctly under:

```html
<html dir="rtl">
```

without a separate copy of the application.

## 14. Accessibility baseline

Minimum requirements:

- semantic landmarks
- keyboard navigation
- visible focus
- accessible form labels
- buttons with accessible names
- dialog keyboard handling
- correct heading hierarchy
- meaningful empty/error states
- adequate contrast
- reduced-motion consideration

Do not depend on colour alone to communicate state.

## 15. CI

Create a GitHub Actions workflow for the frontend.

Minimum checks:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
```

Add Playwright only when its browser environment is correctly configured for CI.

Do not make CI green by suppressing tests or changing assertions without evidence.

## 16. Verification

Run:

```bash
pnpm lint
pnpm test
pnpm build
```

Then:

```bash
pnpm test:e2e
```

when the Playwright environment is valid.

Also inspect:

```bash
git status --short
```

There must be no unexplained generated files or local secrets.

## 17. Definition of done

This foundation remediation is complete only when all of the following are true:

### Architecture

- [ ] route boundaries exist
- [ ] shared UI primitives exist
- [ ] application shell exists
- [ ] role-aware navigation configuration exists
- [ ] central API client exists
- [ ] authentication boundary exists
- [ ] academy-context boundary exists
- [ ] server-state strategy exists

### UX foundation

- [ ] design tokens exist
- [ ] responsive rules are implemented
- [ ] RTL works
- [ ] accessibility baseline is implemented
- [ ] loading state exists
- [ ] empty state exists
- [ ] error state exists
- [ ] unauthorized/forbidden boundaries exist

### Engineering

- [ ] TypeScript passes
- [ ] lint passes
- [ ] unit/component tests pass
- [ ] production build passes
- [ ] CI passes
- [ ] no unsafe credential storage
- [ ] no invented API fields
- [ ] no invented permissions
- [ ] no scattered raw API calls

### Documentation

Update:

- `progress.md`
- `decisions.md`
- `learnings.md`

with actual implementation and verification evidence.

## Stop conditions

Stop and fix the foundation if:

- API shapes are unclear
- authentication behaviour is being guessed
- route permissions are being invented
- multiple competing API clients appear
- multiple global state systems appear
- the shell starts containing business logic
- the same UI primitive is recreated in multiple places
- tests are being weakened to pass
