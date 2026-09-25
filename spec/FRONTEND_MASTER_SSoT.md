QURAN ACADEMY  |  FRONTEND MASTER SPECIFICATION

**QURAN ACADEMY**

**Frontend Master Specification**

Single Source of Truth for the Web Application

SaaS Phase 13 • Design → Architecture → UX → API → Implementation → QA

| **DOCUMENT PURPOSE** This is the go-to frontend document. It defines what the frontend is, how it behaves, how it is structured, how it talks to the backend, and in what order it is built. Future frontend work should update this document instead of creating parallel interpretations of the product. |
| --- |

| **Field** | **Value** |
| --- | --- |
| Document status | Frontend master specification / living SSoT |
| Phase | 13 — Frontend Foundation & Web Application |
| Primary frontend | Next.js + React + TypeScript |
| Backend contract | Django REST Framework + OpenAPI 3.0.3 |
| API schema version supplied | 0.6.0 |
| Primary audience | Frontend engineers, backend engineers, product/design, QA |
| Rule | When this document conflicts with the live API schema, the conflict must be resolved explicitly before coding. |

Prepared from the supplied pre-frontend roadmap, frontend planning notes, and OpenAPI schema. The roadmap describes the SaaS boundary and readiness gate; the frontend notes describe the intended UX and architecture; the OpenAPI file supplies the contracted endpoints and schema names.

Source basis: the roadmap explicitly requires stable tenancy, roles, curriculum configuration and user journeys before meaningful frontend work; the frontend notes define Phase 13 as a design/architecture-first effort; the OpenAPI contract defines the current API surface.

# 0. Source-of-Truth Policy

| **ONE FRONTEND REFERENCE** If a frontend engineer asks “what should we build?”, this document should answer the product/UX/architecture question. The OpenAPI schema answers the exact API contract question. Backend code/tests remain authoritative for security and business-rule enforcement. |
| --- |

| **Question** | **Authoritative source** | **Frontend rule** |
| --- | --- | --- |
| What product experience should exist? | This document | Follow the journeys, routes, page definitions and role UX in this specification. |
| What endpoint/schema/status exists? | OpenAPI schema | Generate types/client from the schema; do not hand-copy API interfaces. |
| What is actually authorized? | Backend permissions/querysets/tests | Frontend only reflects permissions; it is never the security boundary. |
| What is the current implementation order? | This document | Use Phase 13.x sequence and update the status ledger in this document. |
| What changed? | Changelog in this document + API schema version | Never silently drift the frontend contract. |

## Change protocol

1.  Any API-affecting backend change must update OpenAPI first/alongside the implementation.

2.  Any frontend workflow, route, permission UX, or component-system decision that changes intended behavior must update this document.

3.  Do not create a competing “frontend roadmap”, “UI plan”, or role-flow document unless it is explicitly linked as a subordinate artifact.

4.  Mark unresolved items as OPEN rather than inventing behavior. The next implementation phase cannot quietly convert an assumption into a product rule.

# 1. Product North Star

Quran Academy is a multi-tenant SaaS platform for Quran and Islamic learning institutions. The frontend should feel like a modern, calm, trustworthy Islamic education product—not a generic school ERP.

| **Principle** | **Frontend consequence** |
| --- | --- |
| Trust | Predictable navigation, clear states, auditable actions, no unexplained mutations. |
| Clarity | Task-focused pages, readable hierarchy, useful empty/error states, minimal dashboard noise. |
| Learning | Student/parent experiences emphasize progress, sessions and next actions. |
| Professional SaaS | Academy context, role-aware navigation, responsive layouts, bulk operations and reporting. |
| Subtle Islamic identity | Deep academy green, warm neutrals and restrained gold; avoid excessive ornamentation. |

## Core lifecycle

Onboard academy → configure → curriculum → invite staff → enroll students → schedule → teach → assess → monitor progress → reconcile payouts

| **BUILD JOURNEYS, NOT CRUD** The frontend should model real user tasks. “Students” is not simply a database table screen; the real flow is invite/import → enroll → assign curriculum → schedule → teach → assess → monitor. |
| --- |

