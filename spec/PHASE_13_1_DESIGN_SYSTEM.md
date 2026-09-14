# QURAN ACADEMY — FRONTEND PHASE 13.1
## Design System Implementation & UI Foundation

**Repository:** `adewoye-saheed-dML/quran_fe`  
**Branch:** `main`  
**Phase:** SaaS Phase 13.1  
**Phase name:** Design System  
**Status:** READY TO START  
**Predecessor:** Phase 13.0 — Frontend Foundation  
**Authority:** `spec/FRONTEND_MASTER_SSoT.md` + `openapi/schema.yml`

---

# 1. Purpose

Phase 13.1 converts the approved frontend design direction into a consistent, reusable UI system.

This phase is **not** a product-feature phase.

Do not build students, teachers, scheduling, assessments, finance, imports, notifications, or audit workflows as feature implementations during this phase.

The objective is to make the repository capable of building those workflows without each screen inventing its own visual language, spacing, forms, loading behavior, responsive behavior, or accessibility conventions.

The Frontend Master Specification states that reusable primitives must exist before dozens of screens are built.

---

# 2. Authority

Use this order:

1. Backend/OpenAPI contract — API facts only.
2. `spec/FRONTEND_MASTER_SSoT.md` — product UX, design architecture, route intent and implementation sequence.
3. This phase document — execution instructions for Phase 13.1.
4. Existing implementation — evidence to inspect and preserve where compatible.

Do not create a competing design specification.

If a required design decision is not defined by the Master SSoT, mark it `OPEN` rather than inventing a product rule.

---

# 3. Entry Gate

Phase 13.0 is recorded as complete in the repository tracker.

The repository currently contains the canonical documentation structure:

```text
spec/
├── FRONTEND_MASTER_SSoT.md
├── CURRENT_PHASE.md
├── archive/
└── verification/
    └── PHASE_13_0_FOUNDATION_GATE.md
```

The repository also has the intended responsibility boundaries:

```text
src/
├── app/
├── components/
└── lib/
```

with domain features intended under:

```text
src/features/
```

Before changing Phase 13.1, inspect the actual source tree and imports. Do not assume that a file belongs in a location merely because the target architecture says it should.

---

# 4. Current Repository Assessment

The restructure is substantially aligned with the canonical repository organization.

Observed alignment:

- Next.js App Router route boundary exists.
- `(auth)` and `(marketing)` route groups exist.
- `/app/dashboard` and `/app/academy` route boundaries exist.
- `components/layout` exists for shell components.
- `components/ui` exists with reusable primitives.
- `lib/api` exists as the API boundary.
- `lib/academy` exists for academy context.
- `openapi/schema.yml` exists.
- Legacy specifications have been moved under `spec/archive/`.
- `spec/FRONTEND_MASTER_SSoT.md` exists.
- `spec/CURRENT_PHASE.md` exists.
- Phase 13.0 verification documentation exists.
- `progress.md` now records Phase 13.0 as complete.

The repository package configuration also confirms Next.js, React, Tailwind CSS v4, Radix primitives, TanStack Query, OpenAPI TypeScript generation, Vitest and Playwright are present.

Important remaining alignment work for this phase:

- The current tracker still describes Phase 13.1 as `NOT STARTED`.
- The current phase file still points to Phase 13.0 and must be advanced after this phase starts.
- The Master SSoT calls for a broader design-system/component inventory than is currently visible in the repository.
- The Master SSoT specifies React Hook Form, Zod, TanStack Table, Recharts and date-fns as the intended stack; these are not currently present in `package.json`. Do not install all of them automatically in 13.1 unless the design-system work actually requires them. Feature-specific dependencies should be introduced when their phase requires them.
- The current repository structure should continue to be treated as implementation evidence; do not move files unnecessarily just to make the tree visually match a document.

---

# 5. Phase Objective

Create the minimum production-quality design system required for the Quran Academy application.

The system must establish:

