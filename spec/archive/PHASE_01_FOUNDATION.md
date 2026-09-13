ARCHIVED — NOT AUTHORITATIVE\n\n
# Frontend Phase 1 — Product, UX & Foundation

Status: Planned
Phase: 1

## Goal

Establish an implementation-ready frontend foundation before building the full application.

Phase 1 must answer:

- What are we building?
- For whom?
- How do users navigate it?
- What should it look and feel like?
- What roles exist?
- How does the frontend interact with the backend?
- What are the non-negotiable engineering rules?
- How do we recover safely when AI-generated code is wrong?

## Deliverables

### 1. Repository bootstrap

Establish:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shared component primitives
- linting
- formatting
- tests
- build scripts
- environment strategy

### 2. Design foundation

Establish:

- semantic color tokens
- typography
- spacing
- radii
- elevation
- semantic states
- responsive breakpoints
- icon rules
- Arabic/RTL rules

### 3. Product information architecture

Document:

- public navigation
- authenticated navigation
- application shell
- academy switcher
- role-aware navigation
- route boundaries

### 4. Role UX matrix

Document what each role should see and do, without inventing backend permissions.

### 5. API architecture

Establish:

- typed client strategy
- OpenAPI-generated types
- TanStack Query conventions
- auth handling
- tenant-context handling
- API error normalization
- request correlation

### 6. Shared UI primitives

Build only the initial primitives required for consistency.

### 7. Shell prototype

Build representative desktop/mobile shell behavior:

- sidebar/navigation
- top bar
- page header
- feedback region
- responsive navigation

## Sequence

1. Confirm backend/API source of truth.
2. Freeze initial product architecture.
3. Bootstrap project/tooling.
4. Implement design tokens.
5. Build primitive UI layer.
6. Build application shell.
7. Add authentication and academy-context foundation.
8. Run verification.
9. Update tracking files.

## Acceptance criteria

Phase 1 passes when:

- repository installs/builds reproducibly;
- lint/typecheck/test commands exist;
- frontend design direction is documented;
- route/information architecture is documented;
- role UX is documented;
- API architecture is documented;
- authentication architecture matches backend;
- tenant context is documented;
- design tokens exist;
- shared UI primitives exist;
- responsive shell strategy exists;
- accessibility requirements are encoded;
- RTL requirements are encoded;
- CI strategy is documented;
- tracking files exist and are actively used;
- unresolved architecture blockers are explicit.

## AI coding safeguards

Agents must not:

- invent API fields
- silently change API assumptions
- weaken/remove tests to make CI pass
- hide errors
- bypass type safety without documented justification
- create duplicate components without checking existing ones
- hard-code backend permissions
- assume one organization per user
- add global state without a documented need

Agents should:

- search before creating
- reuse established primitives
- keep changes small
- update documentation when architecture changes
- add tests with non-trivial behavior
- record failures/corrections

## Recovery rule

When implementation becomes confused:

```text
STOP
→ return to this phase/spec
→ identify the earliest incorrect assumption
→ record it
→ fix the root cause
→ rerun focused tests
→ rerun the phase verification gate
```

Do not layer new abstractions on an uncertain foundation.

## Backend dependencies

Do not fake missing backend behavior.

If a genuine backend API gap blocks correct UX, record it as a dependency or technical debt item and resolve it through the backend project rather than inventing browser-side business logic.

## Next phase

**Phase 2 — Application Shell, Authentication & Academy Context**