# 2. Product & Information Architecture

PUBLIC
  Marketing · About · Features · Pricing · Login · Register

APP
  Active Academy
    People: Students · Teachers · Parents
    Learning: Curriculum · Assessments · Progress · Reports
    Operations: Scheduling · Cohorts · Bookings · Imports
    Finance: Pricing · Agreements · Payouts · Statements
    Trust: Notifications · Audit Log
    Administration: Academy · Settings · Profile

## Authenticated shell

| **Global surface** | **Purpose** |
| --- | --- |
| Academy selector | Select the active academy context; identity remains global. |
| Global search (later) | Cross-domain discovery after core workflows are stable. |
| Notifications | In-app notification history and delivery status where permitted. |
| Profile | Global user identity/preferences. |
| Role-aware navigation | Only expose workflows relevant to the current academy membership/role. |

# 3. Roles & Permission UX

The product separates global user identity from academy membership. A person can therefore have different roles in different academies. The backend remains authoritative; the frontend uses role information to shape navigation and UX.

| **Capability** | **Owner/Admin** | **Lead Teacher** | **Teacher** | **Parent** | **Student** |
| --- | --- | --- | --- | --- | --- |
| Academy settings | Full | Limited/policy | — | — | — |
| Manage teachers | Yes | Yes | — | — | — |
| Manage curriculum | Yes | Yes | — | — | — |
| Manage students/enrollment | Yes | Yes | Limited | — | — |
| Scheduling/routing | Yes | Yes | Own classes/availability | Own children | Own classes |
| Placement review | Yes | Yes | Policy-dependent | — | Submit only |
| Assessment/reporting | Yes | Yes | Own teaching data | Linked children | Own progress |
| Pricing agreements | Yes | Yes | No | View later | Own applicable price later |
| Teacher payouts | Yes | Yes / finance role later | Own only | — | — |
| Audit log | Yes | Policy-dependent | No | No | No |

| **ROLE UX RULE** Do not create one giant dashboard with conditional cards. Each role has a different home experience and a different information hierarchy. |
| --- |

# 4. Route Map

## Public

/
/about
/features
/pricing
/contact
/login
/register

## Authentication

/login
/register
/accept-invitation
/forgot-password  [OPEN: requires backend contract unless already implemented elsewhere]

## Authenticated app

/app
/app/dashboard
/app/academy
/app/students
/app/teachers
/app/curriculum
/app/scheduling
/app/assessments
/app/pricing
/app/payouts
/app/notifications
/app/audit
/app/settings
/app/profile

The supplied frontend notes propose the route architecture above. The frontend implementation should not imply that an uncontracted backend capability exists. Route availability can be staged while the API contract catches up.

# 5. Design System

## Visual language

| **Token family** | **Direction** |
| --- | --- |
| Primary | Deep Quranic/academy green |
| Support | Warm off-white, soft neutral gray, muted emerald |
| Accent | Restrained gold/brass |
| UI type | Modern readable sans-serif (Inter/Geist-style) |
| Arabic UI | Noto Sans Arabic or equivalent readable Arabic UI family |
| Quranic content | Dedicated Arabic typography appropriate for Quranic/educational text |
| Radius | Consistent moderate radius across cards, inputs, dialogs; avoid excessive pill styling |
| Motion | Subtle, purposeful; respect reduced-motion preferences |

## Core component inventory

Buttons and button groups

Inputs / selects / comboboxes / date-time pickers

Dialogs / sheets / confirmations

Cards / stat blocks / activity items

Tables / pagination / filters

Tabs / breadcrumbs / steps / progress indicators

Calendars / scheduling blocks

Badges / alerts / toasts

Loading skeletons / empty states / error states

## Design-system rule

Build reusable primitives before building dozens of screens. A page should consume the design system, not invent its own spacing, form behavior, table conventions or loading treatment.

# 6. Responsive, Accessibility & Internationalization