- color tokens
- typography tokens
- spacing conventions
- radii
- focus states
- button variants
- form controls
- cards
- alerts
- dialogs
- sheets
- tabs
- badges
- page headers
- loading states
- empty states
- error states
- responsive layout primitives
- accessible interaction patterns
- Arabic/Quranic text direction and typography foundations

The result must be reusable by later feature phases.

---

# 6. Product Visual Direction

The Master SSoT defines the following visual language:

## Primary

Deep Quranic / academy green.

## Supporting palette

- warm off-white
- soft neutral gray
- muted emerald

## Accent

Restrained gold / brass.

Do not turn the interface into a decorative Islamic theme.

The product should feel:

- calm
- trustworthy
- modern
- professional
- educational
- subtly Islamic

Avoid excessive ornamentation and excessive pill styling.

---

# 7. Typography

The application must establish a readable modern UI type system.

Target direction:

```text
Inter / Geist-style UI typography
```

Arabic UI:

```text
Noto Sans Arabic
```

or an equivalent readable Arabic UI family.

Quranic content requires dedicated Arabic typography appropriate for educational/Quranic text.

Do not use the same typography assumptions for:

```text
English UI
Arabic UI
Quranic content
```

without explicitly validating readability and direction.

---

# 8. Design Tokens

Establish centralized tokens rather than hard-coding values across components.

At minimum define semantic categories for:

```text
color
background
foreground
muted
border
primary
secondary
accent
destructive
success
warning
focus
radius
spacing
font family
font size
font weight
line height
shadow
```

Prefer semantic names over component-specific names.

Good:

```text
--color-primary
--color-muted
--color-border
--color-destructive
```

Avoid:

```text
--green-button-1
--student-card-gray
--dashboard-padding
```

The tokens must make later theme refinement possible without rewriting feature components.

---

# 9. Component Inventory

Phase 13.1 must establish or verify the reusable primitives needed by later workflows.

## Required primitives

```text
Button
ButtonGroup
Input
Select
Combobox
Textarea
Label
DateTimePicker foundation
Dialog
Sheet
Confirmation dialog pattern
Card
Stat block
Activity item
Table foundation
Pagination foundation
Filter controls
Tabs
Breadcrumbs
Steps
Progress indicator
Calendar foundation
Scheduling block foundation
Badge
Alert
Toast foundation
Loading skeleton
Empty state
Error state
Page header
```

Do not implement domain-specific behavior inside these primitives.

For example:

```text
components/ui/card.tsx
```

must not know what a student, booking, teacher, academy or assessment is.

---

# 10. Component Rules

Every reusable primitive must have:

- predictable props
- accessible semantics
- keyboard support where relevant
- visible focus behavior
- disabled state where applicable
- loading state where applicable
- consistent spacing
- consistent typography
- consistent responsive behavior
- consistent error treatment where applicable

Avoid one-off visual implementations in route pages.

---

# 11. Button Standard

Establish a small, explicit variant system.

At minimum:

```text
primary
secondary
outline
ghost
destructive
```

Do not create dozens of variants.

Button behavior must clearly distinguish:

```text
default
hover
focus
active
disabled
loading
```

A submitting mutation must not allow duplicate activation.

---

# 12. Form Standard

All forms must follow one visual and interaction convention.

Required behavior:

```text
label
control
help text
validation message
disabled state
submitting state
```

Backend validation must eventually map into field-level errors.

Do not render raw Django validation JSON as page content.

Phase 13.1 establishes the visual/form primitives; feature phases will connect them to actual API mutations.

---

# 13. Dialog and Destructive Action Standard

Dialogs must:

- have accessible titles
- have clear descriptions where needed
- support keyboard interaction
- trap focus appropriately
- have explicit cancel/confirm actions
- prevent accidental duplicate submission

Destructive actions must not look identical to ordinary primary actions.

---

# 14. Loading / Empty / Error Standard

Every feature built after Phase 13.1 must be able to consume these states.

## Loading

Use a skeleton or progressive placeholder that preserves the page structure.