| **Viewport** | **Primary use** | **Strategy** |
| --- | --- | --- |
| Desktop | Admin, lead, finance, reports | Full sidebar + dense workspace |
| Tablet | Teachers, scheduling, classroom management | Collapsible sidebar + adaptive content |
| Mobile | Parents, students, teacher quick actions | Compact/bottom navigation + focused workflows |

## Accessibility baseline

Keyboard navigation and visible focus

Semantic HTML and correct labels

Accessible dialogs, forms and tables

Sufficient color contrast

Screen-reader support

Reduced-motion consideration

## i18n / RTL baseline

Design the application i18n-ready even if English ships first.

English UI is LTR; Arabic UI can be RTL.

Arabic/Quranic content must render with correct direction and typography independent of overall UI direction.

Do not assume that Arabic content means the entire application must be RTL.

# 7. Frontend Architecture

## Stack

| **Layer** | **Choice** |
| --- | --- |
| Framework | Next.js + React + TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui + Radix primitives |
| Icons | Lucide |
| Server/API state | TanStack Query |
| Forms | React Hook Form |
| Validation | Zod |
| API types/client | OpenAPI-generated TypeScript types/client |
| Tables | TanStack Table |
| Charts | Recharts |
| Dates | date-fns |
| Testing | Vitest + Testing Library + Playwright |
| Package manager | pnpm |
| Deployment | Vercel or equivalent Next.js-compatible platform |
| Backend | Django REST Framework |
| Database | PostgreSQL |

| **STATE RULE** Do not introduce Redux initially. The backend owns business state; TanStack Query owns server state and cache; React state owns genuinely local UI state. |
| --- |

## Repository structure

src/
  app/
    (marketing)/
    (auth)/
    app/
  components/
    ui/
    shared/
  features/
    auth/
    organizations/
    onboarding/
    students/
    teachers/
    curriculum/
    scheduling/
    assessments/
    progress/
    pricing/
    payouts/
    notifications/
    imports/
    audit/
  lib/
    api/
    auth/
    permissions/
    dates/
    utils/
  types/

# 8. Authentication & Academy Context

## Authentication contract currently supplied

POST /api/auth/login/
POST /api/auth/logout/
POST /api/auth/register/
GET  /api/accounts/me/

The supplied frontend notes state that the current API uses DRF TokenAuthentication and does not use refresh tokens. Authentication code must therefore follow the actual contract rather than introducing an assumed OAuth/JWT refresh flow.

## AuthProvider responsibilities

login()

logout()

currentUser()

token state / session initialization

protected-route behavior

mapping API 401/403 states to UX

## Academy context

The active academy is a tenant context, not a second identity. The frontend should make the current academy explicit and include it in feature-level requests. Do not rely only on an implicit browser-local “current academy”; the backend contract must authorize the requested organization.

User identity
   ↓
Organization memberships
   ↓
Selected / active organization
   ↓
Feature API query + permission checks
   ↓
UI

# 9. API Integration Architecture

React component
      ↓
Feature hook / mutation
      ↓
TanStack Query
      ↓
Generated typed API client
      ↓
Django REST API
      ↓
Organization / permission / service layer
      ↓
PostgreSQL

| **NO FETCH IN SCREENS** Do not scatter fetch("/api/...") through React components. API access belongs behind typed domain clients/hooks so endpoint changes are localized and testable. |
| --- |

## Current API contract inventory

### Auth & identity

POST /api/auth/login/

POST /api/auth/logout/

POST /api/auth/register/

GET /api/accounts/me/

GET /api/accounts/my-children/

POST /api/accounts/parent-links/

### Organizations & memberships

POST /api/organizations/

GET /api/organizations/mine/

GET /api/organizations/{id}/

GET /api/organizations/{organization_pk}/memberships/

POST /api/organizations/{organization_pk}/memberships/

PATCH /api/organizations/{organization_pk}/memberships/{id}/

### Curriculum & placement

GET/POST /api/curriculum/organizations/{organization_pk}/tracks/

GET/PATCH /api/curriculum/organizations/{organization_pk}/tracks/{id}/

GET/POST /api/curriculum/organizations/{organization_pk}/levels/

GET/PATCH /api/curriculum/organizations/{organization_pk}/levels/{id}/

POST /api/curriculum/organizations/{organization_pk}/placements/

GET /api/curriculum/organizations/{organization_pk}/placements/{...}/audio-url/

POST /api/curriculum/organizations/{organization_pk}/placements/{id}/review/

GET /api/curriculum/organizations/{organization_pk}/placements/{...}/mine|children|pending/

GET/POST/PATCH teacher records under /curriculum/organizations/{organization_pk}/teachers/

### Scheduling

GET /api/scheduling/organizations/{organization_pk}/availability/

POST /api/scheduling/organizations/{organization_pk}/bookings/

POST /api/scheduling/organizations/{organization_pk}/bookings/{id}/cancel/

GET /api/scheduling/organizations/{organization_pk}/bookings/mine/

GET /api/scheduling/organizations/{organization_pk}/bookings/teaching/

POST /api/scheduling/organizations/{organization_pk}/cohorts/

GET /api/scheduling/organizations/{organization_pk}/cohorts/open/

POST /api/scheduling/organizations/{organization_pk}/route/

GET /api/scheduling/organizations/{organization_pk}/waitlist/...

POST /api/scheduling/organizations/{organization_pk}/waitlist/{id}/promote/

### Assessment & progress

POST /api/assessment/organizations/{organization_pk}/bookings/{booking_id}/

GET /api/assessment/organizations/{organization_pk}/review/queue/

GET /api/assessment/organizations/{organization_pk}/{id}/

POST /api/assessment/organizations/{organization_pk}/{id}/review/

GET /api/assessment/organizations/{organization_pk}/mine/

GET /api/assessment/organizations/{organization_pk}/child/

GET /api/assessment/organizations/{organization_pk}/progress/mine/

GET /api/assessment/organizations/{organization_pk}/progress/child/

GET /api/assessment/organizations/{organization_pk}/reports/teachers/

GET/POST/PATCH rubric resources

GET/POST snapshot resources

### Pricing & payouts

GET/POST /api/pricing/organizations/{organization_pk}/agreements/

GET /api/pricing/organizations/{organization_pk}/agreements/mine/

POST /api/payouts/organizations/{organization_pk}/generate/

POST /api/payouts/organizations/{organization_pk}/{id}/finalize/

GET /api/payouts/organizations/{organization_pk}/lead/

GET /api/payouts/organizations/{organization_pk}/mine/

GET /api/payouts/organizations/{organization_pk}/statements/

GET /api/payouts/organizations/{organization_pk}/statements/mine/

### Imports

POST /api/imports/organizations/{organization_pk}/validate/

POST /api/imports/organizations/{organization_pk}/{id}/commit/

### Notifications

GET /api/notifications/organizations/{organization_pk}/mine/

GET /api/notifications/organizations/{organization_pk}/{id}/

POST /api/notifications/organizations/{organization_pk}/{id}/read/

GET /api/notifications/organizations/{organization_pk}/admin/

GET /api/notifications/organizations/{organization_pk}/deliveries/

### Audit

GET /api/organizations/{organization_pk}/audit-logs/

GET /api/organizations/{organization_pk}/audit-logs/{id}/

This inventory intentionally summarizes the supplied schema. The generated client must remain derived from the full OpenAPI file so request/response fields, enums, pagination and validation constraints do not drift.

# 10. Role-Based Home Experiences

| **Role** | **Home should answer first** |
| --- | --- |
| Owner/Admin | What needs attention today? What is happening in the academy? |
| Lead Teacher | Which teaching, placement and review tasks need attention? |
| Teacher | What classes do I teach today and what action follows each class? |
| Parent | What is happening with my children next? How is their learning progressing? |
| Student | What is my next class and how is my learning progressing? |

## Admin dashboard

Greeting + academy
KPI strip: students | teachers | classes | revenue (where contracted)
Today's classes
Needs attention: placement reviews | invitations | import failures | assessments
Academy activity