## Empty

Explain what is missing and provide the next useful action when one exists.

## Error

Explain the failure in user-friendly language and provide retry/recovery where safe.

## Forbidden

Use a permission-safe message without exposing hidden resource details.

## Not found

Do not leak tenant/resource existence.

---

# 15. Responsive Standard

The Master SSoT defines:

| Viewport | Primary use | Strategy |
|---|---|---|
| Desktop | Admin, lead, finance, reports | Full sidebar + dense workspace |
| Tablet | Teachers, scheduling, classroom management | Collapsible sidebar + adaptive content |
| Mobile | Parents, students, teacher quick actions | Compact/bottom navigation + focused workflows |

Phase 13.1 must establish reusable layout behavior for these three modes.

Do not build a separate mobile application.

---

# 16. Accessibility Baseline

All design-system primitives must support:

- keyboard navigation
- visible focus
- semantic HTML
- correct labels
- accessible dialogs
- accessible forms
- accessible tables
- sufficient color contrast
- screen-reader support
- reduced-motion preferences

Accessibility is a design-system requirement, not a final cleanup task.

---

# 17. RTL and Arabic Foundation

The architecture must remain i18n-ready even if English ships first.

Rules:

```text
English UI → LTR
Arabic UI → RTL
Quranic content → correct Arabic direction and typography independently
```

Do not assume that displaying Arabic content means the entire application must switch to RTL.

Test at least:

- Arabic text in cards
- Arabic text in inputs
- mixed Arabic/English content
- direction-aware alignment
- long Arabic strings
- Quranic text wrapping

---

# 18. Layout Primitives

Establish reusable layout patterns for:

```text
Page
PageHeader
ContentSection
Stack
Inline
Grid
ResponsiveContainer
CardGrid
TwoColumnLayout
DetailLayout
```

Only introduce abstractions that are actually useful.

Do not build a generic design framework inside the application.

---

# 19. Tables

Create a table foundation that later feature phases can extend.

The foundation should support the design language for:

- headers
- rows
- selected rows
- empty tables
- loading tables
- responsive behavior
- pagination placement
- filter placement

Do not implement student or teacher table business logic here.

---

# 20. Cards and Dashboard Primitives

Create reusable visual primitives for:

```text
Card
StatCard
ActivityItem
ProgressCard
ActionCard
```

Only generic presentation belongs here.

Role-specific dashboard content belongs to later feature phases.

---

# 21. Notifications / Toasts

Establish a consistent visual language for:

```text
success
info
warning
error
```

Do not build the notification-center product feature in Phase 13.1.

This phase only establishes the reusable UI feedback mechanism.

---

# 22. Icon Standard

The repository uses Lucide icons.

Use icons consistently.

Rules:

- do not mix arbitrary icon libraries
- icon-only buttons require accessible labels
- icons must support the surrounding text rather than replace important labels
- avoid decorative icon overload

---

# 23. Motion

Motion must be:

- subtle
- purposeful
- short
- consistent

Respect reduced-motion preferences.

Do not introduce animation frameworks unless there is a demonstrated need.

---

# 24. Styling Rules

Continue using the repository's existing Tailwind CSS approach.

Do not introduce:

- CSS-in-JS
- a second styling framework
- arbitrary component-local design systems
- duplicated token systems

Prefer the existing Tailwind + component primitive architecture.

---

# 25. Testing Requirements

Phase 13.1 must add or update tests for the design-system behavior that is actually implemented.

Minimum expectations:

## Unit/component

Test important variants and state transitions for:

```text
Button
Input
Select
Dialog
Tabs
Alert
Badge
Loading
Empty
Error
```

## Accessibility

Verify:

- labels
- focus
- keyboard operation
- dialog semantics
- interactive control names

## Responsive

Verify the most important layout invariants at:

```text
desktop
tablet
mobile
```

Do not create brittle pixel-perfect tests for every component.

---

# 26. Verification Commands