## Teacher day flow

Today's class → Join class → Attendance → Notes → Begin assessment → Submit → Next session

## Parent flow

Children → child card → next class → progress → assessment history → relevant notifications

## Student flow

Next class → Join → Learning progress → Recent assessment → Profile

# 11. Major User Journeys

## A. Academy onboarding

1.  Create academy: name, country, timezone, contact

2.  Choose template or custom curriculum

3.  Invite/assign teachers

4.  Add or import students

5.  Configure class defaults: duration, capacity, cancellation, video, notifications

6.  Show academy-ready state

## B. Curriculum + placement

1.  Browse tracks and ordered levels

2.  Create/edit academy-owned curriculum where permitted

3.  Submit placement

4.  Teacher/lead reviews placement

5.  Student/parent sees placement outcome where applicable

## C. Enrollment

1.  Identify/import student

2.  Connect student to academy/program/track state

3.  Confirm enrollment state

4.  Move into scheduling flow

## D. Schedule a class

1.  Choose student / enrollment

2.  Select track + level

3.  Choose preferred teacher when applicable

4.  Request backend-valid availability/routing options

5.  Confirm booking

6.  Surface join information when the session is ready

## E. Teach and assess

1.  Open today's teaching list

2.  Open class details

3.  Join session

4.  Record attendance/notes

5.  Submit session assessment

6.  Preserve historical score/snapshot semantics

## F. Monitor progress

1.  Student/parent opens progress

2.  See level progression

3.  See historical assessment summaries

4.  Show snapshots/reports rather than overwriting history

## G. Finance

1.  Admin manages pricing agreements / payout workflows

2.  Teacher views own earnings/statements

3.  Never collapse family pricing and teacher payout into one model

## H. Import

1.  Upload CSV/XLSX

2.  Map columns

3.  Validate

4.  Show row-level errors

5.  Commit

6.  Show created/skipped/rejected result

## I. Notifications

1.  Show notification center

2.  Read notification

3.  Surface delivery status only where permitted

4.  Keep provider details out of core UI domain models

## J. Audit

1.  Admin opens audit list

2.  Filter by action/actor/date where supported

3.  Open immutable detail

4.  No edit affordance

# 12. Wireframe-Level Page Definitions

| **Route** | **Primary purpose** | **Definition of done** |
| --- | --- | --- |
| /app/dashboard | Role-based home | Attention-first overview; role-specific KPI cards; next actions; recent activity. |
| /app/academy | Academy configuration | Identity, status, settings, readiness and academy-level configuration. |
| /app/students | Student management | Search/filter, table on desktop, cards on mobile, create/import/enrollment actions. |
| /app/teachers | Teacher management | Membership, assignments, teaching configuration and invitations. |
| /app/curriculum | Tracks/levels/placement | Curriculum management plus placement queues and review actions. |
| /app/scheduling | Calendar + booking | Availability, calendar modes, routing options, cohort/waitlist context, booking detail. |
| /app/assessments | Assessment workspace | Teacher submission, lead review queue, history and reports by role. |
| /app/pricing | Pricing agreements | Academy/admin management; teacher/family views restricted by role. |
| /app/payouts | Payouts/statements | Admin/finance generation and finalization; teacher self-service statements/earnings. |
| /app/notifications | Notification centre | Grouped history, unread/read state, details, delivery status where allowed. |
| /app/audit | Audit log | Read-only immutable log with filters and detail. |
| /app/settings | Application settings | Preferences, notification configuration and account/academy settings by permission. |

# 13. UX State Standard

| **State** | **Required behavior** |
| --- | --- |
| Loading | Skeleton or progressive placeholder that preserves page structure. |
| Empty | Explain what is missing and give the next useful action. |
| Success | Confirm the mutation and tell the user what changed / what to do next. |
| Validation error | Show field-level errors next to the relevant input; map backend errors cleanly. |
| Forbidden (403) | Explain access limitation without exposing hidden resource details. |
| Not found (404) | Use resource-appropriate not-found state; do not leak tenant existence. |
| Unauthorized (401) | Re-authenticate or redirect to login according to session policy. |
| Network/offline | Explain connection failure and offer retry where safe. |
| Submitting/saving | Disable duplicate action and show progress. |
| Conflict | Explain that data changed elsewhere and provide safe refresh/retry path. |

| **FORM ERROR RULE** A Django validation payload such as an email-specific error should become a field-level form error—not raw JSON on the page. |
| --- |

# 14. Security & Tenant Safety

The frontend is not the security boundary. The roadmap and API contract require academy membership, role permissions and tenant-scoped backend querysets. The frontend must assume that an ID in the URL may be malicious or stale and must treat backend 403/404 responses correctly.

Always resolve the active academy against the authenticated user’s allowed memberships.

Never infer authorization solely from a client-side role check.

Never allow a cross-academy object to be attached to a request merely because the ID is known.

Do not cache tenant-specific resources without a tenant-aware query key.

Clear or invalidate tenant-specific cache data when switching academies.

Do not expose hidden fields merely because the API response contains them; honor role-appropriate serializers and UI visibility.

Audit/logging views are read-only in the UI.

# 15. Observability & Supportability

The supplied frontend notes propose using request correlation in frontend error reporting. When the backend returns an X-Request-ID (or equivalent correlation identifier), surface it in the support/error experience and telemetry payload so failures can be traced end-to-end.

User action → frontend error boundary → request/correlation id → backend logs → support diagnosis

# 16. Frontend Testing Strategy

| **Layer** | **What it proves** | **Tool** |
| --- | --- | --- |
| Unit | Utilities, permission helpers, formatting, state transitions | Vitest |
| Component | Accessible rendering, interactions, form states | Testing Library |
| API integration | Typed client mapping, query/mutation behavior | Vitest + mocked API/MSW where adopted |
| E2E | Real role journeys across protected routes | Playwright |
| Responsive QA | Desktop/tablet/mobile layout invariants | Playwright + visual review |
| Accessibility | Keyboard, labels, focus, semantics and contrast checks | Testing Library + axe/Playwright tooling |

## Minimum critical E2E journeys

1.  Register/login → current user → academy selection

2.  Admin creates/configures academy or reaches a usable onboarding state

3.  Admin invites teacher → teacher sees correct academy context

4.  Admin adds/imports student → student appears in correct tenant

5.  Student/parent sees only permitted academy data

6.  Teacher opens today’s class → joins → submits assessment

7.  Lead reviews assessment without rewriting historical teacher data

8.  Parent/student sees historical progress

9.  Admin views audit log but cannot edit it

10.  Switch academy → tenant data and cache switch cleanly

# 17. Phase 13 Implementation Order

| **Phase** | **Scope** |
| --- | --- |
| 13.0 — Frontend architecture | Next.js scaffold; TypeScript; Tailwind; design tokens; OpenAPI generation; env config; lint/format/test; CI. |
| 13.1 — Design system | Colors, type, spacing, primitives, layouts, states, accessibility and responsive rules. |
| 13.2 — Authentication | Login, logout, register, invitation acceptance, current-user state, protected routes, auth errors. |
| 13.3 — Academy context | Memberships, academy switcher, selected academy, onboarding state, academy settings. |
| 13.4 — Admin foundation | Dashboard, academy, staff, students, curriculum, basic imports. |
| 13.5 — Scheduling | Availability, calendar, booking, cohorts, routing, teacher assignment, class details. |
| 13.6 — Teaching | Teacher dashboard, today’s classes, class joining, attendance/notes, assessment, progress. |
| 13.7 — Parent & student | Child dashboard, student dashboard, schedule, progress, assessments, join class. |
| 13.8 — Finance | Pricing, agreements, teacher earnings, payouts, statements. |
| 13.9 — Notifications & audit | Notification centre, delivery status, audit log. |
| 13.10 — Imports | CSV/XLSX upload, mapping, validation, commit, result reporting. |
| 13.11 — Production UX | Accessibility, responsiveness, errors, performance, security review, telemetry, E2E, deployment. |