Run:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm test
pnpm build
```

Then, if the Playwright environment is configured correctly:

```bash
pnpm test:e2e
```

Finally:

```bash
git status --short
```

The repository must not contain unexpected generated files, secrets, temporary debugging files, or unrelated changes.

---

# 27. Phase Task Checklist

## 13.1-A — Audit existing primitives

- [x] Inspect every current file under `src/components/ui`.
- [x] Inspect `src/components/layout`.
- [x] Inspect `src/app/globals.css`.
- [x] Identify duplicated visual conventions.
- [x] Identify missing primitives.
- [x] Do not rewrite components without a reason.

## 13.1-B — Token foundation

- [x] Establish semantic color tokens.
- [x] Establish typography tokens.
- [x] Establish spacing conventions.
- [x] Establish radius conventions.
- [x] Establish focus treatment.
- [x] Establish shadow/elevation conventions where needed.

## 13.1-C — Core primitives

- [x] Button variants.
- [x] Form controls.
- [x] Card.
- [x] Badge.
- [x] Alert.
- [x] Dialog.
- [x] Sheet.
- [x] Tabs.
- [x] Page header.
- [x] Loading.
- [x] Empty.
- [x] Error.

## 13.1-D — Layout

- [x] Desktop layout.
- [x] Tablet layout.
- [x] Mobile layout.
- [x] Responsive sidebar behavior.
- [x] Content width conventions.
- [x] Page header conventions.

## 13.1-E — Accessibility

- [x] Keyboard focus.
- [x] Labels.
- [x] Dialog accessibility.
- [x] Screen-reader names.
- [x] Contrast review.
- [x] Reduced motion.
- [x] RTL foundations.

## 13.1-F — Verification

- [x] Unit/component tests pass.
- [x] Lint passes.
- [x] Production build passes.
- [x] Responsive review completed.
- [x] Accessibility review completed.
- [x] No feature business logic leaked into UI primitives.

---

# 28. Definition of Ready

Phase 13.1 is ready to begin when:

1. Phase 13.0 remains verified as complete.
2. The Master SSoT remains the active product/architecture authority.
3. The current repository tree has been inspected.
4. Existing UI primitives have been inventoried.
5. No unresolved API contract issue is being disguised as a design-system task.

---

# 29. Definition of Done

Phase 13.1 is complete only when:

1. A coherent token system exists.
2. Core UI primitives use the same visual language.
3. Forms have consistent states.
4. Dialogs and sheets are accessible.
5. Loading, empty and error states are reusable.
6. Desktop/tablet/mobile layout conventions are established.
7. Arabic/RTL foundations are implemented at the design-system level.
8. Existing shell components consume the design system rather than inventing separate styles.
9. Component tests cover important interaction/state behavior.
10. Lint passes.
11. Tests pass.
12. Production build passes.
13. No duplicate styling system has been introduced.
14. No product-domain business logic has been added to generic UI primitives.
15. `spec/CURRENT_PHASE.md` and `progress.md` are updated to reflect the actual result.

---

# 30. Explicit Non-Goals

Do not implement:

- student management workflows
- teacher management workflows
- curriculum management
- scheduling
- assessments
- progress
- pricing
- payouts
- notification center
- audit log
- CSV/XLSX imports
- global search
- payment collection
- accounting
- a separate mobile application

Those belong to later phases in the Master SSoT.

---

# 31. Transition to Phase 13.2

When Phase 13.1 passes its Definition of Done:

```text
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

Do not skip the phase gate simply because components already exist.

Existing components count as evidence, not automatic completion.

---

# 32. Required Documentation Update After Completion

Update:

```text
spec/CURRENT_PHASE.md
progress.md
```

The current phase must become:

```text
Current phase: SaaS Phase 13.1
Phase name: Design System
Status: COMPLETE
```

only after the verification evidence exists.

Then prepare Phase 13.2 as the next current phase.

---

# 33. Governing Principle

> Build the reusable system once.  
> Let every later workflow consume it.  
> Do not let individual pages become their own design systems.