# 18. Explicit Non-Goals / Anti-Patterns

Do not build one giant dashboard for all roles.

Do not copy Django models directly into page design.

Do not put business rules in React.

Do not start with a sophisticated global search engine before core workflows work.

Do not use Redux everywhere without a demonstrated state-management need.

Do not build a separate mobile app in this phase; ship responsive web first.

Do not imply payment gateway/accounting capabilities that are not in the current product contract.

Do not hard-code WhatsApp/Telegram/Jitsi payload logic into frontend domain models; the notification/video abstractions should stay provider-neutral.

# 19. Frontend Definition of Ready

1.  The active API contract is represented by the supplied OpenAPI schema and generated frontend types/client.

2.  Authentication behavior is decided against the real token contract.

3.  Academy membership/selection semantics are explicit.

4.  Role navigation and route guards are defined.

5.  Design-system primitives exist for the workflow being built.

6.  The page has loading, empty, error, forbidden and success states defined.

7.  The user journey has a concrete backend path for every mutation it needs.

# Frontend Definition of Done

1.  Desktop, tablet and mobile behavior is verified.

2.  Keyboard and accessible-form behavior is verified.

3.  API errors are mapped into user-friendly UI.

4.  No direct API calls exist inside presentation components.

5.  Tenant-aware query keys/cache invalidation are correct.

6.  Critical journey is covered by automated test(s).

7.  No unauthorized action is offered in the UI, while backend authorization remains authoritative.

8.  The implementation is reflected in this specification if it changes route, UX, architecture or user-visible behavior.

# 20. Decision & Open-Question Ledger

| **ID** | **Decision / question** | **Status** | **Rule for engineers** |
| --- | --- | --- | --- |
| D-01 | Frontend architecture is Phase 13 and design-first. | LOCKED | Follow 13.0 → 13.11 sequence. |
| D-02 | Next.js + React + TypeScript is the primary stack. | LOCKED | Do not introduce a parallel frontend stack. |
| D-03 | OpenAPI-generated client/types are canonical for API integration. | LOCKED | No hand-maintained duplicate API type layer. |
| D-04 | TanStack Query owns server state; Redux is not initial default. | LOCKED | Add global state only for a demonstrated need. |
| D-05 | Academy context is tenant-aware and role-aware. | LOCKED | All feature data must be academy-safe. |
| D-06 | Payment gateway/accounting are not implied by current finance UX. | LOCKED | Do not design unsupported payment collection. |
| O-01 | Exact token storage strategy for DRF token auth. | OPEN | Resolve in auth/security implementation before production. |
| O-02 | Forgot-password backend flow. | OPEN | Do not ship a fake flow without a contract. |
| O-03 | Global search API. | LATER | Design extension after core workflows. |
| O-04 | Arabic UI localization coverage. | LATER | Keep architecture RTL/i18n-ready; full translation can follow. |

# 21. Changelog

| **Version** | **Date** | **Change** |
| --- | --- | --- |
| 1.0 | 13 Sep 2026 | Reframed as a frontend master specification / single source of truth. Consolidated roadmap, frontend architecture and supplied OpenAPI contract. |
| 0.x | Prior planning | Separate pre-frontend roadmap and frontend planning notes existed as separate artifacts. |

# Appendix A — Source Alignment Notes

The supplied pre-frontend roadmap establishes the SaaS architecture, tenant boundary, role model, onboarding workflow, test gate and “build around workflows” principle. The frontend notes extend that into Phase 13 with stack, design system, routes, feature organization, state handling, accessibility, RTL, import UX, security and phased implementation. The OpenAPI 0.6.0 file grounds the API sections of this specification in the supplied contract. **MAINTENANCE RULE  **At the start of each frontend phase, review this document against the current OpenAPI schema and actual backend behavior. Update this master specification when the intended UX changes; do not let implementation drift become undocumented product policy.

Single Source of Truth • Phase 13 • 13 September 2026